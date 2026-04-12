type ExplainerMode = 'beginner' | 'pro';
type ExplainerLanguage = 'en' | 'bn';
interface ErrorEventLike {
    name?: string;
    message: string;
    stack?: string;
    cause?: unknown;
}
interface StackFrame {
    file?: string;
    line?: number;
    column?: number;
    functionName?: string;
    raw?: string;
}
interface SimplifiedStack {
    headline?: string;
    frames: StackFrame[];
    raw?: string;
}
interface FixSuggestion {
    title: string;
    description?: string;
    snippet?: string;
    docsUrl?: string;
}
interface ErrorExplanation {
    title: string;
    whatHappened: string;
    whyHappened: string;
    suggestedFixes: FixSuggestion[];
    simplifiedStack?: SimplifiedStack;
    confidence: number;
    matchedPatternId?: string;
}
interface ExplainResult extends ErrorExplanation {
    input: ErrorEventLike;
}

interface NodeInitOptions {
    mode?: ExplainerMode;
    language?: ExplainerLanguage;
    historyFile?: string;
    onExplained?: (result: ExplainResult) => void;
}
interface NodeController {
    stop: () => void;
}
declare function initAutoErrorExplainerNode(options?: NodeInitOptions): NodeController;

export { type NodeController, type NodeInitOptions, initAutoErrorExplainerNode };
