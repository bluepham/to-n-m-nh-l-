import React, { useMemo } from 'react';
import katex from 'katex';
import { tokenizeMathText } from '../math/mathTextParser';

interface MathFormulaProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  latex,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: false,
      });
    } catch {
      return latex;
    }
  }, [latex, displayMode]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Renders mixed Vietnamese/English prose where $...$ (inline) and $$...$$ (display)
 * segments are typeset with KaTeX.
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  const tokens = useMemo(() => tokenizeMathText(text), [text]);

  return (
    <span className={className}>
      {tokens.map((token, idx) => {
        if (token.type === 'text') {
          return <React.Fragment key={idx}>{token.content}</React.Fragment>;
        }
        return (
          <MathFormula
            key={idx}
            latex={token.content}
            displayMode={token.type === 'display-math'}
            className={token.type === 'display-math' ? 'block my-1.5' : 'inline-block align-middle mx-0.5'}
          />
        );
      })}
    </span>
  );
};
