import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Input } from './input';

export interface SearchOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  category?: string;
  data?: any;
}

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  loading?: boolean;
  // Autocomplete props
  suggestions?: SearchOption[];
  onSelect?: (option: SearchOption) => void;
  showSuggestions?: boolean;
  highlightMatch?: boolean;
  // Styles
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SearchBar = React.forwardRef<HTMLDivElement, SearchBarProps>(
  (
    {
      placeholder = 'Search...',
      value: controlledValue,
      onValueChange,
      onSearch,
      loading = false,
      suggestions = [],
      onSelect,
      showSuggestions = true,
      highlightMatch = true,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(-1);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const setValue = (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      setSelectedIndex(-1);
    };

    const handleClear = () => {
      setValue('');
      inputRef.current?.focus();
    };

    const handleSearch = () => {
      onSearch?.(value);
      setIsFocused(false);
    };

    const handleSelectOption = (option: SearchOption) => {
      setValue(option.label);
      onSelect?.(option);
      setIsFocused(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) {
        if (e.key === 'Enter') {
          handleSearch();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSelectOption(suggestions[selectedIndex]);
          } else {
            handleSearch();
          }
          break;
        case 'Escape':
          setIsFocused(false);
          inputRef.current?.blur();
          break;
      }
    };

    // Close suggestions on click outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsFocused(false);
        }
      };

      if (isFocused) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }
    }, [isFocused]);

    const highlightText = (text: string, query: string) => {
      if (!highlightMatch || !query) return text;

      const parts = text.split(new RegExp(`(${query})`, 'gi'));
      return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-primary-100 dark:bg-primary-900 text-inherit">
            {part}
          </mark>
        ) : (
          part
        )
      );
    };

    const sizeClasses = {
      sm: 'h-9 text-sm',
      md: 'h-10 text-base',
      lg: 'h-12 text-lg',
    };

    const showDropdown =
      isFocused && showSuggestions && value.length > 0 && suggestions.length > 0;

    return (
      <div ref={containerRef} className={cn('relative w-full', className)} {...props}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              'w-full rounded-lg border bg-white px-10 transition-all',
              'placeholder:text-neutral-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              'dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100',
              'border-neutral-300 dark:border-neutral-600',
              sizeClasses[size]
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
            {value && !loading && (
              <button
                onClick={handleClear}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown && (
          <div
            className={cn(
              'absolute top-full left-0 right-0 mt-2 z-dropdown',
              'bg-white dark:bg-neutral-800',
              'border border-neutral-200 dark:border-neutral-700',
              'rounded-lg shadow-lg',
              'max-h-80 overflow-y-auto',
              'animate-in fade-in-0 slide-in-from-top-2'
            )}
          >
            {suggestions.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3',
                  'text-left transition-colors',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                  index === selectedIndex &&
                    'bg-primary-50 dark:bg-primary-900/20',
                  index !== suggestions.length - 1 &&
                    'border-b border-neutral-200 dark:border-neutral-700'
                )}
              >
                {option.icon && (
                  <span className="flex-shrink-0 text-neutral-400 mt-0.5">
                    {option.icon}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">
                    {highlightText(option.label, value)}
                  </div>
                  {option.description && (
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 truncate">
                      {option.description}
                    </div>
                  )}
                  {option.category && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                      {option.category}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export { SearchBar };
