/**
 * Safely Base64-encodes deployment scripts (UTF-8 compatible) with a 'base64:' prefix
 * to prevent Edge WAFs (such as Hostinger CDN / Cloudflare) from false-flagging shell
 * and .htaccess commands as injection attacks.
 */
export function encodeScript(script) {
  if (!script || typeof script !== 'string') return ''
  const trimmed = script.trim()
  if (!trimmed) return ''
  try {
    const bytes = new TextEncoder().encode(trimmed)
    let binary = ''
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return 'base64:' + btoa(binary)
  } catch (err) {
    console.warn('Script base64 encoding failed, falling back to raw:', err)
    return trimmed
  }
}

/**
 * Decodes a 'base64:' prefixed script string back to readable UTF-8 text.
 * Leaves unencoded strings untouched.
 */
export function decodeScript(val) {
  if (typeof val === 'string' && val.startsWith('base64:')) {
    try {
      const binary = atob(val.slice(7))
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      return new TextDecoder().decode(bytes)
    } catch {
      return val
    }
  }
  return val || ''
}

