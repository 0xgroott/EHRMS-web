import { createFileRoute } from "@tanstack/react-router"
import { EhoPortal } from "@/features/eho/eho-shell"

export const Route = createFileRoute("/eho/_portal")({ component: EhoPortal })
