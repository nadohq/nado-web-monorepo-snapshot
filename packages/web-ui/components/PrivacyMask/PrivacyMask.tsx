// cSpell:ignore nadohq
import { WithChildren } from '@nadohq/web-common';

/**
 * Constant used to mask sensitive content when privacy mode is enabled.
 * Replaces actual values with asterisks to prevent sensitive data from appearing in the DOM.
 */
export const PRIVACY_MASK = '∗∗∗∗∗∗';

export interface PrivacyMaskProps extends WithChildren {
  /**
   * Controls whether the content should be masked.
   * When true, children are replaced with the PRIVACY_MASK constant.
   */
  isMasked: boolean;
}

/**
 * Component that conditionally masks content based on privacy settings.
 * When masked, replaces children with asterisks instead of rendering actual values.
 *
 * @example
 * ```tsx
 * <PrivacyMask isMasked={isPrivate}>
 *   $1,234.56
 * </PrivacyMask>
 * // Renders: ∗∗∗∗∗∗ (when isMasked is true)
 * // Renders: $1,234.56 (when isMasked is false)
 * ```
 */
export function PrivacyMask({ isMasked, children }: PrivacyMaskProps) {
  return <>{isMasked ? PRIVACY_MASK : children}</>;
}
