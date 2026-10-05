import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { MohAccountMenu } from "./moh-account-menu"

export function MohHeader({
  title,
  accountName,
  councilName,
  onSignOut,
  roleLabel = "MOH",
  showAccount = true,
}: {
  showAccount?: boolean
  roleLabel?: string
  title: string
  accountName: string
  councilName: string
  onSignOut: () => void
}) {
  const { isMobile, openMobile } = useSidebar()

  return (
    <header className="sticky top-0 z-20 flex min-h-16 min-w-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur md:gap-3 md:px-6">
      <SidebarTrigger
        size="icon"
        className="size-11 shrink-0"
        aria-label={
          isMobile
            ? `Open ${roleLabel} navigation`
            : `Toggle ${roleLabel} navigation`
        }
        aria-expanded={isMobile ? openMobile : undefined}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold" title={title}>
          {title}
        </p>
      </div>
      {showAccount && (
        <MohAccountMenu
          accountName={accountName}
          councilName={councilName}
          onSignOut={onSignOut}
          roleLabel={roleLabel}
        />
      )}
    </header>
  )
}
