import { useEffect, useRef } from "react"

export function BusinessSetup() {
  const redirecting = useRef(false)

  useEffect(() => {
    if (redirecting.current) return
    redirecting.current = true
    globalThis.location.assign("/business/settings#kyb")
  }, [])

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <p className="text-sm text-muted-foreground" role="status">
        Opening business verification…
      </p>
    </main>
  )
}
