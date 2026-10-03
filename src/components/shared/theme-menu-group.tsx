import { Check, Moon, Sun } from "lucide-react"
import { useTheme } from "@/app/theme"
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export function ThemeMenuGroup() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>Theme</DropdownMenuLabel>
      <DropdownMenuItem
        role="menuitemradio"
        aria-checked={theme === "light"}
        onClick={() => setTheme("light")}
        className="min-h-11"
      >
        <Sun aria-hidden="true" />
        Light
        {theme === "light" && <Check className="ml-auto" aria-hidden="true" />}
      </DropdownMenuItem>
      <DropdownMenuItem
        role="menuitemradio"
        aria-checked={theme === "dark"}
        onClick={() => setTheme("dark")}
        className="min-h-11"
      >
        <Moon aria-hidden="true" />
        Dark
        {theme === "dark" && <Check className="ml-auto" aria-hidden="true" />}
      </DropdownMenuItem>
    </DropdownMenuGroup>
  )
}
