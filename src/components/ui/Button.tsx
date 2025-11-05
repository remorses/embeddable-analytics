// Tremor Button [v1.0.0]

import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { tv, type VariantProps } from "tailwind-variants"

import { cx, focusRing } from "../../lib/utils"

const buttonVariants = tv({
  base: [
    "relative inline-flex items-center justify-center whitespace-nowrap rounded-md border px-3 py-2 text-center text-sm font-medium shadow-xs transition-all duration-100",
    "outline-hidden",
    focusRing,
  ],
  variants: {
    variant: {
      primary: [
        "border-transparent bg-blue-500 text-white",
        "hover:bg-blue-600",
        "disabled:pointer-events-none",
        "disabled:bg-blue-300 disabled:text-white",
        "dark:bg-blue-500 dark:hover:bg-blue-400",
        "dark:disabled:bg-blue-700",
      ],
      secondary: [
        "border-border bg-background text-foreground",
        "hover:bg-accent",
        "disabled:pointer-events-none",
        "disabled:border-border disabled:bg-muted disabled:text-muted-foreground",
      ],
      light: [
        "border-transparent bg-muted text-foreground",
        "hover:bg-accent",
        "disabled:pointer-events-none",
        "disabled:bg-muted disabled:text-muted-foreground",
      ],
      ghost: [
        "border-transparent text-foreground shadow-none",
        "hover:bg-accent",
        "disabled:pointer-events-none",
        "disabled:text-muted-foreground",
      ],
      destructive: [
        "border-transparent bg-red-500 text-white shadow-none",
        "hover:bg-red-600",
        "disabled:pointer-events-none",
        "disabled:bg-red-300 disabled:text-white",
        "dark:bg-red-700 dark:hover:bg-red-600",
        "dark:disabled:bg-red-800",
      ],
    },
  },
  defaultVariants: {
    variant: "primary",
  },
})

interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild, variant, ...props }: ButtonProps, forwardedRef) => {
    const Component = asChild ? Slot : "button"
    return (
      <Component
        ref={forwardedRef}
        className={cx(buttonVariants({ variant }), className)}
        tremor-id="tremor-raw"
        {...props}
      />
    )
  },
)

Button.displayName = "Button"

export { Button, buttonVariants, type ButtonProps }
