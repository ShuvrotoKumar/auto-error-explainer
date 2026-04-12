// src/core/stack.ts
function simplifyStack(stack) {
  const lines = stack.split(/\r?\n/).map((l) => l.trimEnd());
  const headline = lines[0]?.trim();
  const frames = [];
  for (const rawLine of lines.slice(1)) {
    const line = rawLine.trim();
    if (!line) continue;
    const v8 = parseV8Frame(line);
    if (v8) {
      frames.push(v8);
      continue;
    }
    const ff = parseFirefoxFrame(line);
    if (ff) {
      frames.push(ff);
      continue;
    }
    frames.push({ raw: line });
  }
  return {
    headline,
    frames,
    raw: stack
  };
}
function parseV8Frame(line) {
  const trimmed = line.startsWith("at ") ? line.slice(3).trim() : line;
  const m1 = trimmed.match(/^(.*?) \((.*?):(\d+):(\d+)\)$/);
  if (m1) {
    return {
      functionName: m1[1] || void 0,
      file: m1[2],
      line: Number(m1[3]),
      column: Number(m1[4]),
      raw: line
    };
  }
  const m2 = trimmed.match(/^(.*?):(\d+):(\d+)$/);
  if (m2) {
    return {
      file: m2[1],
      line: Number(m2[2]),
      column: Number(m2[3]),
      raw: line
    };
  }
  return void 0;
}
function parseFirefoxFrame(line) {
  const m = line.match(/^(.*?)@(.*?):(\d+):(\d+)$/);
  if (!m) return void 0;
  return {
    functionName: m[1] || void 0,
    file: m[2],
    line: Number(m[3]),
    column: Number(m[4]),
    raw: line
  };
}

// src/core/similarity.ts
function similarity(a, b) {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  if (a === b) return 1;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : Math.max(0, 1 - dist / maxLen);
}
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[n];
}

// src/core/matcher.ts
function matchPattern(input, patterns2) {
  const message = (input.message ?? "").toLowerCase();
  const name = input.name?.toLowerCase();
  let best;
  for (const p of patterns2) {
    if (p.match.name && name && p.match.name.toLowerCase() !== name) continue;
    let score = 0;
    if (p.match.messageIncludes?.length) {
      const hitCount = p.match.messageIncludes.filter((s) => message.includes(s.toLowerCase())).length;
      score = Math.max(score, hitCount / p.match.messageIncludes.length);
    }
    if (p.match.messageRegex) {
      try {
        const re = new RegExp(p.match.messageRegex, "i");
        if (re.test(input.message)) score = Math.max(score, 0.9);
      } catch {
      }
    }
    if (score < 0.6 && p.match.messageIncludes?.length) {
      const target = p.match.messageIncludes.join(" ").toLowerCase();
      score = Math.max(score, similarity(message, target));
    }
    if (!best || score > best.score) best = { pattern: p, score };
  }
  if (!best) return void 0;
  if (best.score < 0.55) return void 0;
  return best;
}

