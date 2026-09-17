// AI Service Factory & Provider Selector (Section XLVI, XLVII)

import { AIProvider } from './provider';
import { RuleBasedAIProvider } from './rule-based-provider';

// Default singleton provider
let currentProvider: AIProvider = new RuleBasedAIProvider();

export function getAIProvider(): AIProvider {
  return currentProvider;
}

export function setAIProvider(provider: AIProvider): void {
  currentProvider = provider;
}

export { RuleBasedAIProvider };
export * from './provider';
export * from './prompts/article';
export * from './prompts/extractor';
export * from './prompts/fact-check';
export * from './prompts/privacy';
export * from './prompts/topic';
export * from './prompts/video';
