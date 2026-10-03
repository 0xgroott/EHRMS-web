import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppToastProvider } from "@/components/ui/app-toast"
import { BusinessSessionProvider } from "./business-session"
import { DemoSessionProvider } from "./demo-session"
import { ThemeProvider } from "./theme"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })
  )
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BusinessSessionProvider>
          <DemoSessionProvider>
            <AppToastProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </AppToastProvider>
          </DemoSessionProvider>
        </BusinessSessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