// src/core/patterns.ts
var patterns = [
  {
    id: "js-cannot-read-properties-of-undefined",
    match: {
      messageIncludes: ["Cannot read properties of undefined", "cannot read property"]
    },
    explanation: {
      en: {
        title: "Tried to access a property on undefined",
        whatHappened: "Your code attempted to read a property from a value that was undefined.",
        whyHappened: "A variable you expected to be an object was actually undefined at runtime (often due to async data, missing props, or initial state).",
        fixes: [
          {
            title: "Add optional chaining",
            description: "Safely access nested properties when values may be undefined.",
            snippet: "const name = user?.profile?.name;"
          },
          {
            title: "Provide default values",
            description: "Initialize state/props with safe defaults before rendering.",
            snippet: "const [user, setUser] = useState<User | null>(null);\n\nif (!user) return null;"
          },
          {
            title: "Check API data before use",
            description: "Validate response shape and handle loading/error states."
          }
        ]
      },
      bn: {
        title: "undefined \u09A5\u09C7\u0995\u09C7 property \u09AA\u09DC\u09A4\u09C7 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7",
        whatHappened: "\u0986\u09AA\u09A8\u09BE\u09B0 \u0995\u09CB\u09A1 \u098F\u0995\u099F\u09BF undefined value \u09A5\u09C7\u0995\u09C7 property \u09AA\u09DC\u09A4\u09C7 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C7\u099B\u09C7\u0964",
        whyHappened: "\u09AF\u09C7 variable-\u099F\u09BE object \u09B9\u0993\u09DF\u09BE\u09B0 \u0995\u09A5\u09BE \u099B\u09BF\u09B2, runtime-\u098F \u09B8\u09C7\u099F\u09BE undefined \u099B\u09BF\u09B2 (async data, missing props, \u09AC\u09BE initial state \u09A0\u09BF\u0995 \u09A8\u09BE \u09A5\u09BE\u0995\u09BE\u09B0 \u0995\u09BE\u09B0\u09A3\u09C7 \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7)\u0964",
        fixes: [
          {
            title: "Optional chaining \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8",
            description: "value undefined \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7 \u098F\u09AE\u09A8 \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09C7 safe access \u09A6\u09BF\u09A8\u0964",
            snippet: "const name = user?.profile?.name;"
          },
          {
            title: "Default value \u09A6\u09BF\u09A8",
            description: "render \u0995\u09B0\u09BE\u09B0 \u0986\u0997\u09C7 state/props safe default \u09A6\u09BF\u09DF\u09C7 initialize \u0995\u09B0\u09C1\u09A8\u0964",
            snippet: "const [user, setUser] = useState<User | null>(null);\n\nif (!user) return null;"
          },
          {
            title: "API data \u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09C1\u09A8",
            description: "response shape validate \u0995\u09B0\u09C1\u09A8 \u098F\u09AC\u0982 loading/error state handle \u0995\u09B0\u09C1\u09A8\u0964"
          }
        ]
      }
    }
  },
  {
    id: "react-invalid-hook-call",
    match: {
      messageIncludes: ["Invalid hook call"]
    },
    explanation: {
      en: {
        title: "Invalid React Hook usage",
        whatHappened: "React detected a Hook being called in an unsupported place.",
        whyHappened: "Hooks must be called at the top level of React function components or custom hooks. This can also happen if you have multiple React versions.",
        fixes: [
          {
            title: "Move hooks to top level",
            description: "Do not call hooks inside conditions, loops, or nested functions.",
            snippet: "function Component() {\n  const [state, setState] = useState(0);\n  // ...\n}"
          },
          {
            title: "Check duplicate React versions",
            description: "Ensure your app and packages resolve to a single React installation."
          }
        ]
      },
      bn: {
        title: "React Hook \u09AD\u09C1\u09B2 \u099C\u09BE\u09DF\u0997\u09BE\u09DF call \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7",
        whatHappened: "React \u09A6\u09C7\u0996\u09C7\u099B\u09C7 Hook \u098F\u09AE\u09A8 \u099C\u09BE\u09DF\u0997\u09BE\u09DF call \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7 \u09AF\u09C7\u0996\u09BE\u09A8\u09C7 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF \u09A8\u09BE\u0964",
        whyHappened: "Hooks \u09B8\u09AC\u09B8\u09AE\u09DF React function component \u09AC\u09BE custom hook-\u098F\u09B0 top level-\u098F call \u0995\u09B0\u09A4\u09C7 \u09B9\u09DF\u0964 \u098F\u0995\u09BE\u09A7\u09BF\u0995 React version \u09A5\u09BE\u0995\u09B2\u09C7\u0993 \u098F\u09AE\u09A8 \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u0964",
        fixes: [
          {
            title: "Hook top level-\u098F \u09B0\u09BE\u0996\u09C1\u09A8",
            description: "condition/loop/nested function-\u098F\u09B0 \u09AD\u09BF\u09A4\u09B0\u09C7 Hook call \u0995\u09B0\u09AC\u09C7\u09A8 \u09A8\u09BE\u0964",
            snippet: "function Component() {\n  const [state, setState] = useState(0);\n  // ...\n}"
          },
          {
            title: "React version duplication \u099A\u09C7\u0995 \u0995\u09B0\u09C1\u09A8",
            description: "\u098F\u0995\u099F\u09BE\u0987 React resolve \u09B9\u099A\u09CD\u099B\u09C7 \u0995\u09BF\u09A8\u09BE \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09C1\u09A8\u0964"
          }
        ]
      }
    }
  },
  {
    id: "nextjs-hydration-failed",
    match: {
      messageIncludes: ["Hydration failed", "did not match"],
      messageRegex: "Hydration failed|did not match"
    },
    explanation: {
      en: {
        title: "Hydration mismatch (Next.js/React SSR)",
        whatHappened: "The HTML rendered on the server did not match what React rendered on the client.",
        whyHappened: "Client-only values (Date, Math.random, window, locale formatting) or conditional rendering based on browser state can cause SSR vs CSR differences.",
        fixes: [
          {
            title: "Move client-only logic into useEffect",
            description: "Compute values after mount so server and client match initially.",
            snippet: "const [mounted, setMounted] = useState(false);\nuseEffect(() => setMounted(true), []);\nif (!mounted) return null;"
          },
          {
            title: "Avoid random/Date in initial render",
            description: "Generate such values on the client after mount, or pass them from the server."
          }
        ]
      },
      bn: {
        title: "Hydration mismatch (Next.js/React SSR)",
        whatHappened: "server \u09A5\u09C7\u0995\u09C7 \u09AF\u09C7 HTML \u098F\u09B8\u09C7\u099B\u09C7, client-\u098F React \u09AF\u09C7 HTML \u09AC\u09BE\u09A8\u09BF\u09DF\u09C7\u099B\u09C7 \u09B8\u09C7\u099F\u09BE \u09AE\u09BF\u09B2\u09C7\u09A8\u09BF\u0964",
        whyHappened: "Date/Math.random/window/locale formatting \u09AC\u09BE browser state based conditional rendering SSR \u0986\u09B0 CSR-\u098F \u0986\u09B2\u09BE\u09A6\u09BE output \u09A6\u09BF\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u0964",
        fixes: [
          {
            title: "client-only logic useEffect-\u098F \u09A8\u09BF\u09A8",
            description: "mount \u09B9\u0993\u09DF\u09BE\u09B0 \u09AA\u09B0\u09C7 value compute \u0995\u09B0\u09C1\u09A8 \u09AF\u09BE\u09A4\u09C7 \u09B6\u09C1\u09B0\u09C1\u09A4\u09C7 server/client \u098F\u0995 \u09A5\u09BE\u0995\u09C7\u0964",
            snippet: "const [mounted, setMounted] = useState(false);\nuseEffect(() => setMounted(true), []);\nif (!mounted) return null;"
          },
          {
            title: "initial render-\u098F random/Date \u098F\u09DC\u09BF\u09DF\u09C7 \u099A\u09B2\u09C1\u09A8",
            description: "mount-\u098F\u09B0 \u09AA\u09B0\u09C7 generate \u0995\u09B0\u09C1\u09A8, \u09AC\u09BE server \u09A5\u09C7\u0995\u09C7 pass \u0995\u09B0\u09C1\u09A8\u0964"
          }
        ]
      }
    }
  }
];

