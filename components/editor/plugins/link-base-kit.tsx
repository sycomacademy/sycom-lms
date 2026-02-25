import { LinkPlugin } from "@platejs/link/react";

import { LinkElement } from "@/components/editor/plate-ui/nodes/link-node";

export const BaseLinkKit = [LinkPlugin.withComponent(LinkElement)];
