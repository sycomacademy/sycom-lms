import { cva, type VariantProps } from "class-variance-authority";
import type { PlateElementProps } from "platejs/react";
import { PlateElement } from "platejs/react";

const headingVariants = cva("relative mb-1", {
  variants: {
    variant: {
      h1: "mt-[1.6em] pb-1 font-bold font-heading text-4xl",
      h2: "mt-[1.4em] pb-px font-heading font-semibold text-2xl tracking-tight",
      h3: "mt-[1em] pb-px font-heading font-semibold text-xl tracking-tight",
      h4: "mt-[0.75em] font-heading font-semibold text-lg tracking-tight",
      h5: "mt-[0.75em] font-semibold text-lg tracking-tight",
      h6: "mt-[0.75em] font-semibold text-base tracking-tight",
    },
  },
});

type HeadingElementStaticProps = PlateElementProps &
  VariantProps<typeof headingVariants>;

export function HeadingElementStatic({
  variant = "h1",
  ...props
}: HeadingElementStaticProps) {
  const id = props.element.id as string | undefined;

  return (
    <PlateElement
      as={variant ?? "h1"}
      className={headingVariants({ variant })}
      {...props}
    >
      {/* Bookmark anchor for DOCX TOC internal links */}
      {id && <span id={id} />}
      {props.children}
    </PlateElement>
  );
}

export function H1ElementStatic(props: PlateElementProps) {
  return <HeadingElementStatic variant="h1" {...props} />;
}

export function H2ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h2" {...props} />;
}

export function H3ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h3" {...props} />;
}

export function H4ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h4" {...props} />;
}

export function H5ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h5" {...props} />;
}

export function H6ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h6" {...props} />;
}
