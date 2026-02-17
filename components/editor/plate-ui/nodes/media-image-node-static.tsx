import type { TCaptionProps, TImageElement, TResizableProps } from "platejs";
import { NodeApi } from "platejs";
import type { SlateElementProps } from "platejs/static";
import { SlateElement } from "platejs/static";

import { cn } from "@/packages/utils/cn";

export function ImageElementStatic(
  props: SlateElementProps<TImageElement & TCaptionProps & TResizableProps>
) {
  const { align = "center", caption, url, width } = props.element;

  return (
    <SlateElement {...props} className="py-2.5">
      <figure className="group relative m-0 inline-block" style={{ width }}>
        <div
          className="relative min-w-[92px] max-w-full"
          style={{ textAlign: align }}
        >
          {/** biome-ignore lint/performance/noImgElement: editor kit */}
          {/** biome-ignore lint/correctness/useImageSize: editor kit */}
          <img
            // biome-ignore lint/suspicious/noExplicitAny: editor kit
            alt={(props.attributes as any).alt}
            className={cn(
              "w-full max-w-full cursor-default object-cover px-0",
              "rounded-sm"
            )}
            src={url}
          />
          {caption && (
            <figcaption
              className="mx-auto mt-2 h-[24px] max-w-full"
              style={{ textAlign: "center" }}
            >
              {NodeApi.string(caption[0])}
            </figcaption>
          )}
        </div>
      </figure>
      {props.children}
    </SlateElement>
  );
}
