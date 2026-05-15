import { describe, expect, it } from 'vitest'
import { RU_PHONE_INPUT_MASK } from '../../src/shared/lib/ru-phone-input-mask'

describe('constants', () => {
  it('RU_PHONE_INPUT_MASK has correct format', () => {
    expect(RU_PHONE_INPUT_MASK).toBe('+7 (###) ### ## ##')
    expect(RU_PHONE_INPUT_MASK).toContain('+7')
    expect(RU_PHONE_INPUT_MASK).toContain('#')
  })
})
