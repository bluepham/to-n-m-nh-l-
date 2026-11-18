export interface MathTextToken {
  type: 'text' | 'inline-math' | 'display-math';
  content: string;
}

const MATH_TOKEN_REGEX =
  /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$(?!\$)(?:\\.|[^$\\\n])+\$|\\\([\s\S]+?\\\))/g;

/**
 * Splits mixed Vietnamese/English prose containing $...$, $$...$$, \(...\), or \[...\]
 * into plain-text and LaTeX math tokens for KaTeX rendering.
 */
export function tokenizeMathText(input: string): MathTextToken[] {
  if (!input) return [];

  const tokens: MathTextToken[] = [];
  let lastIndex = 0;

  for (const match of input.matchAll(MATH_TOKEN_REGEX)) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      tokens.push({
        type: 'text',
        content: input.slice(lastIndex, matchIndex),
      });
    }

    const raw = match[0];
    if (raw.startsWith('$$') && raw.endsWith('$$')) {
      tokens.push({
        type: 'display-math',
        content: raw.slice(2, -2).trim(),
      });
    } else if (raw.startsWith('\\[') && raw.endsWith('\\]')) {
      tokens.push({
        type: 'display-math',
        content: raw.slice(2, -2).trim(),
      });
    } else if (raw.startsWith('\\(') && raw.endsWith('\\)')) {
      tokens.push({
        type: 'inline-math',
        content: raw.slice(2, -2).trim(),
      });
    } else {
      tokens.push({
        type: 'inline-math',
        content: raw.slice(1, -1).trim(),
      });
    }

    lastIndex = matchIndex + raw.length;
  }

  if (lastIndex < input.length) {
    tokens.push({
      type: 'text',
      content: input.slice(lastIndex),
    });
  }

  return tokens;
}

/**
 * Produces a readable plain-text label for aria-label attributes by stripping LaTeX wrappers.
 */
export function stripMathDelimiters(input: string): string {
  return input
    .replace(/\$\$/g, '')
    .replace(/\$/g, '')
    .replace(/\^\\circ/g, '°')
    .replace(/\\pi\b/g, 'π')
    .replace(/\\int/g, '∫')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\{,\}/g, ',')
    .replace(/\\(?:displaystyle|quad|qquad|,|;)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
