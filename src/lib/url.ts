export function isUrl(text: string): boolean {
  return /^https?:\/\/\S+$/i.test(text.trim())
}

export function isSafeUrl(text: string): boolean {
  try {
    const u = new URL(text.trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export async function openExternal(url: string) {
  const w = window as any
  if (w.Capacitor?.isNativePlatform?.()) {
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url })
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}



// export function isUrl(text: string): boolean {
//   return /^https?:\/\/\S+$/i.test(text.trim())
// }

// export function isSafeUrl(text: string): boolean {
//   try {
//     const u = new URL(text.trim())
//     return u.protocol === 'http:' || u.protocol === 'https:'
//   } catch {
//     return false
//   }
// }

// export function openExternal(url: string) {
//   window.open(url, '_blank', 'noopener,noreferrer')
// }