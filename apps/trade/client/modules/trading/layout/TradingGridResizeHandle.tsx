import type { HTMLAttributes, Ref } from 'react';

import { joinClassNames } from '@nadohq/web-common';
import { Icons } from '@nadohq/web-ui';

interface Props extends HTMLAttributes<HTMLDivElement> {
  /** Whether the resize icon should be visible. */
  isEnabled: boolean;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Resize handle for react-grid-layout. DraggableCore clones this element and
 * injects onMouseDown/onMouseUp/onTouchEnd, so all props must be spread onto
 * the div. The ref is required for DraggableCore to identify the handle node.
 * Positioning, sizing, and cursor classes must be passed by the caller — this
 * component does not inject className or style.
 */
export function TradingGridResizeHandle({
  className,
  isEnabled,
  style,
  ref,
  ...restProps
}: Props) {
  return (
    <div {...restProps} ref={ref} style={style} className={className}>
      {/* Visual resize grip. pointer-events-none lets mouse events pass through to this
          div's injected resize handlers. Revealed on .react-grid-item hover via arbitrary
          Tailwind variant - group-hover doesn't work here since RGL injects this handle
          outside the card's group context. */}
      <Icons.Notches
        size={12}
        className={joinClassNames(
          'pointer-events-none',
          'absolute right-1 bottom-1',
          'opacity-0 transition-opacity duration-100',
          isEnabled && '[.react-grid-item:hover_&]:opacity-100',
          // On touch/coarse-pointer devices there is no hover, so show the
          // grip while resize interactions are enabled.
          isEnabled && '[@media(pointer:coarse)]:opacity-100',
        )}
      />
    </div>
  );
}
