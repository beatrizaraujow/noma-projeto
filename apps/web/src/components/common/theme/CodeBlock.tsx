'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  highlight?: number[];
}

// Simple syntax highlighting for demo (in production, use Prism.js or highlight.js)
function highlightSyntax(code: string, language: string = 'typescript') {
  // Keywords
  const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new'];
  
  // Function to escape HTML
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  let highlighted = escapeHtml(code);

  // Highlight strings
  highlighted = highlighted.replace(
    /(['"`])((?:\\.|(?!\1).)*?)\1/g,
    '<span class="token-string">$&</span>'
  );

  // Highlight comments
  highlighted = highlighted.replace(
    /\/\/.*/g,
    '<span class="token-comment">$&</span>'
  );
  highlighted = highlighted.replace(
    /\/\*[\s\S]*?\*\//g,
    '<span class="token-comment">$&</span>'
  );

  // Highlight keywords
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    highlighted = highlighted.replace(
      regex,
      '<span class="token-keyword">$1</span>'
    );
  });

  // Highlight numbers
  highlighted = highlighted.replace(
    /\b(\d+)\b/g,
    '<span class="token-number">$1</span>'
  );

  // Highlight functions
  highlighted = highlighted.replace(
    /\b([a-zA-Z_]\w*)\s*(?=\()/g,
    '<span class="token-function">$1</span>'
  );

  return highlighted;
}

export function CodeBlock({
  code,
  language = 'typescript',
  showLineNumbers = true,
  highlight = [],
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const lines = code.split('\n');
  const highlightedCode = highlightSyntax(code, language);
  const highlightedLines = highlightedCode.split('\n');

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden
                    bg-[#0A0A0A] dark:bg-[#000000]
                    border border-gray-200 dark:border-[#1A1A1A]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2
                      bg-gray-50 dark:bg-[#0D0D0D]
                      border-b border-gray-200 dark:border-[#1A1A1A]">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
          {language}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium
                     bg-white dark:bg-[#1A1A1A]
                     hover:bg-gray-50 dark:hover:bg-[#262626]
                     border border-gray-200 dark:border-[#2C2C2C]
                     text-gray-700 dark:text-gray-300
                     transition-colors"
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </motion.button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code className="font-mono">
            {highlightedLines.map((line, i) => (
              <div
                key={i}
                className={`
                  ${highlight.includes(i + 1) ? 'bg-blue-500/10 dark:bg-blue-500/20 -mx-4 px-4' : ''}
                `}
              >
                {showLineNumbers && (
                  <span className="inline-block w-8 text-right mr-4 select-none
                                   text-gray-400 dark:text-gray-600">
                    {i + 1}
                  </span>
                )}
                <span dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
              </div>
            ))}
          </code>
        </pre>
      </div>

      {/* Syntax highlighting styles */}
      <style jsx>{`
        :global(.token-keyword) {
          color: #F97316; /* orange-500 */
          font-weight: 500;
        }
        :global(.token-string) {
          color: #10B981; /* green-500 */
        }
        :global(.token-comment) {
          color: #6B7280; /* gray-500 */
          font-style: italic;
        }
        :global(.token-number) {
          color: #8B5CF6; /* violet-500 */
        }
        :global(.token-function) {
          color: #3B82F6; /* blue-500 */
        }
        code {
          color: #E5E7EB; /* gray-200 */
        }
        :global(.dark) code {
          color: #B4B4B4;
        }
      `}</style>
    </div>
  );
}

// Inline code component
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded text-sm font-mono
                     bg-gray-100 dark:bg-[#1A1A1A]
                     text-gray-800 dark:text-gray-300
                     border border-gray-200 dark:border-[#2C2C2C]">
      {children}
    </code>
  );
}
