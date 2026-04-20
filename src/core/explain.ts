import type { ExplainOptions, ExplainResult, Pattern } from '../types.js';
import { simplifyStack } from './stack.js';
import { matchPattern } from './matcher.js';
import { patterns } from './patterns.js';
import { applyFrameworkSuggestions } from './framework.js';

export function explainError(input: { message: string; stack?: string; name?: string; cause?: unknown }, options: ExplainOptions = {}): ExplainResult {
  const mode = options.mode ?? 'beginner';
  const language = options.language ?? 'en';

  const simplifiedStack = input.stack ? simplifyStack(input.stack) : undefined;

  const matched = matchPattern({ name: input.name, message: input.message }, patterns);
  const best: Pattern | undefined = matched?.pattern;

  if (best) {
    const localized = best.explanation[language];

    // mode currently only influences verbosity; keep it minimal for MVP
    const confidence = matched?.score ?? 0.6;

    return applyFrameworkSuggestions({
      input: {
        name: input.name,
        message: input.message,
        stack: input.stack,
        cause: input.cause
      },
      title: localized.title,
      whatHappened: localized.whatHappened,
      whyHappened: localized.whyHappened,
      suggestedFixes: localized.fixes,
      simplifiedStack,
      confidence,
      matchedPatternId: best.id
    }, options);
  }

  const fallback = buildFallback(input.message, language, mode);
  return applyFrameworkSuggestions({
    input: {
      name: input.name,
      message: input.message,
      stack: input.stack,
      cause: input.cause
    },
    ...fallback,
    simplifiedStack,
    confidence: 0.2
  }, options);
}

function buildFallback(message: string, language: 'en' | 'bn', mode: 'beginner' | 'pro') {
  if (language === 'bn') {
    return {
      title: 'অপরিচিত Error',
      whatHappened: `অ্যাপটি একটি error দিয়েছে: ${message}`,
      whyHappened:
        mode === 'pro'
          ? 'এই error-এর নির্দিষ্ট pattern ডাটাবেসে পাওয়া যায়নি। stack trace/কোড context দেখে root cause বের করতে হবে।'
          : 'এই error কেন হয়েছে সেটা নিশ্চিত না—কোড/ডাটা যাচাই করতে হবে।',
      suggestedFixes: [
        {
          title: 'Stack trace দেখুন',
          description: 'যেখানে error হয়েছে সেই file + line identify করুন।'
        },
        {
          title: 'Null/undefined guard দিন',
          description: 'object/property ব্যবহার করার আগে value আছে কিনা চেক করুন।',
          snippet: 'if (value == null) return;\n// or\nconst safe = obj?.prop;'
        }
      ]
    };
  }

  return {
    title: 'Unknown Error',
    whatHappened: `Your app threw an error: ${message}`,
    whyHappened:
      mode === 'pro'
        ? 'No known pattern matched this error. Use the stack trace and runtime context to identify the root cause.'
        : "This error didn't match a known pattern. Check your data and the line where it happened.",
    suggestedFixes: [
      {
        title: 'Inspect the stack trace',
        description: 'Identify the exact file and line where the error originated.'
      },
      {
        title: 'Add null/undefined guards',
        description: 'Check values before accessing properties or calling functions.',
        snippet: 'if (value == null) return;\n// or\nconst safe = obj?.prop;'
      }
    ]
  };
}
