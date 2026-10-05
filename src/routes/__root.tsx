import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { Agentation } from "agentation"

import appCss from "../styles.css?url"
import { Providers } from "@/app/providers"
import { themeBootstrapScript } from "@/app/theme"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "EHRCMS | Public Health Operations",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon/logo-green-48.svg",
        sizes: "any",
      },
      {
        rel: "apple-touch-icon",
        href: "/favicon/icon-180.png",
        sizes: "180x180",
      },
      { rel: "manifest", href: "/manifest.json" },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        {import.meta.env.DEV && <Agentation />}
        <Scripts />
      </body>
    </html>
  )
}
