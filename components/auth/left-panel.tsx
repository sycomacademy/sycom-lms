"use client";

import { FlickeringGrid } from "../layout/flickering-grid";

export function AuthLeftPanel() {
  return (
    <FlickeringGrid
      className="absolute inset-0 z-0 bg-primary/70 dark:bg-primary"
      color="rgb(254, 243, 199)"
      flickerChance={0.1}
      gridGap={12}
      maxOpacity={0.12}
      squareSize={24}
    />
  );
}
