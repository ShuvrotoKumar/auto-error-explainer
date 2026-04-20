import type { ExplainOptions, ExplainResult, FixSuggestion, FrameworkName } from '../types.js';

interface FrameworkEnhancement {
  matches: string[];
  fixes: Partial<Record<FrameworkName, FixSuggestion[]>>;
}

const frameworkEnhancements: FrameworkEnhancement[] = [
  {
    matches: ['js-cannot-read-properties-of-undefined'],
    fixes: {
      react: [
        {
          title: 'Guard the initial render',
          description: 'React components often render before async data arrives, so return a loading or empty state first.',
          snippet: "if (!user) return <Spinner />;\nreturn <ProfileCard user={user} />;"
        }
      ],
      nextjs: [
        {
          title: 'Protect server-rendered props',
          description: 'In Next.js, validate props from loaders and handle missing data before rendering the page.',
          snippet: "if (!post) {\n  notFound();\n}\n\nreturn <Article post={post} />;"
        }
      ],
      express: [
        {
          title: 'Validate request data before use',
          description: 'Body, params, and query values may be missing, so check them before reading nested properties.',
          snippet: "const userId = req.body?.userId;\nif (!userId) return res.status(400).json({ error: 'userId is required' });"
        }
      ],
      node: [
        {
          title: 'Validate external input early',
          description: 'Config, file contents, and API responses in Node.js often need guards before nested access.',
          snippet: "if (!config?.db?.url) {\n  throw new Error('Missing database URL');\n}"
        }
      ]
    }
  },
  {
    matches: ['react-invalid-hook-call'],
    fixes: {
      react: [
        {
          title: 'Check custom hooks and component boundaries',
          description: 'Make sure hooks only run inside React function components or other custom hooks.',
          snippet: "function useProfile() {\n  const [profile, setProfile] = useState(null);\n  return { profile, setProfile };\n}"
        }
      ],
      nextjs: [
        {
          title: "Keep hooks inside Client Components",
          description: "If you're in the App Router, add 'use client' and avoid calling hooks from Server Components.",
          snippet: "'use client';\n\nimport { useState } from 'react';"
        }
      ]
    }
  },
  {
    matches: ['nextjs-hydration-failed'],
    fixes: {
      react: [
        {
          title: 'Keep the first render deterministic',
          description: 'Even outside Next.js, hydration problems come from rendering different markup on the client.',
          snippet: "const content = isReady ? realValue : '...';"
        }
      ],
      nextjs: [
        {
          title: 'Split server and client-only rendering',
          description: 'Move browser-only logic behind dynamic import or a mounted check to keep server and client HTML aligned.',
          snippet: "const ClientOnlyChart = dynamic(() => import('./chart'), { ssr: false });"
        }
      ]
    }
  }
];

export function applyFrameworkSuggestions(result: ExplainResult, options: ExplainOptions): ExplainResult {
  const framework = options.context?.framework ?? inferFramework(result, options);
  if (!framework || framework === 'unknown') return result;

  const enhancement = frameworkEnhancements.find((entry) => entry.matches.includes(result.matchedPatternId ?? ''));
  const extraFixes = enhancement?.fixes[framework] ?? [];
  if (extraFixes.length === 0) return result;

  return {
    ...result,
    suggestedFixes: dedupeFixes([...extraFixes, ...result.suggestedFixes])
  };
}

function inferFramework(result: ExplainResult, options: ExplainOptions): FrameworkName {
  if (options.source === 'browser' && result.matchedPatternId === 'nextjs-hydration-failed') return 'nextjs';
  if (result.matchedPatternId?.startsWith('react-')) return 'react';
  if (result.matchedPatternId?.startsWith('nextjs-')) return 'nextjs';
  if (options.source === 'node') return 'node';
  return 'unknown';
}

function dedupeFixes(fixes: FixSuggestion[]): FixSuggestion[] {
  const seen = new Set<string>();
  const unique: FixSuggestion[] = [];

  for (const fix of fixes) {
    const key = `${fix.title}::${fix.description ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(fix);
  }

  return unique;
}
