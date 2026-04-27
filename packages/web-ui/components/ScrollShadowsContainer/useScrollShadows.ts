import { useScroll, useSize } from 'ahooks';
import { useEffect, useMemo, useRef, useState } from 'react';

type ScrollOrientation = 'vertical' | 'horizontal';

type ShadowPosition = 'start' | 'end' | 'both';

type ScrollShadowClassName =
  | 'scroll-shadow-t'
  | 'scroll-shadow-b'
  | 'scroll-shadow-y'
  | 'scroll-shadow-l'
  | 'scroll-shadow-r'
  | 'scroll-shadow-x';

const SCROLL_CLASSNAMES_BY_ORIENTATION: Record<
  ScrollOrientation,
  Record<ShadowPosition, ScrollShadowClassName>
> = {
  vertical: {
    start: 'scroll-shadow-t',
    end: 'scroll-shadow-b',
    both: 'scroll-shadow-y',
  },
  horizontal: {
    start: 'scroll-shadow-l',
    end: 'scroll-shadow-r',
    both: 'scroll-shadow-x',
  },
};

export interface UseScrollShadowsParams {
  /**
   * The orientation of the scroll, defaults to `vertical`.
   */
  orientation?: ScrollOrientation;
  /**
   * The number of pixels from the start / end the scroll position must reach
   * before the scroll shadow is removed. Defaults to `2` to avoid flickering/buggy behavior on window resize.
   */
  threshold?: number;
  /**
   * Whether scrolling is reversed (e.g. starts at the bottom instead of the top).
   */
  isReversed?: boolean;
}

/**
 * Determines the correct scroll shadow class that should be applied to a scroll
 * container based on its scroll position and size.
 *
 * Returns the scroll container ref and scroll shadow class.
 */
export function useScrollShadows<T extends HTMLElement = HTMLDivElement>({
  orientation = 'vertical',
  threshold = 2,
  isReversed,
}: UseScrollShadowsParams = {}) {
  // Track the scroll container ref
  const scrollContainerRef = useRef<T>(null);

  const scrollPosObj = useScroll(scrollContainerRef);
  const containerSizeObj = useSize(scrollContainerRef);

  // Track scroll dimensions in state to avoid accessing ref during render
  const [scrollDimensions, setScrollDimensions] = useState<{
    scrollHeight?: number;
    scrollWidth?: number;
  }>({});

  // Update scroll dimensions when container size changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setScrollDimensions({
        scrollHeight: container.scrollHeight,
        scrollWidth: container.scrollWidth,
      });
    }
  }, [containerSizeObj]);

  const scrollShadowClassName = useMemo(() => {
    const classNameByShadowPos = SCROLL_CLASSNAMES_BY_ORIENTATION[orientation];

    // Extract scroll and size values
    const isVertical = orientation === 'vertical';
    const scrollPos = isVertical ? scrollPosObj?.top : scrollPosObj?.left;
    const containerSize = isVertical
      ? containerSizeObj?.height
      : containerSizeObj?.width;
    const scrollSize = isVertical
      ? scrollDimensions.scrollHeight
      : scrollDimensions.scrollWidth;

    // Early return if container is empty or hidden
    if (
      containerSize === undefined ||
      scrollSize === undefined ||
      scrollPos === undefined
    ) {
      return undefined;
    }

    const hasOverflow = scrollSize > containerSize + threshold;

    if (!hasOverflow) {
      return undefined;
    }

    // Determine scroll position relative to content
    const maxScrollPos = scrollSize - containerSize;
    // Normalize negative scroll values from reversed containers
    const absScrollPos = Math.abs(scrollPos);
    const isAtStart = absScrollPos <= threshold;
    const isAtEnd = absScrollPos >= maxScrollPos - threshold;

    if (isAtStart) {
      // At start - show shadow at end
      return isReversed ? classNameByShadowPos.start : classNameByShadowPos.end;
    } else if (isAtEnd) {
      // At end - show shadow at start
      return isReversed ? classNameByShadowPos.end : classNameByShadowPos.start;
    } else {
      // In middle - show shadows on both sides
      return classNameByShadowPos.both;
    }
  }, [
    orientation,
    scrollPosObj,
    containerSizeObj,
    scrollDimensions,
    threshold,
    isReversed,
  ]);

  return { scrollShadowClassName, scrollContainerRef };
}
