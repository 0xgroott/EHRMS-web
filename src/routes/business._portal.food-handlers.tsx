import { createFileRoute } from "@tanstack/react-router"
import { UpcomingModule } from "@/components/business/upcoming-module"

export const Route = createFileRoute("/business/_portal/food-handlers")({
  component: () => (
    <UpcomingModule
      title="Food handlers"
      description="Add and manage the people who handle food at your premises."
      delivery="Slice 2 · Food handlers and Fitness Certificate"
    />
  ),
})
