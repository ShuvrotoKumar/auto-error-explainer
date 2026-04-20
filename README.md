# Auto Error Explainer

[![npm version](https://badge.fury.io/js/auto-error-explainer.svg)](https://www.npmjs.com/package/auto-error-explainer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🧠 Human-readable error explanations with smart fix suggestions for JavaScript and TypeScript applications

**Auto Error Explainer** transforms cryptic technical errors into clear, actionable explanations. Built for modern web development with first-class support for **React**, **Next.js**, **Node.js**, and **Express** applications.

## ✨ Features

### Core Capabilities
- 🔍 **Smart Error Detection** — Captures runtime errors via `window.onerror`, `unhandledrejection`, and `console.error`
- 🗣️ **Human-Readable Explanations** — Converts technical jargon into plain language ("what happened" + "why happened")
- 💡 **Suggested Fixes** — Multiple solutions with code snippets and best practice recommendations
- 🎯 **Pattern Matching Engine** — Prebuilt error database with fuzzy matching (works even with partial matches)
- 📋 **Stack Trace Simplifier** — Converts messy stack traces into clean, readable formats with highlighted file/line info

### Advanced Features
- 🌐 **Multi-Language Support** — English, Bengali (বাংলা), and extensible to Hindi, Spanish, etc.
- 🎓 **Beginner vs Pro Mode** — Choose simple explanations or deep technical breakdowns
- 🖥️ **Error Overlay UI** — Beautiful dev-mode popup with explanations and fixes (Next.js-style)
- 🛠️ **CLI Tool** — Analyze error logs from the command line
- 📊 **Error History Tracker** — Store and analyze error frequency (Node.js)

### Framework Support
- ⚛️ **React** — Error boundary integration, hook misuse detection
- ▲ **Next.js** — Hydration error explanation, SSR vs CSR mismatch handling
- 🟢 **Node.js** — Uncaught exceptions and unhandled promise rejections
- 🚀 **Express** — API error context and middleware support

## 📦 Installation

```bash
npm install auto-error-explainer
```

```bash
yarn add auto-error-explainer
```

```bash
pnpm add auto-error-explainer
```

## 🚀 Quick Start

### Browser (React/Next.js/Vanilla JS)

```typescript
import { initAutoErrorExplainer } from 'auto-error-explainer/browser';

// Initialize in your app entry point
initAutoErrorExplainer({
  mode: 'beginner',        // 'beginner' | 'pro'
  language: 'en',          // 'en' | 'bn'
  framework: 'react',      // 'react' | 'nextjs' | 'express' | 'node' | 'unknown'
  overlay: true,           // Show dev overlay UI
});
```

### Node.js

```typescript
import { initAutoErrorExplainerNode } from 'auto-error-explainer/node';

// Initialize at application startup
initAutoErrorExplainerNode({
  mode: 'pro',
  language: 'en',
  framework: 'express',    // Optional: specify framework for better context
  historyFile: './logs/error-history.json', // Optional: track errors
});
```

### CLI

```bash
# Analyze an error log file
npx auto-error-explainer analyze ./error.log --lang bn --mode beginner

# Output as JSON
npx auto-error-explainer analyze ./error.log --lang en --mode pro
```

## 📖 Usage Examples

### React Component Error

When you encounter:
```
TypeError: Cannot read properties of undefined (reading 'name')
```

**Auto Error Explainer shows:**

**Beginner Mode:**
> **What happened:** Your code tried to read a property from a value that was undefined.
>
> **Why it happened:** A variable you expected to be an object was actually undefined (often due to async data, missing props, or initial state).
>
> **Fix:** Use optional chaining: `const name = user?.profile?.name;`

**Pro Mode:**
> Includes detailed stack trace analysis, potential root causes in data flow, and TypeScript type guard recommendations.

### Bengali (বাংলা) Support

```typescript
initAutoErrorExplainer({
  language: 'bn',
  mode: 'beginner',
});
```

Output:
> **এই error টা হয়েছে কারণ:** undefined থেকে property পড়তে চেষ্টা করা হয়েছে।
>
> **কেন হয়েছে:** যে variable-টা object হওয়ার কথা ছিল, runtime-এ সেটা undefined ছিল।
>
> **সমাধান:** Optional chaining ব্যবহার করুন: `const name = user?.profile?.name;`

### Custom Error Handler

```typescript
import { initAutoErrorExplainer } from 'auto-error-explainer/browser';

initAutoErrorExplainer({
  mode: 'pro',
  language: 'en',
  framework: 'react',
  overlay: true,
  onExplained: (result) => {
    // Custom logic: send to analytics, logging service, etc.
    console.log('Error explained:', result.title);
    console.log('Confidence:', result.confidence);
    console.log('Matched pattern:', result.matchedPatternId);
    console.log('Suggested fixes:', result.suggestedFixes);
  },
});
```

### React Error Boundary Integration

```typescript
import { explainError } from 'auto-error-explainer';

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    const explanation = explainError(
      {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      {
        mode: 'beginner',
        language: 'en',
        source: 'browser',
        context: { 
          framework: 'react', 
          componentName: this.constructor.name 
        },
      }
    );
    
    // Log or display the explanation
    console.log(explanation.whatHappened);
    console.log(explanation.whyHappened);
    console.log('Confidence:', explanation.confidence);
  }
  
  render() {
    // ...
  }
}
```

## ⚙️ Configuration Options

### Browser Options

```typescript
interface BrowserInitOptions {
  mode?: 'beginner' | 'pro';           // Explanation detail level
  language?: 'en' | 'bn';              // Output language
  framework?: 'react' | 'nextjs' | 'express' | 'node' | 'unknown'; // Framework context
  overlay?: boolean;                    // Show dev overlay UI
  redact?: boolean;                     // Mask sensitive data in production
  onExplained?: (result: ExplainResult) => void;  // Custom callback
}
```

### Node.js Options

```typescript
interface NodeInitOptions {
  mode?: 'beginner' | 'pro';
  language?: 'en' | 'bn';
  framework?: 'react' | 'nextjs' | 'express' | 'node' | 'unknown'; // Framework context
  historyFile?: string;                 // Path to error history JSON file
  onExplained?: (result: ExplainResult) => void;
}
```

## 🛠️ CLI Commands

### `analyze`

Analyze an error log file and output JSON explanation:

```bash
npx auto-error-explainer analyze <path> [options]

Options:
  --lang <lang>     Language: en | bn (default: en)
  --mode <mode>     Mode: beginner | pro (default: beginner)
```

Example:

```bash
npx auto-error-explainer analyze ./logs/error.log --lang bn --mode pro
```

## 📊 Error History (Node.js)

Track error frequency and patterns:

```typescript
import { initAutoErrorExplainerNode } from 'auto-error-explainer/node';

initAutoErrorExplainerNode({
  historyFile: './.auto-error-explainer/history.json',
});
```

History file structure:

```json
[
  {
    "ts": 1712987654321,
    "title": "Tried to access a property on undefined",
    "matchedPatternId": "js-cannot-read-properties-of-undefined",
    "confidence": 0.95,
    "message": "Cannot read properties of undefined (reading 'name')",
    "source": "node"
  }
]
```

## 🌍 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Complete |
| Bengali (বাংলা) | `bn` | ✅ Complete |
| Hindi | `hi` | 🚧 Coming Soon |
| Spanish | `es` | 🚧 Coming Soon |

**Want to add a language?** See [Contributing](#contributing).

## 🔧 Framework-Specific Features

### Next.js Hydration Errors

```typescript
// Automatically detects and explains hydration mismatches
initAutoErrorExplainer({
  mode: 'beginner',
  language: 'en',
  overlay: true,  // Shows helpful overlay with fix suggestions
});
```

### React Hook Errors

Detects common hook misuses:
- Invalid hook calls outside components
- Hook dependency array issues
- State initialization problems

### Express API Errors

```typescript
import { initAutoErrorExplainerNode } from 'auto-error-explainer/node';

// Captures API errors with route context
initAutoErrorExplainerNode({
  mode: 'pro',
  framework: 'express',
  onExplained: (result) => {
    // Log with API route information
    console.log(`Error: ${result.title}`);
    console.log(`Confidence: ${result.confidence}`);
    console.log(`Framework context: ${result.confidence > 0.8 ? 'Matched pattern' : 'Generic explanation'}`);
  },
});
```

## 🧪 Error Patterns Database

Built-in patterns for common errors:

- **`js-cannot-read-properties-of-undefined`** - Accessing properties on undefined values
- **`react-invalid-hook-call`** - Invalid React Hook usage
- **`nextjs-hydration-failed`** - Next.js hydration mismatches

**Pattern matching features:**
- Exact string matching via `messageIncludes`
- Regex pattern support via `messageRegex`
- Fuzzy matching using Levenshtein similarity
- Confidence scoring (0.0 - 1.0)
- Multi-language explanations (English & Bengali)

Each pattern includes:
- Unique ID for tracking
- Matching rules (name, message includes, regex)
- Localized explanations with fixes
- Code snippets for common solutions

## 🤝 Contributing

We welcome contributions! Areas where help is needed:

1. **New Error Patterns** — Add patterns for framework/library errors
2. **Language Translations** — Add support for more languages
3. **Framework Adapters** — Vue, Svelte, Angular support
4. **VS Code Extension** — Editor integration
5. **Documentation** — Improve guides and examples

### Adding a New Language

1. Add translation files in `src/core/patterns.ts`
2. Update `ExplainerLanguage` type in `src/types.ts`
3. Add tests for the new language

### Adding Error Patterns

Patterns are defined in `src/core/patterns.ts`:

```typescript
{
  id: 'unique-pattern-id',
  match: {
    name?: 'ErrorName',                    // Optional: match specific error names
    messageIncludes?: ['substring1'],       // Array: match any of these substrings
    messageRegex?: 'regex-pattern',         // Optional: regex pattern matching
  },
  explanation: {
    en: { 
      title: 'Error title',
      whatHappened: 'What occurred',
      whyHappened: 'Why it occurred',
      fixes: [
        {
          title: 'Fix title',
          description: 'Fix description',
          snippet: 'code snippet',
          docsUrl: 'https://...'
        }
      ]
    },
    bn: { /* Bengali translation */ }
  }
}
```

## 📄 License

[MIT](LICENSE) © [Shuvroto Kumar](https://github.com/ShuvrotoKumar)

## 🙏 Acknowledgments

- Built with [tsup](https://github.com/egoist/tsup) for fast bundling
- CLI powered by [commander.js](https://github.com/tj/commander.js/)
- Inspired by Next.js error overlay design

---

<p align="center">
  <strong>Made with ❤️ for the JavaScript community</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/auto-error-explainer">npm</a> •
  <a href="https://github.com/ShuvrotoKumar/auto-error-explainer">GitHub</a> •
  <a href="https://github.com/ShuvrotoKumar/auto-error-explainer/issues">Issues</a>
</p>
