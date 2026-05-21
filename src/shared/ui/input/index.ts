import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Input } from "./Input.vue"

const inputBase =
  "file:text-foreground placeholder:text-text-placeholder text-foreground focus:text-foreground active:text-foreground selection:bg-primary selection:text-white dark:bg-input/30 w-full min-w-0 rounded-md border bg-background px-3 py-1 text-base outline-none transition-colors duration-200 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted aria-invalid:border-destructive aria-invalid:text-destructive aria-invalid:placeholder:text-destructive/70 data-[state=error]:border-destructive data-[state=error]:text-destructive data-[state=error]:placeholder:text-destructive/70 data-[state=warning]:border-warning data-[state=warning]:text-warning data-[state=warning]:placeholder:text-warning/70 data-[state=success]:border-primary data-[state=success]:text-primary data-[state=success]:placeholder:text-primary/70"

export const inputVariants = cva(inputBase, {
  variants: {
    variant: {
      default: "border-input hover:border-primary focus:border-primary focus-visible:border-primary active:border-input",
      primary: "border-input hover:border-primary focus:border-primary active:border-primary",
      secondary:
        "border-transparent bg-muted placeholder:text-secondary hover:bg-background hover:border-primary focus:bg-background focus:border-primary active:bg-background active:border-primary aria-invalid:bg-background data-[state=error]:bg-background data-[state=warning]:bg-background data-[state=success]:bg-background",
    },
    size: {
      sm: "h-8 px-2.5 text-sm",
      default: "h-9 text-base",
      lg: "h-10 px-4 text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export type InputVariants = VariantProps<typeof inputVariants>

export const inputVariant = {
  default: "default",
  primary: "primary",
  secondary: "secondary",
} as const

export const inputSize = {
  sm: "sm",
  default: "default",
  lg: "lg",
} as const
