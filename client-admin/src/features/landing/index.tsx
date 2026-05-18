import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const Landing = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Landing Page</h1>
        <p className="text-sm text-muted-foreground">Manage the public-facing landing page content</p>
      </div>
      <Button size="sm" variant="outline">
        <ExternalLink /> Preview
      </Button>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Main headline and call-to-action content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
            Content editor coming soon
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Section</CardTitle>
          <CardDescription>Subscription plans and pricing tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
            Content editor coming soon
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Page Sections</CardTitle>
        <CardDescription>All configurable sections of the landing page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {['Hero', 'Features', 'Why It Works', 'Testimonials', 'Pricing', 'CTA'].map(
          (section, i, arr) => (
            <div key={section}>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm font-medium">{section}</span>
                <Button size="sm" variant="ghost" className="h-7 text-xs">
                  Edit
                </Button>
              </div>
              {i < arr.length - 1 && <Separator />}
            </div>
          ),
        )}
      </CardContent>
    </Card>
  </div>
)

export default Landing
