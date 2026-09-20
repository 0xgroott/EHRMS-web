import { Toast } from "@base-ui/react/toast"
import { Check, X } from "lucide-react"
import { useEffect } from "react"

const toastManager = Toast.createToastManager()
const pendingToastKey = "business-pending-success-toast"

export function notifySuccess(title: string) {
  toastManager.add({ title, type: "success" })
}

export function notifySuccessAfterNavigation(title: string) {
  sessionStorage.setItem(pendingToastKey, title)
}

function ToastList() {
  const { toasts } = Toast.useToastManager()
  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      className="flex w-full items-start gap-3 rounded-lg border bg-background px-4 py-3 text-foreground shadow-lg transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-ending-style:-translate-y-2 data-ending-style:opacity-0 data-starting-style:-translate-y-2 data-starting-style:opacity-0 motion-reduce:transition-none"
    >
      <Check
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-primary"
      />
      <Toast.Content className="min-w-0 flex-1">
        <Toast.Title className="text-sm leading-5 font-medium" />
      </Toast.Content>
      <Toast.Close
        aria-label="Dismiss notification"
        className="-m-1 shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <X aria-hidden="true" className="size-4" />
      </Toast.Close>
    </Toast.Root>
  ))
}

export function AppToastProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const pending = sessionStorage.getItem(pendingToastKey)
    if (!pending) return
    sessionStorage.removeItem(pendingToastKey)
    notifySuccess(pending)
  }, [])

  return (
    <Toast.Provider toastManager={toastManager} timeout={4000} limit={3}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed top-20 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 outline-none sm:right-6">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}
