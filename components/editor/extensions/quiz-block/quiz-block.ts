import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { QuizBlockView } from "./quiz-block-view";

export interface QuizBlockOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    quizBlock: {
      setQuizBlock: (options: {
        question: string;
        options: string[];
        correctIndex: number;
        correctIndexes?: number[];
        allowMultiple?: boolean;
      }) => ReturnType;
    };
  }
}

export const QuizBlock = Node.create<QuizBlockOptions>({
  name: "quizBlock",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      question: { default: "Your question here?" },
      options: {
        default: ["Option A", "Option B", "Option C", "Option D"],
        parseHTML: (element) => {
          const raw = element.getAttribute("data-options");
          try {
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({
          "data-options": JSON.stringify(attributes.options),
        }),
      },
      correctIndex: { default: 0 },
      correctIndexes: {
        default: [],
        parseHTML: (element) => {
          const raw = element.getAttribute("data-correct-indexes");
          try {
            const parsed = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(parsed)) {
              return [];
            }

            return parsed.filter((index) => Number.isInteger(index));
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({
          "data-correct-indexes": JSON.stringify(
            attributes.correctIndexes ?? []
          ),
        }),
      },
      allowMultiple: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute("data-allow-multiple") === "true",
        renderHTML: (attributes) => ({
          "data-allow-multiple": String(Boolean(attributes.allowMultiple)),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="quiz-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "quiz-block",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuizBlockView);
  },

  addCommands() {
    return {
      setQuizBlock:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
