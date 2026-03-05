import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { ReactRenderer } from "@tiptap/react";
import type {
  SuggestionKeyDownProps,
  SuggestionProps,
} from "@tiptap/suggestion";
import Suggestion from "@tiptap/suggestion";
import type { SlashCommandItem } from "./commands";
import { getSlashCommands } from "./commands";
import type { SlashMenuRef } from "./slash-menu";
import { SlashMenu } from "./slash-menu";

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: { from: number; to: number };
          props: SlashCommandItem;
        }) => {
          editor.chain().focus().deleteRange(range).run();
          props.command(editor);
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          const commands = getSlashCommands();
          if (!query) {
            return commands;
          }
          const lower = query.toLowerCase();
          return commands.filter(
            (item) =>
              item.title.toLowerCase().includes(lower) ||
              item.description.toLowerCase().includes(lower) ||
              item.aliases?.some((a) => a.includes(lower))
          );
        },
        render: () => {
          let component: ReactRenderer<SlashMenuRef> | null = null;
          let container: HTMLDivElement | null = null;

          return {
            onStart: (props: SuggestionProps) => {
              container = document.createElement("div");
              document.body.appendChild(container);

              component = new ReactRenderer(SlashMenu, {
                props: {
                  items: props.items,
                  command: props.command,
                  clientRect: props.clientRect,
                },
                editor: props.editor,
              });

              container.appendChild(component.element);
            },

            onUpdate: (props: SuggestionProps) => {
              component?.updateProps({
                items: props.items,
                command: props.command,
                clientRect: props.clientRect,
              });
            },

            onKeyDown: (props: SuggestionKeyDownProps) => {
              if (props.event.key === "Escape") {
                container?.remove();
                component?.destroy();
                return true;
              }

              return (
                (component?.ref as SlashMenuRef | null)?.onKeyDown?.(
                  props.event
                ) ?? false
              );
            },

            onExit: () => {
              container?.remove();
              component?.destroy();
              container = null;
              component = null;
            },
          };
        },
      }),
    ];
  },
});
