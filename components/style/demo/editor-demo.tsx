"use client";

import type { Value } from "platejs";
import { useState } from "react";
import { PlateEditor } from "@/components/editor/plate-editor";
import { Label } from "@/components/ui/label";

export function EditorDemo() {
  const [basicValue, setBasicValue] = useState<Value>(demoValue);
  const [courseValue, setCourseValue] = useState<Value>(demoValue);

  return (
    <div className="flex w-full flex-col gap-10">
      <div className="grid gap-3">
        <Label>Basic variant (fixed height, scrollable)</Label>
        <PlateEditor
          onChange={setBasicValue}
          placeholder="Start typing..."
          value={basicValue}
          variant="basic"
        />
      </div>
      <div className="grid gap-3">
        <Label>Course variant (taller, for course content)</Label>
        <PlateEditor
          onChange={setCourseValue}
          placeholder="Write detailed course content..."
          value={courseValue}
          variant="course"
        />
      </div>
    </div>
  );
}

/** Stable IDs so server and client render the same HTML (avoids hydration mismatch). */
const demoValue: Value = [
  {
    id: "demo-h1",
    children: [{ text: "Basic Editor" }],
    type: "h1",
  },
  {
    id: "demo-h2",
    children: [{ text: "Heading 2" }],
    type: "h2",
  },
  {
    id: "demo-h3",
    children: [{ text: "Heading 3" }],
    type: "h3",
  },
  {
    id: "demo-blockquote",
    children: [{ text: "This is a blockquote element" }],
    type: "blockquote",
  },
  {
    id: "demo-p",
    children: [
      { text: "Basic marks: " },
      { bold: true, text: "bold" },
      { text: ", " },
      { italic: true, text: "italic" },
      { text: ", " },
      { text: "underline", underline: true },
      { text: ", " },
      { strikethrough: true, text: "strikethrough" },
      { text: "." },
    ],
    type: "p",
  },
];
