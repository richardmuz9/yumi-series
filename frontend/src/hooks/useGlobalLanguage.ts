import { useEffect } from 'react'
import { useStore } from '../store'
import { getTranslation } from '../translations'

export const useGlobalLanguage = () => {
  const { language, setLanguage } = useStore()
  const t = getTranslation(language)

  // Update document language attribute for accessibility
  useEffect(() => {
    document.documentElement.lang = getLanguageCode(language)
  }, [language])

  // Update page title when language changes
  useEffect(() => {
    document.title = `${t.title} - AI-Powered Productivity Suite`
  }, [language, t.title])

  const getLanguageCode = (lang: string): string => {
    switch (lang) {
      case 'zh': return 'zh-CN'
      case 'ja': return 'ja-JP'
      case 'ko': return 'ko-KR'
      default: return 'en-US'
    }
  }

  const getLanguageFlag = (lang: string): string => {
    switch (lang) {
      case 'en': return '🇺🇸'
      case 'zh': return '🇨🇳'
      case 'ja': return '🇯🇵'
      case 'ko': return '🇰🇷'
      default: return '🌐'
    }
  }

  const getLanguageName = (lang: string): string => {
    switch (lang) {
      case 'en': return 'English'
      case 'zh': return '中文'
      case 'ja': return '日本語'
      case 'ko': return '한국어'
      default: return 'English'
    }
  }

  const switchLanguage = (newLanguage: 'en' | 'zh' | 'ja' | 'ko') => {
    console.log('🌍 Switching language to:', newLanguage)
    setLanguage(newLanguage)
    
    // Force document update
    document.documentElement.lang = getLanguageCode(newLanguage)
    
    // Trigger a custom event for components that need to react to language changes
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: newLanguage, translations: getTranslation(newLanguage) }
    }))

    // Store language preference
    localStorage.setItem('yumiLanguage', newLanguage)
    
    // Force a small delay to ensure state updates propagate
    setTimeout(() => {
      // Trigger a page refresh for components that don't listen to the event
      window.dispatchEvent(new CustomEvent('forceRerender'))
    }, 100)
    
    // Analytics tracking for language changes
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'language_change', {
        event_category: 'User Preference',
        event_label: newLanguage,
        value: 1
      })
    }
  }

  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ] as const

  return {
    language,
    translations: t,
    switchLanguage,
    getLanguageFlag,
    getLanguageName,
    getLanguageCode,
    availableLanguages
  }
}

export default useGlobalLanguage 