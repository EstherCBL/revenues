"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "motion/react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm shadow-black/10",
  secondary:
    "bg-surface border border-border text-foreground hover:bg-surface-hover",
  ghost: "text-foreground hover:bg-surface-hover",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragStart" | "onDragEnd"
>;

export const Button = forwardRef<
  HTMLButtonElement,
  NativeButtonProps & { variant?: Variant; size?: Size }
>(({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";
