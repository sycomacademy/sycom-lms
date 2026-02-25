/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: <explanation> */
"use client";

import { useMediaState } from "@platejs/media/react";
import { ResizableProvider, useResizableValue } from "@platejs/resizable";
import type { TAudioElement } from "platejs";
import type { PlateElementProps } from "platejs/react";
import { PlateElement, withHOC } from "platejs/react";
import { Caption, CaptionTextarea } from "./caption";

export const AudioElement = withHOC(
  ResizableProvider,
  function AudioElement(props: PlateElementProps<TAudioElement>) {
    const { align = "center", readOnly, unsafeUrl } = useMediaState();
    const width = useResizableValue("width");

    return (
      <PlateElement className="mb-1" {...props}>
        <figure
          className="group relative cursor-default"
          contentEditable={false}
          onDragStart={(e) => e.preventDefault()}
        >
          <div className="h-16">
            <audio className="size-full" controls src={unsafeUrl}>
              <track kind="captions" />
            </audio>
          </div>

          <Caption align={align} style={{ width }}>
            <CaptionTextarea
              placeholder="Write a caption..."
              readOnly={readOnly}
            />
          </Caption>
        </figure>

        {props.children}
      </PlateElement>
    );
  }
);
