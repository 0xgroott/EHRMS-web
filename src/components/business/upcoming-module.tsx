import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function UpcomingModule({
  title,
  description,
  delivery,
}: {
  title: string
  description: string
  delivery: string
}) {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Business portal"
        title={title}
        description={description}
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <Badge variant="secondary">Coming in a later slice</Badge>
          <CardTitle>This workflow is on the way</CardTitle>
          <CardDescription>{delivery}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            Your account and premises setup are ready. This part of the portal
            will become available as the next workflows are delivered.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            nativeButton={false}
            role="link"
            render={<a href="/business/dashboard" />}
            className="min-h-11"
          >
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            Return to dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
