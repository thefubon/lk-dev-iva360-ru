export async function copyTextToClipboard(text: string): Promise<void> {
  if (import.meta.client && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      /* fall through to legacy copy */
    }
  }

  if (!import.meta.client || typeof document === 'undefined') {
    throw new Error('Clipboard is unavailable')
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, text.length)

  try {
    const copied = document.execCommand('copy')
    if (!copied) {
      throw new Error('execCommand("copy") returned false')
    }
  } finally {
    document.body.removeChild(textarea)
  }
}
