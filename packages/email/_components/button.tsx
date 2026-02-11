import { Button as EmailButton } from "@react-email/components";

/**
 * Email-safe button styled to match the web app's primary button.
 *
 * Uses inline styles since email clients don't support Tailwind/CSS variables.
 * Colors are hardcoded hex equivalents of our oklch design tokens:
 *   --primary:            oklch(0.2495 0.1148 261.94) -> #1a1a6e
 *   --primary-foreground: oklch(0.98 0.01 264)        -> #f5f5ff
 */
export function Button({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <EmailButton
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a6e",
        color: "#f5f5ff",
        fontSize: "14px",
        fontWeight: 500,
        lineHeight: "1.5",
        padding: "10px 20px",
        borderRadius: "6px",
        textDecoration: "none",
      }}
    >
      {children}
    </EmailButton>
  );
}
