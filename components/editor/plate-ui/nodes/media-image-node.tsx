/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: <explanation> */
"use client";

import { Image, ImagePlugin, useMediaState } from "@platejs/media/react";
import { ResizableProvider, useResizableValue } from "@platejs/resizable";
import type { TImageElement } from "platejs";
import type { PlateElementProps } from "platejs/react";
import { PlateElement, withHOC } from "platejs/react";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { cn } from "@/packages/utils/cn";
import { Caption, CaptionTextarea } from "./caption";
import { MediaToolbar } from "./media-toolbar";

export const ImageElement = withHOC(
  ResizableProvider,
  function ImageElement(props: PlateElementProps<TImageElement>) {
    const { align = "center", focused, readOnly, selected } = useMediaState();
    const width = useResizableValue("width");

    return (
      <MediaToolbar plugin={ImagePlugin}>
        <PlateElement {...props} className="py-2.5">
          <figure
            className="group relative m-0"
            contentEditable={false}
            onDragStart={(e) => e.preventDefault()}
          >
            <ResizablePanel collapsible={false}>
              <ResizableHandle className={cn("left-0")} withHandle />
              <Image
                alt={props.attributes.alt as string | undefined}
                className={cn(
                  "block w-full max-w-full cursor-pointer object-cover px-0",
                  "rounded-sm",
                  focused && selected && "ring-2 ring-ring ring-offset-2"
                )}
              />
              <ResizableHandle className={cn("right-0")} withHandle />
            </ResizablePanel>

            <Caption align={align} style={{ width }}>
              <CaptionTextarea
                onFocus={(e) => {
                  e.preventDefault();
                }}
                placeholder="Write a caption..."
                readOnly={readOnly}
              />
            </Caption>
          </figure>

          {props.children}
        </PlateElement>
      </MediaToolbar>
    );
  }
);
