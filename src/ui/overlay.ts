import type { ExplainResult, ExplainerLanguage } from '../types.js';

export interface OverlayController {
  show: (result: ExplainResult) => void;
  destroy: () => void;
}

export function createOverlay(opts: { language: ExplainerLanguage }): OverlayController {
  const root = document.createElement('div');
  root.id = 'auto-error-explainer-overlay';
  root.style.position = 'fixed';
  root.style.left = '0';
  root.style.right = '0';
  root.style.top = '0';
  root.style.zIndex = '2147483647';
  root.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
  root.style.pointerEvents = 'none';

  const panel = document.createElement('div');
  panel.style.margin = '12px';
  panel.style.padding = '12px 14px';
  panel.style.background = 'rgba(17, 24, 39, 0.96)';
  panel.style.color = '#fff';
  panel.style.border = '1px solid rgba(255,255,255,0.12)';
  panel.style.borderRadius = '10px';
  panel.style.boxShadow = '0 10px 30px rgba(0,0,0,0.45)';
  panel.style.maxHeight = '50vh';
  panel.style.overflow = 'auto';
  panel.style.pointerEvents = 'auto';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.gap = '10px';

  const title = document.createElement('div');
  title.style.fontWeight = '700';
  title.style.fontSize = '14px';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = opts.language === 'bn' ? 'বন্ধ' : 'Close';
  closeBtn.style.fontSize = '12px';
  closeBtn.style.padding = '6px 10px';
  closeBtn.style.borderRadius = '8px';
  closeBtn.style.border = '1px solid rgba(255,255,255,0.18)';
  closeBtn.style.background = 'rgba(255,255,255,0.08)';
  closeBtn.style.color = '#fff';
  closeBtn.style.cursor = 'pointer';

  const body = document.createElement('div');
  body.style.marginTop = '10px';
  body.style.fontSize = '12px';
  body.style.lineHeight = '1.45';

  header.appendChild(title);
  header.appendChild(closeBtn);
  panel.appendChild(header);
  panel.appendChild(body);
  root.appendChild(panel);

  let mounted = false;
  const mount = () => {
    if (mounted) return;
    document.body.appendChild(root);
    mounted = true;
  };

  const hide = () => {
    if (!mounted) return;
    root.remove();
    mounted = false;
  };

  closeBtn.addEventListener('click', hide);

  return {
    show: (result: ExplainResult) => {
      mount();
      title.textContent = result.title;

      const fixes = result.suggestedFixes
        .map((f) => {
          const snippet = f.snippet ? `<pre style="margin:8px 0 0; padding:8px; background: rgba(0,0,0,0.35); border-radius: 8px; overflow:auto;">${escapeHtml(f.snippet)}</pre>` : '';
          return `<div style="margin-top:10px; padding-top:10px; border-top: 1px solid rgba(255,255,255,0.10);">
            <div style="font-weight:600;">${escapeHtml(f.title)}</div>
            ${f.description ? `<div style="opacity:0.9; margin-top:4px;">${escapeHtml(f.description)}</div>` : ''}
            ${snippet}
          </div>`;
        })
        .join('');

      const stackTop = result.simplifiedStack?.frames?.[0];
      const stackLine = stackTop?.file
        ? `<div style="margin-top:10px; opacity:0.9;">${escapeHtml(stackTop.file)}:${stackTop.line ?? ''}</div>`
        : '';

      body.innerHTML = `
        <div style="opacity:0.9;">${escapeHtml(result.whatHappened)}</div>
        <div style="margin-top:8px; opacity:0.9;">${escapeHtml(result.whyHappened)}</div>
        ${stackLine}
        ${fixes}
      `;
    },
    destroy: () => {
      hide();
      closeBtn.removeEventListener('click', hide);
    }
  };
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
