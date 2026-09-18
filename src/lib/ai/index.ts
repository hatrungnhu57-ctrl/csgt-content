// AI Service Factory & Provider Selector (Section XLVI, XLVII)

import { AIProvider } from './provider';
import { RuleBasedAIProvider } from './rule-based-provider';
import { SmartOnlineAIProvider } from './smart-online-provider';
import { UnitProfile } from '../store/types';

// Default singleton provider
let currentProvider: AIProvider = new RuleBasedAIProvider();

export function getAIProvider(unit?: UnitProfile): AIProvider {
  if (unit && unit.api_key && unit.api_key.trim()) {
    return new SmartOnlineAIProvider(unit.api_key, unit.ai_provider || 'openai', unit.ai_model);
  }
  return currentProvider;
}

export function setAIProvider(provider: AIProvider): void {
  currentProvider = provider;
}

export { RuleBasedAIProvider, SmartOnlineAIProvider };
export * from './provider';
export * from './prompts/article';
export * from './prompts/extractor';
export * from './prompts/fact-check';
export * from './prompts/privacy';
export * from './prompts/topic';
export * from './prompts/video';
