"use client";

import { FlickeringGrid } from "../magicui/flickering-grid";

export function AuthLeftPanel() {
  return (
    <FlickeringGrid
      className="absolute inset-0 z-0 bg-primary/50"
      color="rgb(254, 243, 199)"
      flickerChance={0.1}
      gridGap={12}
      maxOpacity={0.12}
      squareSize={24}
    />
  );
}
