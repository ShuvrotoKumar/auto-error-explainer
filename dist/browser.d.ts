import { f as ExplainerMode, e as ExplainerLanguage, a as ExplainResult } from './types-BZ2cTa_U.js';

interface BrowserInitOptions {
    mode?: ExplainerMode;
    language?: ExplainerLanguage;
    overlay?: boolean;
    redact?: boolean;
    onExplained?: (result: ExplainResult) => void;
}
interface BrowserController {
    stop: () => void;
}
declare function initAutoErrorExplainer(options?: BrowserInitOptions): BrowserController;

export { type BrowserController, type BrowserInitOptions, initAutoErrorExplainer };
