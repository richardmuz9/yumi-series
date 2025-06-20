import { useState, useEffect } from 'react'
import { authService } from '../../../services/api'
import type { User, AuthState } from './types'

// Generic wizard data hook
export function useWizardData<T>(initial: T) {
  const [data, setData] = useState<T>(initial)
  
  const update = <K extends keyof T>(key: K, value: T[K]) => {
    setData(d => ({ ...d, [key]: value }))
  }
  
  const updateMultiple = (updates: Partial<T>) => {
    setData(d => ({ ...d, ...updates }))
  }
  
  const reset = () => {
    setData(initial)
  }
  
  return { data, update, updateMultiple, reset }
}

// Wizard step navigation hook
export function useWizardSteps(totalSteps: number, validation?: (step: number) => boolean) {
  const [currentStep, setCurrentStep] = useState(1)
  
  const next = () => {
    if (currentStep < totalSteps && (!validation || validation(currentStep))) {
      setCurrentStep(s => s + 1)
    }
  }
  
  const prev = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1)
    }
  }
  
  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step)
    }
  }
  
  const canProceed = !validation || validation(currentStep)
  
  return {
    currentStep,
    next,
    prev,
    goToStep,
    canProceed,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps
  }
}

// Authentication hook
export function useAuth(): AuthState & { 
  checkAuth: () => Promise<void>
  logout: () => Promise<void>
} {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const checkAuth = async () => {
    try {
      // Check for demo mode
      const urlParams = new URLSearchParams(window.location.search)
      const isDemo = urlParams.get('demo') === 'true'
      
      if (isDemo) {
        console.log('[useAuth] Demo mode activated')
        setIsDemoMode(true)
        setIsAuthenticated(true)
        setUser({
          id: -1,
          email: 'demo@example.com',
          username: 'Demo User',
          tokensRemaining: 1000,
          totalTokensUsed: 0,
          freeTokensUsedThisMonth: 0,
          subscriptionStatus: 'free',
          createdAt: new Date().toISOString()
        })
        setAuthLoading(false)
        return
      }

      // Check if user is already authenticated
      if (authService.isAuthenticated()) {
        console.log('[useAuth] User already authenticated, fetching profile')
        const profileResponse = await authService.getProfile()
        
        if (profileResponse.success && profileResponse.user) {
          setUser(profileResponse.user)
          setIsAuthenticated(true)
          console.log('[useAuth] Profile loaded successfully')
        } else {
          console.warn('[useAuth] Failed to load profile:', profileResponse.error)
          setIsAuthenticated(false)
        }
      } else {
        console.log('[useAuth] User not authenticated')
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('[useAuth] Authentication check failed:', error)
      setIsAuthenticated(false)
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
      setIsDemoMode(false)
    } catch (error) {
      console.error('[useAuth] Logout failed:', error)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return {
    user,
    isAuthenticated,
    authLoading,
    isDemoMode,
    checkAuth,
    logout
  }
}

// Generate content hook
export function useContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateContent = async (
    generateFn: () => Promise<any>,
    onSuccess?: (result: any) => void,
    onError?: (error: string) => void
  ) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const result = await generateFn()
      if (onSuccess) {
        onSuccess(result)
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed'
      setError(errorMessage)
      if (onError) {
        onError(errorMessage)
      }
      throw err
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    isGenerating,
    error,
    generateContent,
    clearError: () => setError(null)
  }
}

// Local storage hook for wizard state persistence
export function usePersistedState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value
      setState(valueToStore)
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error)
    }
  }

  const clearValue = () => {
    try {
      localStorage.removeItem(key)
      setState(defaultValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  return [state, setValue, clearValue] as const
} 