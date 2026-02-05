import * as React from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

export const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value, onChange, placeholder = 'Write something...', minHeight = 200, className }, ref) => {
    const editorRef = React.useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFormat = (command: string, value?: string) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
    };

    const handleInput = () => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    };

    React.useEffect(() => {
      if (editorRef.current && !editorRef.current.innerHTML) {
        editorRef.current.innerHTML = value;
      }
    }, []);

    const toolbarButtons = [
      { icon: Bold, command: 'bold', title: 'Bold (Cmd/Ctrl+B)' },
      { icon: Italic, command: 'italic', title: 'Italic (Cmd/Ctrl+I)' },
      { icon: Underline, command: 'underline', title: 'Underline (Cmd/Ctrl+U)' },
      { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
      { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
      { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
      { icon: Code, command: 'formatBlock', value: 'pre', title: 'Code Block' },
      { icon: LinkIcon, command: 'createLink', title: 'Insert Link', requiresInput: true },
    ];

    const handleButtonClick = (button: typeof toolbarButtons[0]) => {
      if (button.requiresInput) {
        const url = prompt('Enter URL:');
        if (url) {
          handleFormat(button.command, url);
        }
      } else {
        handleFormat(button.command, button.value);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'border rounded-lg overflow-hidden transition-colors',
          isFocused
            ? 'border-orange-500 ring-2 ring-orange-200 dark:ring-orange-900'
            : 'border-neutral-300 dark:border-neutral-600',
          className
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-2 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleButtonClick(button)}
              className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
              title={button.title}
            >
              <button.icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'px-4 py-3 text-sm text-neutral-900 dark:text-white outline-none overflow-y-auto',
            'prose prose-sm dark:prose-invert max-w-none',
            '[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-neutral-400 [&:empty]:before:dark:text-neutral-500'
          )}
          style={{ minHeight: `${minHeight}px` }}
          data-placeholder={placeholder}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