// src/core/explain.ts
function explainError(input, options = {}) {
  const mode = options.mode ?? "beginner";
  const language = options.language ?? "en";
  const simplifiedStack = input.stack ? simplifyStack(input.stack) : void 0;
  const matched = matchPattern({ name: input.name, message: input.message }, patterns);
  const best = matched?.pattern;
  if (best) {
    const localized = best.explanation[language];
    const confidence = matched?.score ?? 0.6;
    return {
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
    };
  }
  const fallback = buildFallback(input.message, language, mode);
  return {
    input: {
      name: input.name,
      message: input.message,
      stack: input.stack,
      cause: input.cause
    },
    ...fallback,
    simplifiedStack,
    confidence: 0.2
  };
}
function buildFallback(message, language, mode) {
  if (language === "bn") {
    return {
      title: "\u0985\u09AA\u09B0\u09BF\u099A\u09BF\u09A4 Error",
      whatHappened: `\u0985\u09CD\u09AF\u09BE\u09AA\u099F\u09BF \u098F\u0995\u099F\u09BF error \u09A6\u09BF\u09DF\u09C7\u099B\u09C7: ${message}`,
      whyHappened: mode === "pro" ? "\u098F\u0987 error-\u098F\u09B0 \u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F pattern \u09A1\u09BE\u099F\u09BE\u09AC\u09C7\u09B8\u09C7 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964 stack trace/\u0995\u09CB\u09A1 context \u09A6\u09C7\u0996\u09C7 root cause \u09AC\u09C7\u09B0 \u0995\u09B0\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964" : "\u098F\u0987 error \u0995\u09C7\u09A8 \u09B9\u09DF\u09C7\u099B\u09C7 \u09B8\u09C7\u099F\u09BE \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u09A8\u09BE\u2014\u0995\u09CB\u09A1/\u09A1\u09BE\u099F\u09BE \u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964",
      suggestedFixes: [
        {
          title: "Stack trace \u09A6\u09C7\u0996\u09C1\u09A8",
          description: "\u09AF\u09C7\u0996\u09BE\u09A8\u09C7 error \u09B9\u09DF\u09C7\u099B\u09C7 \u09B8\u09C7\u0987 file + line identify \u0995\u09B0\u09C1\u09A8\u0964"
        },
        {
          title: "Null/undefined guard \u09A6\u09BF\u09A8",
          description: "object/property \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09BE\u09B0 \u0986\u0997\u09C7 value \u0986\u099B\u09C7 \u0995\u09BF\u09A8\u09BE \u099A\u09C7\u0995 \u0995\u09B0\u09C1\u09A8\u0964",
          snippet: "if (value == null) return;\n// or\nconst safe = obj?.prop;"
        }
      ]
    };
  }
  return {
    title: "Unknown Error",
    whatHappened: `Your app threw an error: ${message}`,
    whyHappened: mode === "pro" ? "No known pattern matched this error. Use the stack trace and runtime context to identify the root cause." : "This error didn't match a known pattern. Check your data and the line where it happened.",
    suggestedFixes: [
      {
        title: "Inspect the stack trace",
        description: "Identify the exact file and line where the error originated."
      },
      {
        title: "Add null/undefined guards",
        description: "Check values before accessing properties or calling functions.",
        snippet: "if (value == null) return;\n// or\nconst safe = obj?.prop;"
      }
    ]
  };
}

export { explainError };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map