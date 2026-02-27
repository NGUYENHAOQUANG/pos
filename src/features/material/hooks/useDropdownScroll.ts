import { useCallback, createContext } from 'react';
import Animated, {
    useAnimatedRef,
    useDerivedValue,
    useSharedValue,
    scrollTo,
    useAnimatedScrollHandler,
    SharedValue,
} from 'react-native-reanimated';

export const DropdownScrollContext = createContext<SharedValue<number> | null>(null);

export interface ScrollToDropdownOptions {
    index: number;
    headerHeight: number;
    itemHeight: number;
    fileCount?: number;
    fileRowHeight?: number;
    offsetY?: number;
}

/**
 * Custom hook to handle scrolling when a dropdown opens in a list.
 * Uses react-native-reanimated for smooth scrolling and better performance.
 * Needs to be attached to an `<Animated.ScrollView>` component.
 */
export const useDropdownScroll = () => {
    // Shared value to hold the target Y offset
    const scrollTargetY = useSharedValue<number>(0);
    const scrollTrigger = useSharedValue<number>(0);
    const scrollOffset = useSharedValue<number>(0);

    // Ref to attach to Animated.ScrollView
    const scrollRef = useAnimatedRef<Animated.ScrollView>();

    // Derived value reacts to 'scrollTrigger' changes
    useDerivedValue(() => {
        if (scrollTrigger.value > 0) {
            scrollTo(scrollRef, 0, scrollTargetY.value, true);
        }
    });

    const onScroll = useAnimatedScrollHandler({
        onScroll: event => {
            scrollOffset.value = event.contentOffset.y;
        },
    });

    const scrollToDropdown = useCallback(
        ({
            index,
            headerHeight,
            itemHeight,
            fileCount = 0,
            fileRowHeight = 40,
            offsetY = 50,
        }: ScrollToDropdownOptions) => {
            const finalHeaderHeight = headerHeight + fileCount * fileRowHeight;
            const scrollY = finalHeaderHeight + index * itemHeight;
            const targetY = Math.max(0, scrollY - offsetY);

            // Give a slight delay before triggering the scroll to let the UI update
            setTimeout(() => {
                scrollTargetY.value = targetY;
                scrollTrigger.value = scrollTrigger.value + 1; // Increment to trigger the derived value
            }, 100);
        },
        [scrollTargetY, scrollTrigger]
    );

    return {
        scrollRef,
        scrollToDropdown,
        scrollOffset,
        onScroll,
    };
};
