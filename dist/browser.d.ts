import { f as ExplainerMode, e as ExplainerLanguage, g as FrameworkName, a as ExplainResult } from './types-tbxh32II.js';

interface BrowserInitOptions {
    mode?: ExplainerMode;
    language?: ExplainerLanguage;
    framework?: FrameworkName;
    overlay?: boolean;
    redact?: boolean;
    onExplained?: (result: ExplainResult) => void;
}
interface BrowserController {
    stop: () => void;
}
declare function initAutoErrorExplainer(options?: BrowserInitOptions): BrowserController;

export { type BrowserController, type BrowserInitOptions, initAutoErrorExplainer };
