import { createFileRoute } from "@tanstack/react-router"
import { MohHomePage } from "@/features/moh/moh-pages"

export const Route = createFileRoute("/moh/home")({ component: MohHomePage })
