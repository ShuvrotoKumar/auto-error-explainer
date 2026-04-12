import type { Pattern } from '../types.js';

export const patterns: Pattern[] = [
  {
    id: 'js-cannot-read-properties-of-undefined',
    match: {
      messageIncludes: ['Cannot read properties of undefined', 'cannot read property']
    },
    explanation: {
      en: {
        title: 'Tried to access a property on undefined',
        whatHappened: 'Your code attempted to read a property from a value that was undefined.',
        whyHappened: 'A variable you expected to be an object was actually undefined at runtime (often due to async data, missing props, or initial state).',
        fixes: [
          {
            title: 'Add optional chaining',
            description: 'Safely access nested properties when values may be undefined.',
            snippet: 'const name = user?.profile?.name;'
          },
          {
            title: 'Provide default values',
            description: 'Initialize state/props with safe defaults before rendering.',
            snippet: 'const [user, setUser] = useState<User | null>(null);\n\nif (!user) return null;'
          },
          {
            title: 'Check API data before use',
            description: 'Validate response shape and handle loading/error states.'
          }
        ]
      },
      bn: {
        title: 'undefined থেকে property পড়তে চেষ্টা করা হয়েছে',
        whatHappened: 'আপনার কোড একটি undefined value থেকে property পড়তে চেষ্টা করেছে।',
        whyHappened: 'যে variable-টা object হওয়ার কথা ছিল, runtime-এ সেটা undefined ছিল (async data, missing props, বা initial state ঠিক না থাকার কারণে হতে পারে)।',
        fixes: [
          {
            title: 'Optional chaining ব্যবহার করুন',
            description: 'value undefined হতে পারে এমন ক্ষেত্রে safe access দিন।',
            snippet: 'const name = user?.profile?.name;'
          },
          {
            title: 'Default value দিন',
            description: 'render করার আগে state/props safe default দিয়ে initialize করুন।',
            snippet: 'const [user, setUser] = useState<User | null>(null);\n\nif (!user) return null;'
          },
          {
            title: 'API data যাচাই করুন',
            description: 'response shape validate করুন এবং loading/error state handle করুন।'
          }
        ]
      }
    }
  },
  {
    id: 'react-invalid-hook-call',
    match: {
      messageIncludes: ['Invalid hook call']
    },
    explanation: {
      en: {
        title: 'Invalid React Hook usage',
        whatHappened: 'React detected a Hook being called in an unsupported place.',
        whyHappened: 'Hooks must be called at the top level of React function components or custom hooks. This can also happen if you have multiple React versions.',
        fixes: [
          {
            title: 'Move hooks to top level',
            description: 'Do not call hooks inside conditions, loops, or nested functions.',
            snippet: 'function Component() {\n  const [state, setState] = useState(0);\n  // ...\n}'
          },
          {
            title: 'Check duplicate React versions',
            description: 'Ensure your app and packages resolve to a single React installation.'
          }
        ]
      },
      bn: {
        title: 'React Hook ভুল জায়গায় call করা হয়েছে',
        whatHappened: 'React দেখেছে Hook এমন জায়গায় call করা হয়েছে যেখানে করা যায় না।',
        whyHappened: 'Hooks সবসময় React function component বা custom hook-এর top level-এ call করতে হয়। একাধিক React version থাকলেও এমন হতে পারে।',
        fixes: [
          {
            title: 'Hook top level-এ রাখুন',
            description: 'condition/loop/nested function-এর ভিতরে Hook call করবেন না।',
            snippet: 'function Component() {\n  const [state, setState] = useState(0);\n  // ...\n}'
          },
          {
            title: 'React version duplication চেক করুন',
            description: 'একটাই React resolve হচ্ছে কিনা নিশ্চিত করুন।'
          }
        ]
      }
    }
  },
  {
    id: 'nextjs-hydration-failed',
    match: {
      messageIncludes: ['Hydration failed', 'did not match'],
      messageRegex: 'Hydration failed|did not match'
    },
    explanation: {
      en: {
        title: 'Hydration mismatch (Next.js/React SSR)',
        whatHappened: 'The HTML rendered on the server did not match what React rendered on the client.',
        whyHappened: 'Client-only values (Date, Math.random, window, locale formatting) or conditional rendering based on browser state can cause SSR vs CSR differences.',
        fixes: [
          {
            title: 'Move client-only logic into useEffect',
            description: 'Compute values after mount so server and client match initially.',
            snippet: "const [mounted, setMounted] = useState(false);\nuseEffect(() => setMounted(true), []);\nif (!mounted) return null;"
          },
          {
            title: 'Avoid random/Date in initial render',
            description: 'Generate such values on the client after mount, or pass them from the server.'
          }
        ]
      },
      bn: {
        title: 'Hydration mismatch (Next.js/React SSR)',
        whatHappened: 'server থেকে যে HTML এসেছে, client-এ React যে HTML বানিয়েছে সেটা মিলেনি।',
        whyHappened: 'Date/Math.random/window/locale formatting বা browser state based conditional rendering SSR আর CSR-এ আলাদা output দিতে পারে।',
        fixes: [
          {
            title: 'client-only logic useEffect-এ নিন',
            description: 'mount হওয়ার পরে value compute করুন যাতে শুরুতে server/client এক থাকে।',
            snippet: "const [mounted, setMounted] = useState(false);\nuseEffect(() => setMounted(true), []);\nif (!mounted) return null;"
          },
          {
            title: 'initial render-এ random/Date এড়িয়ে চলুন',
            description: 'mount-এর পরে generate করুন, বা server থেকে pass করুন।'
          }
        ]
      }
    }
  }
];
