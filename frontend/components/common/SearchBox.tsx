import React, { useState, useRef, useEffect } from "react";

interface SearchBoxProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  showSearchButton?: boolean;
  showClearButton?: boolean;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = "Search...",
  value = "",
  onChange,
  onSearch,
  onClear,
  size = "md",
  fullWidth = false,
  showSearchButton = false,
  showClearButton = true,
  debounceMs = 300,
  disabled = false,
  className = "",
  suggestions = [],
  onSuggestionSelect,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Update internal state when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (debounceMs > 0 && onChange) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onChange(inputValue);
      }, debounceMs);

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }
  }, [inputValue, onChange, debounceMs]);

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2 text-sm";
      case "md":
        return "px-4 py-2.5 text-sm";
      case "lg":
        return "px-4 py-3 text-base";
      default:
        return "px-4 py-2.5 text-sm";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "md":
        return "h-5 w-5";
      case "lg":
        return "h-6 w-6";
      default:
        return "h-5 w-5";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1);

    if (!debounceMs && onChange) {
      onChange(newValue);
    }

    if (suggestions.length > 0) {
      setShowSuggestions(newValue.length > 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) {
      if (e.key === "Enter" && onSearch) {
        onSearch(inputValue);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
          handleSuggestionSelect(filteredSuggestions[highlightedIndex]);
        } else if (onSearch) {
          onSearch(inputValue);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(inputValue);
    }
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setInputValue("");
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    if (onChange) {
      onChange("");
    }
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);

    if (onChange) {
      onChange(suggestion);
    }
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  const handleFocus = () => {
    if (suggestions.length > 0 && inputValue.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  return (
    <div className={`relative ${fullWidth ? "w-full" : "w-auto"} ${className}`}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className={`${getIconSize()} text-neutral-400`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 border border-neutral-300 rounded-lg
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
            transition-colors duration-200
            ${getSizeClasses()}
            ${
              showClearButton && inputValue
                ? "pr-20"
                : showSearchButton
                ? "pr-16"
                : "pr-4"
            }
          `}
        />

        {/* Clear Button */}
        {showClearButton && inputValue && (
          <button
            onClick={handleClear}
            className={`absolute inset-y-0 right-0 flex items-center transition-colors ${
              showSearchButton ? "pr-12" : "pr-3"
            }`}
            type="button"
            aria-label="Clear search"
          >
            <svg
              className={`${getIconSize()} text-neutral-400 hover:text-neutral-600`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Search Button */}
        {showSearchButton && (
          <button
            onClick={handleSearch}
            disabled={disabled}
            className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors ${
              disabled ? "cursor-not-allowed" : "hover:text-primary-600"
            }`}
            type="button"
            aria-label="Search"
          >
            <svg
              className={`${getIconSize()} text-primary-500`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-elevated max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={`${suggestion}-${index}`}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`
                w-full text-left px-4 py-2 text-sm transition-colors
                ${
                  index === highlightedIndex
                    ? "bg-primary-50 text-primary-700"
                    : "text-neutral-700 hover:bg-neutral-50"
                }
                ${index === 0 ? "rounded-t-lg" : ""}
                ${
                  index === filteredSuggestions.length - 1 ? "rounded-b-lg" : ""
                }
              `}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;

// Pre-configured search box variants
export const UserSearchBox: React.FC<Omit<SearchBoxProps, "placeholder">> = (
  props
) => <SearchBox placeholder="Search users by name or email..." {...props} />;

export const OrderSearchBox: React.FC<Omit<SearchBoxProps, "placeholder">> = (
  props
) => (
  <SearchBox placeholder="Search orders by number or customer..." {...props} />
);

export const MenuSearchBox: React.FC<Omit<SearchBoxProps, "placeholder">> = (
  props
) => <SearchBox placeholder="Search menu items..." {...props} />;

// Advanced search box with filters
interface FilterSearchBoxProps extends SearchBoxProps {
  filters?: { label: string; value: string }[];
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export const FilterSearchBox: React.FC<FilterSearchBoxProps> = ({
  filters = [],
  selectedFilter = "",
  onFilterChange,
  ...searchProps
}) => {
  return (
    <div className="flex space-x-2">
      {/* Filter Dropdown */}
      {filters.length > 0 && (
        <select
          value={selectedFilter}
          onChange={(e) => onFilterChange?.(e.target.value)}
          className="border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All</option>
          {filters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      )}

      {/* Search Box */}
      <SearchBox {...searchProps} fullWidth />
    </div>
  );
};
