import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const PREFS_KEY = 'pinread:prefs'

export const FONT_SIZE_STEPS = [14, 15.5, 16.5, 18.5, 20.5] as const
export const FONT_SIZE_LABELS = ['极小', '小', '默认', '大', '最大'] as const

interface Prefs {
  theme: Theme
  fontSizeStep: number // 0-4，对应 FONT_SIZE_STEPS
  showAnnotations: boolean
}

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return { theme: systemPrefersDark() ? 'dark' : 'light', fontSizeStep: 2, showAnnotations: true, ...JSON.parse(raw) }
  } catch {
    // ignore
  }
  return { theme: systemPrefersDark() ? 'dark' : 'light', fontSizeStep: 2, showAnnotations: true }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs)

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    document.documentElement.classList.toggle('dark', prefs.theme === 'dark')
    document.documentElement.classList.toggle('light', prefs.theme === 'light')
  }, [prefs])

  const toggleTheme = () =>
    setPrefs((p) => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' }))

  const setFontSizeStep = (step: number) =>
    setPrefs((p) => ({ ...p, fontSizeStep: Math.max(0, Math.min(4, step)) }))

  const toggleAnnotations = () =>
    setPrefs((p) => ({ ...p, showAnnotations: !p.showAnnotations }))

  return {
    theme: prefs.theme,
    fontSizeStep: prefs.fontSizeStep,
    fontSizePx: FONT_SIZE_STEPS[prefs.fontSizeStep],
    showAnnotations: prefs.showAnnotations,
    toggleTheme,
    setFontSizeStep,
    toggleAnnotations,
  }
}
