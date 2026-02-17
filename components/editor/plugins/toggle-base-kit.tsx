import { BaseTogglePlugin } from "@platejs/toggle";

import { ToggleElementStatic } from "@/components/editor/plate-ui/nodes/toggle-node-static";

export const BaseToggleKit = [
  BaseTogglePlugin.withComponent(ToggleElementStatic),
];
