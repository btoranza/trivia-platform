import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

const base =
  "press border-brutal inline-flex h-16 w-full items-center justify-center px-5 text-center";

const variants: Record<Variant, string> = {
  primary: "bg-accent font-display text-xl uppercase text-ink",
  secondary: "bg-surface font-sans text-lg font-bold text-ink",
};

type Props = {
  variant?: Variant;
  href?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function Button({ variant = "primary", href, children, ...rest }: Props) {
  const className = `${base} ${variants[variant]}`;
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={className} {...rest}>
      {children}
    </button>
  );
}
