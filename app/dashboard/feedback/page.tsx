import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/packages/auth/auth";

export default async function DashboardFeedbackPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-semibold text-2xl tracking-tight">
          Report Feedback
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Help us improve by sharing your thoughts, suggestions, or reporting
          issues
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
          <p className="text-muted-foreground text-sm">
            We read every submission and use your feedback to make the platform
            better.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief summary of your feedback"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                id="category"
              >
                <option value="">Select a category</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="content">Content Issue</option>
                <option value="general">General Feedback</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                className="min-h-32"
                id="message"
                placeholder="Describe your feedback in detail..."
              />
            </div>

            <div className="flex justify-end">
              <Button disabled type="submit">
                Submit Feedback
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
