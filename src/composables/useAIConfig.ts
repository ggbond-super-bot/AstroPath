import { useGlobalAIState, type AIConfig } from './useGlobalAIState'

export interface AIProvider {
  id: string
  name: string
  type: 'openai' | 'anthropic' | 'domestic' | 'other'
  apiKey: string
  baseUrl?: string
  model?: string
  isDefault?: boolean
  enabled?: boolean
}

interface AISettings {
  providers: AIProvider[]
  defaultProviderId: string | null
  globalConfig: AIConfig
}

const PROVIDERS_KEY = 'ai_providers'

export const ZHIPU_MODEL_ID = 'glm-4-flash'

const DEFAULT_PROVIDER: AIProvider = {
  id: 'provider-default-zhipu',
  name: '智谱 GLM-4-Flash',
  type: 'domestic',
  apiKey: '',
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  model: ZHIPU_MODEL_ID,
  isDefault: true,
  enabled: true
}

export { DEFAULT_PROVIDER }

export function useAIConfig() {
  const globalState = useGlobalAIState()

  const getProviders = (): AIProvider[] => {
    try {
      const saved = localStorage.getItem(PROVIDERS_KEY)
      return saved ? JSON.parse(saved) : [DEFAULT_PROVIDER]
    } catch {
      return [DEFAULT_PROVIDER]
    }
  }

  const saveProviders = (providers: AIProvider[]) => {
    localStorage.setItem(PROVIDERS_KEY, JSON.stringify(providers))
  }

  const addProvider = (provider: Omit<AIProvider, 'id'>): AIProvider => {
    const providers = getProviders()
    const newProvider: AIProvider = {
      ...provider,
      id: `provider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    if (providers.length === 0 || providers.every(p => p.id === DEFAULT_PROVIDER.id)) {
      newProvider.isDefault = true
    }
    
    providers.push(newProvider)
    saveProviders(providers)
    return newProvider
  }

  const updateProvider = (id: string, updates: Partial<AIProvider>): boolean => {
    const providers = getProviders()
    const index = providers.findIndex(p => p.id === id)
    
    if (index === -1) return false
    
    if (updates.isDefault) {
      providers.forEach(p => p.isDefault = false)
    }
    
    providers[index] = { ...providers[index], ...updates }
    saveProviders(providers)
    return true
  }

  const removeProvider = (id: string): boolean => {
    const providers = getProviders()
    const index = providers.findIndex(p => p.id === id)
    
    if (index === -1) return false
    
    const wasDefault = providers[index].isDefault
    providers.splice(index, 1)
    
    if (wasDefault && providers.length > 0) {
      providers[0].isDefault = true
    }
    
    saveProviders(providers)
    return true
  }

  const getDefaultProvider = (): AIProvider => {
    const providers = getProviders()
    return providers.find(p => p.isDefault && p.enabled !== false) || providers[0] || DEFAULT_PROVIDER
  }

  const setDefaultProvider = (id: string): boolean => {
    const providers = getProviders()
    const provider = providers.find(p => p.id === id)
    
    if (!provider) return false
    
    providers.forEach(p => p.isDefault = false)
    provider.isDefault = true
    saveProviders(providers)
    return true
  }

  const getGlobalConfig = (): AIConfig => {
    return globalState.getConfig()
  }

  const setGlobalConfig = (config: Partial<AIConfig>) => {
    globalState.setConfig(config)
  }

  const isConfigured = (): boolean => {
    return true
  }

  const validateProvider = (provider: Partial<AIProvider>): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (!provider.name?.trim()) {
      errors.push('请输入提供商名称')
    }
    
    if (!provider.apiKey?.trim()) {
      errors.push('请输入 API Key')
    }
    
    if (provider.type === 'other' && !provider.baseUrl?.trim()) {
      errors.push('自定义提供商需要输入 Base URL')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  const exportConfig = (): string => {
    const config: AISettings = {
      providers: getProviders(),
      defaultProviderId: getDefaultProvider()?.id || null,
      globalConfig: getGlobalConfig()
    }
    return JSON.stringify(config, null, 2)
  }

  const importConfig = (jsonStr: string): { success: boolean; error?: string } => {
    try {
      const config: AISettings = JSON.parse(jsonStr)
      
      if (!config.providers || !Array.isArray(config.providers)) {
        return { success: false, error: '配置格式无效' }
      }
      
      saveProviders(config.providers)
      
      if (config.globalConfig) {
        setGlobalConfig(config.globalConfig)
      }
      
      return { success: true }
    } catch (e) {
      return { success: false, error: '配置解析失败' }
    }
  }

  return {
    getProviders,
    saveProviders,
    addProvider,
    updateProvider,
    removeProvider,
    getDefaultProvider,
    setDefaultProvider,
    getGlobalConfig,
    setGlobalConfig,
    isConfigured,
    validateProvider,
    exportConfig,
    importConfig
  }
}
