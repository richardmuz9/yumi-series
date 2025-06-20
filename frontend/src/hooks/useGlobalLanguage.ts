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
    console.log('[i18n] Language switch initiated from:', language, 'to:', newLanguage)
    console.log('[i18n] Current translations before switch:', Object.keys(t).slice(0, 5))
    
    setLanguage(newLanguage)
    
    // Force document update
    const newLangCode = getLanguageCode(newLanguage)
    document.documentElement.lang = newLangCode
    console.log('[i18n] Document language updated to:', newLangCode)
    
    // Get new translations
    const newTranslations = getTranslation(newLanguage)
    console.log('[i18n] New translations loaded:', Object.keys(newTranslations).slice(0, 5))
    
    // Trigger a custom event for components that need to react to language changes
    const languageChangeEvent = new CustomEvent('languageChanged', {
      detail: { 
        language: newLanguage, 
        translations: newTranslations,
        previousLanguage: language,
        timestamp: Date.now()
      }
    })
    
    console.log('[i18n] Dispatching languageChanged event with detail:', languageChangeEvent.detail)
    window.dispatchEvent(languageChangeEvent)

    // Store language preference
    localStorage.setItem('yumiLanguage', newLanguage)
    console.log('[i18n] Language preference stored in localStorage')
    
    // Force a small delay to ensure state updates propagate
    setTimeout(() => {
      console.log('[i18n] Dispatching forceRerender event')
      // Trigger a page refresh for components that don't listen to the event
      window.dispatchEvent(new CustomEvent('forceRerender', {
        detail: { language: newLanguage, timestamp: Date.now() }
      }))
    }, 100)
    
    // Verify the change took effect
    setTimeout(() => {
      console.log('[i18n] Post-switch verification:')
      console.log('  - Current language state:', language)
      console.log('  - Document lang attribute:', document.documentElement.lang)
      console.log('  - LocalStorage value:', localStorage.getItem('yumiLanguage'))
    }, 200)
    
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