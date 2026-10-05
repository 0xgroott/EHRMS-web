import { createFileRoute } from "@tanstack/react-router"
import { LgaPortal } from "@/features/lga/lga-shell"

export const Route = createFileRoute("/lga/_portal")({ component: LgaPortal })
