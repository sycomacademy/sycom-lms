"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
    </div>
  );
}
