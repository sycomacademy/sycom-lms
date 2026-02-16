import { BaseMentionPlugin } from "@platejs/mention";

import { MentionElementStatic } from "@/components/editor/plate-ui/static/mention-node-static";

export const BaseMentionKit = [
  BaseMentionPlugin.withComponent(MentionElementStatic),
];
