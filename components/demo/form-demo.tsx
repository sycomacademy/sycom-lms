"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const selectItems = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const categoryItems = [
  { label: "CompTIA", value: "comptia" },
  { label: "ISC2", value: "isc2" },
  { label: "Cybersecurity", value: "cybersecurity" },
];

export function FormDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Basic Form Controls</h3>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sample Form</CardTitle>
            <CardDescription>
              Input, textarea, select, checkbox, switch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="sg-input">Input</FieldLabel>
                  <Input id="sg-input" placeholder="Placeholder" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sg-textarea">Textarea</FieldLabel>
                  <Textarea id="sg-textarea" placeholder="Enter some text..." />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sg-select">Select</FieldLabel>
                  <Select defaultValue={null} items={selectItems}>
                    <SelectTrigger id="sg-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {selectItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox id="sg-checkbox" />
                  <FieldLabel htmlFor="sg-checkbox">Accept terms</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Switch id="sg-switch" />
                  <FieldLabel htmlFor="sg-switch">
                    Enable notifications
                  </FieldLabel>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Course Enrollment Form</h3>
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Enroll in Course</CardTitle>
            <CardDescription>
              Fill out the form below to enroll in a course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="enroll-name">Full Name</FieldLabel>
                  <Input id="enroll-name" placeholder="John Doe" />
                  <FieldDescription>
                    Enter your full legal name as it appears on your ID
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="enroll-email">Email</FieldLabel>
                  <Input
                    id="enroll-email"
                    placeholder="john@example.com"
                    type="email"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="enroll-level">
                    Experience Level
                  </FieldLabel>
                  <Select defaultValue={null} items={selectItems}>
                    <SelectTrigger id="enroll-level">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {selectItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="enroll-category">Category</FieldLabel>
                  <Select defaultValue={null} items={categoryItems}>
                    <SelectTrigger id="enroll-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categoryItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="enroll-message">
                    Additional Notes
                  </FieldLabel>
                  <Textarea
                    id="enroll-message"
                    placeholder="Any special requirements or questions..."
                  />
                </Field>
                <Field orientation="horizontal">
                  <Checkbox id="enroll-terms" />
                  <FieldLabel htmlFor="enroll-terms">
                    I agree to the terms and conditions
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Switch id="enroll-newsletter" />
                  <FieldLabel htmlFor="enroll-newsletter">
                    Subscribe to course updates
                  </FieldLabel>
                </Field>
                <div className="flex gap-2 pt-2">
                  <Button type="submit">Enroll Now</Button>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
