import { useId } from "react"
import type { ReactNode } from "react"
import { ClipboardCheck, FileCheck2, ShieldCheck } from "lucide-react"
import { cn } from "cn"

type OnboardingShellProps = {
  title: string
  description: string
  step?: 1 | 2 | 3
  children: ReactNode
}

const steps = ["Account", "Verify contact", "Business and premises"]
const benefits = [
  { icon: ClipboardCheck, text: "Track your applications in one place." },
  { icon: FileCheck2, text: "Keep your certificates within reach." },
  { icon: ShieldCheck, text: "Stay on top of inspection actions." },
]

export function OnboardingShell({
  title,
  description,
  step,
  children,
}: OnboardingShellProps) {
  const id = useId()
  return (
    <main className="min-h-svh bg-background md:grid md:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)]">
      <section
        aria-label="EHRCMS Business Portal"
        className="flex flex-col bg-primary px-6 py-5 text-primary-foreground md:px-10 md:py-10 lg:px-16"
      >
        <div className="flex items-center gap-3">
          <ShieldCheck aria-hidden="true" className="size-7 shrink-0" />
          <div>
            <p className="text-lg font-semibold tracking-tight">EHRCMS</p>
            <p className="text-sm">Business Portal</p>
          </div>
        </div>
        <div className="hidden max-w-sm flex-1 flex-col justify-center gap-9 py-16 md:flex">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl leading-tight font-semibold tracking-tight">
              A clearer path to public health compliance.
            </h2>
            <p className="text-base leading-relaxed">
              Manage your business and premises requirements, from your first
              application to your next inspection.
            </p>
          </div>
          <ul className="flex flex-col gap-5">
            {benefits.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-3 text-sm leading-relaxed"
              >
                <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="hidden text-xs leading-relaxed md:block">
          Environmental Health Regulatory
          <br />
          Case Management System
        </p>
      </section>
      <section
        aria-labelledby={`${id}-title`}
        className="flex min-w-0 items-center justify-center px-6 py-9 md:px-10 md:py-12 lg:px-16"
      >
        <div className="flex w-full max-w-md flex-col gap-8">
          {step && (
            <nav aria-label="Account setup progress">
              <ol className="flex gap-4">
                {steps.map((label, index) => (
                  <li
                    key={label}
                    aria-current={step === index + 1 ? "step" : undefined}
                    className={cn(
                      "flex-1 border-t-2 pt-3 text-xs leading-relaxed",
                      step === index + 1
                        ? "border-primary font-medium text-foreground"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    <span className="mb-1 block" aria-hidden="true">
                      0{index + 1}
                    </span>
                    {label}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <header className="flex flex-col gap-2">
            <h1
              id={`${id}-title`}
              className="text-2xl font-semibold tracking-tight"
            >
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </header>
          {children}
        </div>
      </section>
    </main>
  )
}
