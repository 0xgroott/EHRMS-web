import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"

export type Theme = "light" | "dark"

export const themeStorageKey = "ehrcms:theme"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function savedTheme(storage: Pick<Storage, "getItem"> | undefined): Theme {
  try {
    return storage?.getItem(themeStorageKey) === "dark" ? "dark" : "light"
  } catch {
    return "light"
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.style.colorScheme = theme
}

export const themeBootstrapScript = `(()=>{try{const t=localStorage.getItem("${themeStorageKey}")==="dark"?"dark":"light";document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.style.colorScheme=t}catch{}})()`

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    applyTheme(nextTheme)
    try {
      window.localStorage.setItem(themeStorageKey, nextTheme)
    } catch {
      // The visual preference still applies when storage is unavailable.
    }
  }, [])

  useEffect(() => {
    const restoredTheme = savedTheme(window.localStorage)
    setThemeState(restoredTheme)
    applyTheme(restoredTheme)

    function syncTheme(event: StorageEvent) {
      if (event.key !== themeStorageKey) return
      const nextTheme: Theme = event.newValue === "dark" ? "dark" : "light"
      setThemeState(nextTheme)
      applyTheme(nextTheme)
    }

    window.addEventListener("storage", syncTheme)
    return () => window.removeEventListener("storage", syncTheme)
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [setTheme, theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
