import Link from "next/link";
import { ArrowIcon } from "./ArrowIcon";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

const base =
  "press border-brutal inline-flex h-16 w-full items-center justify-center gap-2 whitespace-nowrap px-4 text-center";

const variants: Record<Variant, string> = {
  primary: "bg-accent font-display text-xl uppercase text-ink",
  secondary: "bg-surface font-sans text-lg font-bold text-ink",
};

type Props = {
  variant?: Variant;
  href?: string;
  /** Adds an arrow icon after (right) or before (left) the label. */
  arrow?: "left" | "right";
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function Button({
  variant = "primary",
  href,
  arrow,
  children,
  ...rest
}: Props) {
  const className = `${base} ${variants[variant]}`;
  const content = (
    <>
      {arrow === "left" && <ArrowIcon direction="left" />}
      {children}
      {arrow === "right" && <ArrowIcon />}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={className} {...rest}>
      {content}
    </button>
  );
}
