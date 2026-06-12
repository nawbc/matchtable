type CookieSerializeOptions = {
  maxAge?: number
  path?: string
  domain?: string
  sameSite?: 'strict' | 'lax' | 'none' | boolean
  secure?: boolean
  httpOnly?: boolean
}

function parseDocumentCookies(): Record<string, string> {
  const cookies: Record<string, string> = {}
  if (!document.cookie) return cookies

  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const name = trimmed.slice(0, eq).trim()
    const rawValue = trimmed.slice(eq + 1)
    try {
      cookies[name] = decodeURIComponent(rawValue)
    } catch {
      cookies[name] = rawValue
    }
  }

  return cookies
}

function serializeDocumentCookie(
  name: string,
  value: string,
  options?: CookieSerializeOptions,
): string {
  let serialized = `${name}=${encodeURIComponent(value)}`

  if (!options) return serialized

  if (options.maxAge !== undefined) {
    serialized += `; Max-Age=${options.maxAge}`
  }
  if (options.path) {
    serialized += `; Path=${options.path}`
  }
  if (options.domain) {
    serialized += `; Domain=${options.domain}`
  }
  if (options.sameSite !== undefined) {
    const sameSite =
      typeof options.sameSite === 'boolean'
        ? options.sameSite
          ? 'Strict'
          : undefined
        : options.sameSite
    if (sameSite) {
      serialized += `; SameSite=${sameSite}`
    }
  }
  if (options.secure) {
    serialized += '; Secure'
  }

  return serialized
}

export function createDocumentCookieStore() {
  return {
    getAll() {
      const parsed = parseDocumentCookies()
      return Object.keys(parsed).map((name) => ({
        name,
        value: parsed[name] ?? '',
      }))
    },
    setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieSerializeOptions }>) {
      for (const { name, value, options } of cookiesToSet) {
        document.cookie = serializeDocumentCookie(name, value, options)
      }
    },
  }
}
