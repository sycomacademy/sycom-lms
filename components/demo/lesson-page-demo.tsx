"use client";

import { ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LessonPageDemo() {
  return (
    <div className="flex h-[600px] flex-col">
      <header className="flex h-14 items-center gap-4 border-b px-6">
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Security Fundamentals</h1>
          <p className="text-muted-foreground text-xs">
            Module 1 • Lesson 3 of 8
          </p>
        </div>
        <Badge variant="outline">In Progress</Badge>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl p-6">
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Lesson Progress</span>
              <span>37%</span>
            </div>
            <Progress value={37} />
          </div>
          <Tabs defaultValue="content">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent className="mt-6" value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Security Fundamentals</CardTitle>
                  <CardDescription>
                    Understanding the core principles of information security
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">Introduction</h3>
                    <p className="text-muted-foreground">
                      Security fundamentals form the foundation of cybersecurity
                      practice. These principles guide how we protect
                      information systems and data from threats.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg">Key Concepts</h3>
                    <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                      <li>
                        Confidentiality: Ensuring information is accessible only
                        to authorized users
                      </li>
                      <li>
                        Integrity: Maintaining accuracy and completeness of data
                      </li>
                      <li>
                        Availability: Ensuring systems are accessible when
                        needed
                      </li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg">Security Models</h3>
                    <p className="text-muted-foreground">
                      Various security models help organizations implement these
                      principles effectively. The CIA triad (Confidentiality,
                      Integrity, Availability) is the most fundamental model.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent className="mt-6" value="resources">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Downloadable resources and references will appear here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent className="mt-6" value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Your Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="min-h-[200px] w-full rounded-md border border-input bg-background p-3 text-sm"
                    placeholder="Add your notes here..."
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline">Previous Lesson</Button>
            <Button>
              Next Lesson
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
