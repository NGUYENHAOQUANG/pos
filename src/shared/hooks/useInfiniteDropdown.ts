import { useState, useCallback, useRef, useEffect } from 'react';
import { Keyboard } from 'react-native';

const DEBOUNCE_MS = 400;

export interface InfiniteDropdownItem {
    id: string;
    name: string;
    [key: string]: any;
}

export interface UseInfiniteDropdownOptions {
    /** Debounce delay in milliseconds */
    debounceMs?: number;
}

export interface UseInfiniteDropdownReturn {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Current search text (for display) */
    searchText: string;
    /** Debounced search text (for API calls) */
    debouncedSearch: string;
    /** Open the modal */
    handleOpen: () => void;
    /** Close the modal */
    handleClose: () => void;
    /** Handle search text change with debounce */
    handleSearchChange: (text: string) => void;
    /** Clear search text */
    clearSearch: () => void;
}

/**
 * Generic hook for infinite scroll dropdown.
 * Manages modal open/close state, debounced search, and cleanup.
 * Use with InfiniteScrollDropdown component.
 */
export function useInfiniteDropdown(
    options?: UseInfiniteDropdownOptions
): UseInfiniteDropdownReturn {
    const debounceMs = options?.debounceMs ?? DEBOUNCE_MS;

    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce search input
    const handleSearchChange = useCallback(
        (text: string) => {
            setSearchText(text);
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                setDebouncedSearch(text.trim());
            }, debounceMs);
        },
        [debounceMs]
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const handleOpen = useCallback(() => {
        setIsOpen(true);
        setSearchText('');
        setDebouncedSearch('');
    }, []);

    const handleClose = useCallback(() => {
        Keyboard.dismiss();
        setIsOpen(false);
        setSearchText('');
        setDebouncedSearch('');
    }, []);

    const clearSearch = useCallback(() => {
        setSearchText('');
        setDebouncedSearch('');
    }, []);

    return {
        isOpen,
        searchText,
        debouncedSearch,
        handleOpen,
        handleClose,
        handleSearchChange,
        clearSearch,
    };
}
