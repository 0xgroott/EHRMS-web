export type MediaKind = "avatar" | "photo"

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"])
const maximumInputBytes = 8 * 1024 * 1024

export function validateBusinessImage(file: File): string | null {
  if (!allowedTypes.has(file.type)) return "Choose a PNG, JPG, or WebP image."
  if (file.size === 0) return "Choose an image that is not empty."
  if (file.size > maximumInputBytes) return "Choose an image smaller than 8 MB."
  return null
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("This image could not be opened. Choose another file."))
    }
    image.src = url
  })
}

export async function prepareBusinessImage(
  file: File,
  kind: MediaKind
): Promise<string> {
  const validation = validateBusinessImage(file)
  if (validation) throw new Error(validation)

  const image = await loadImage(file)
  const attempts =
    kind === "avatar"
      ? [
          [512, 0.82],
          [384, 0.72],
          [256, 0.62],
        ]
      : [
          [1280, 0.82],
          [1024, 0.72],
          [768, 0.62],
          [640, 0.55],
        ]
  const maximumLength = kind === "avatar" ? 240_000 : 600_000
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  if (!context)
    throw new Error("Image processing is unavailable in this browser.")

  for (const [maximumSide, quality] of attempts) {
    const scale = Math.min(1, maximumSide / Math.max(image.width, image.height))
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL("image/webp", quality)
    if (!dataUrl.startsWith("data:image/webp;base64,"))
      throw new Error(
        "This browser cannot prepare the image. Try another browser."
      )
    if (dataUrl.length <= maximumLength) return dataUrl
  }
  throw new Error("This image is too detailed to save. Choose a smaller image.")
}
