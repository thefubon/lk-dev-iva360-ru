import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3 shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        // Базовые варианты
        default: "bg-primary border-transparent text-primary-foreground hover:bg-primary/90",
        secondary: "bg-muted border border-transparent text-foreground hover:bg-muted/75 hover:text-foreground-hover",
        outline: "bg-transparent border border-border hover:bg-muted text-foreground hover:text-foreground-hover dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        ghost: "bg-transparent border border-transparent hover:bg-muted text-foreground hover:text-foreground-hover dark:hover:bg-muted/50",
        disabled: "bg-muted opacity-50 border border-transparent text-muted-foreground",
        green: "bg-background border border-primary hover:bg-brand-50 text-primary dark:hover:bg-brand-950",
        white: "bg-background border border-border hover:bg-muted text-foreground hover:text-foreground-hover",
        blue: "bg-additional-primary border-transparent text-white hover:bg-additional-primary/90",
        indigo: "bg-additional-secondary border-transparent text-white hover:bg-additional-secondary/90",
        destructive: "bg-error border-transparent text-white hover:bg-error/90",
        link: "bg-transparent border-transparent text-primary no-underline hover:underline underline-offset-4 hover:text-primary/90",
        "meetings-primary": "bg-meetings-primary border-transparent text-white hover:bg-meetings-primary/90",
        "meetings-secondary": "bg-meetings-secondary border-transparent text-meetings-primary hover:bg-meetings-primary/90 hover:text-white",
        "messenger-primary": "bg-messenger-primary border-transparent text-white hover:bg-messenger-primary/90",
        "messenger-secondary": "bg-messenger-secondary border-transparent text-messenger-primary hover:bg-messenger-primary/90 hover:text-white",
        "webinars-primary": "bg-webinars-primary border-transparent text-white hover:bg-webinars-primary/90",
        "webinars-secondary": "bg-webinars-secondary border-transparent text-webinars-primary hover:bg-webinars-primary/90 hover:text-white",
        "mail-primary": "bg-mail-primary border-transparent text-white hover:bg-mail-primary/90",
        "mail-secondary": "bg-mail-secondary border-transparent text-mail-primary hover:bg-mail-primary/90 hover:text-white",
        "drive-primary": "bg-drive-primary border-transparent text-white hover:bg-drive-primary/90",
        "drive-secondary": "bg-drive-secondary border-transparent text-drive-primary hover:bg-drive-primary/90 hover:text-white",
        "board-primary": "bg-board-primary border-transparent text-white hover:bg-board-primary/90",
        "board-secondary": "bg-board-secondary border-transparent text-board-primary hover:bg-board-primary/90 hover:text-white",
      },
      size: {
        // Кнопки
        "xs": "h-7 rounded-sm text-xs gap-1.5 px-2 has-[>svg]:px-2",
        "sm": "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        "default": "h-9 px-3 has-[>svg]:px-2.5",
        "lg": "h-10 rounded-md text-base px-4 has-[>svg]:px-4",
        // Иконки
        "icon-xs": "size-7 rounded-sm",
        "icon-sm": "size-8",
        "icon": "size-9",
        "icon-lg": "size-10",
      },
    },
    compoundVariants: [
      // Ссылка (link): текстовый вид, без кнопочных отступов/высоты.
      { variant: "link", size: "xs", class: "h-auto px-0 !text-xs" },
      { variant: "link", size: "sm", class: "h-auto px-0 !text-sm" },
      { variant: "link", size: "default", class: "h-auto px-0 !text-sm" },
      { variant: "link", size: "lg", class: "h-auto px-0 !text-base" }, // 16px
      // Иконки для ссылки (link) в доках не используются, но оставляем поведение консистентным.
      { variant: "link", size: "icon-xs", class: "size-auto px-0" },
      { variant: "link", size: "icon-sm", class: "size-auto px-0" },
      { variant: "link", size: "icon", class: "size-auto px-0" },
      { variant: "link", size: "icon-lg", class: "size-auto px-0" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>

export const buttonVariant = {
  default: "default",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
  disabled: "disabled",
  green: "green",
  white: "white",
  blue: "blue",
  indigo: "indigo",
  destructive: "destructive",
  link: "link",
  "meetings-primary": "meetings-primary",
  "meetings-secondary": "meetings-secondary",
  "messenger-primary": "messenger-primary",
  "messenger-secondary": "messenger-secondary",
  "webinars-primary": "webinars-primary",
  "webinars-secondary": "webinars-secondary",
  "mail-primary": "mail-primary",
  "mail-secondary": "mail-secondary",
  "drive-primary": "drive-primary",
  "drive-secondary": "drive-secondary",
  "board-primary": "board-primary",
  "board-secondary": "board-secondary",
} as const

export const buttonSize = {
  xs: "xs",
  sm: "sm",
  default: "default",
  lg: "lg",
  "icon-xs": "icon-xs",
  "icon-sm": "icon-sm",
  icon: "icon",
  "icon-lg": "icon-lg",
} as const
