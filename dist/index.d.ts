import { E as ExplainOptions, a as ExplainResult } from './types-tbxh32II.js';
export { b as ErrorEventLike, c as ErrorExplanation, d as ErrorSource, e as ExplainerLanguage, f as ExplainerMode, F as FixSuggestion, g as FrameworkName, P as Pattern, S as SimplifiedStack, h as StackFrame } from './types-tbxh32II.js';

declare function explainError(input: {
    message: string;
    stack?: string;
    name?: string;
    cause?: unknown;
}, options?: ExplainOptions): ExplainResult;

export { ExplainOptions, ExplainResult, explainError };
