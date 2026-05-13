import type { InjectionKey, Ref } from "vue"

export type NumberFieldSize = "sm" | "default" | "lg"
export type NumberFieldVariant = "primary" | "secondary"
export type NumberFieldState = "default" | "error" | "warning" | "success"

export const numberFieldSizeKey: InjectionKey<Ref<NumberFieldSize>> = Symbol("number-field-size")
export const numberFieldVariantKey: InjectionKey<Ref<NumberFieldVariant>> = Symbol("number-field-variant")
export const numberFieldStateKey: InjectionKey<Ref<NumberFieldState>> = Symbol("number-field-state")
