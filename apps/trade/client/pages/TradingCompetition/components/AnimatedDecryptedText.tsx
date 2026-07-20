import { joinClassNames } from '@nadohq/web-common';
import { useInterval } from 'ahooks';
import { HTMLMotionProps, motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';

interface AnimatedDecryptedTextProps extends HTMLMotionProps<'span'> {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  animateOn?: 'view' | 'hover' | 'both';
  /**
   * Delay (ms) between completing a cycle and restarting. Pass `null` to
   * disable looping and animate only once per trigger.
   */
  loopDelayMs?: number | null;
}

const DEFAULT_CHARACTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';

/**
 * Adapted from https://www.reactbits.dev/text-animations/decrypted-text
 */
export function AnimatedDecryptedText({
  text,
  speed = 60,
  maxIterations = 12,
  sequential = true,
  revealDirection = 'start',
  useOriginalCharsOnly = true,
  characters = DEFAULT_CHARACTERS,
  animateOn = 'both',
  loopDelayMs = 5000,
  className,
  ...props
}: AnimatedDecryptedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { amount: 0.1 });
  const [isHovering, setIsHovering] = useState(false);

  const triggered =
    ((animateOn === 'view' || animateOn === 'both') && isInView) ||
    ((animateOn === 'hover' || animateOn === 'both') && isHovering);

  const hoverProps =
    animateOn === 'hover' || animateOn === 'both'
      ? {
          onMouseEnter: () => setIsHovering(true),
          onMouseLeave: () => setIsHovering(false),
        }
      : {};

  return (
    <motion.span
      ref={ref}
      className={joinClassNames('inline-block whitespace-pre-wrap', className)}
      {...hoverProps}
      {...props}
    >
      <span className="sr-only">{text}</span>

      <span aria-hidden="true">
        {triggered ? (
          // Re-key on `text` so a text change resets the animation cleanly.
          <Animator
            key={text}
            text={text}
            speed={speed}
            maxIterations={maxIterations}
            sequential={sequential}
            revealDirection={revealDirection}
            useOriginalCharsOnly={useOriginalCharsOnly}
            characters={characters}
            loopDelayMs={loopDelayMs}
          />
        ) : (
          text
        )}
      </span>
    </motion.span>
  );
}

interface AnimatorProps {
  text: string;
  speed: number;
  maxIterations: number;
  sequential: boolean;
  revealDirection: 'start' | 'end' | 'center';
  useOriginalCharsOnly: boolean;
  characters: string;
  loopDelayMs: number | null;
}

function Animator({
  text,
  speed,
  maxIterations,
  sequential,
  revealDirection,
  useOriginalCharsOnly,
  characters,
  loopDelayMs,
}: AnimatorProps) {
  const charPool = useOriginalCharsOnly
    ? Array.from(new Set(text.split(''))).filter((c) => c !== ' ')
    : characters.split('');

  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(
    () => new Set(),
  );
  const [iteration, setIteration] = useState(0);
  const [displayText, setDisplayText] = useState(() =>
    decryptText(text, new Set(), charPool, useOriginalCharsOnly),
  );

  const isComplete = sequential
    ? revealedIndices.size >= text.length
    : iteration >= maxIterations;

  useInterval(
    () => {
      if (sequential) {
        const next = new Set(revealedIndices);
        next.add(getNextIndex(next.size, text.length, revealDirection));
        setRevealedIndices(next);
        setDisplayText(decryptText(text, next, charPool, useOriginalCharsOnly));
      } else {
        setIteration((it) => it + 1);
        setDisplayText(
          decryptText(text, revealedIndices, charPool, useOriginalCharsOnly),
        );
      }
    },
    isComplete ? undefined : speed,
  );

  // Loop: once a cycle ends, restart after `loopDelayMs`. The interval pauses
  // as soon as the next cycle begins (isComplete -> false), so this fires
  // exactly once per cycle.
  useInterval(
    () => {
      setRevealedIndices(new Set());
      setIteration(0);
      setDisplayText(
        decryptText(text, new Set(), charPool, useOriginalCharsOnly),
      );
    },
    isComplete && loopDelayMs != null ? loopDelayMs : undefined,
  );

  return <>{isComplete ? text : displayText}</>;
}

function getNextIndex(
  revealedSize: number,
  textLength: number,
  direction: 'start' | 'end' | 'center',
): number {
  switch (direction) {
    case 'start':
      return revealedSize;
    case 'end':
      return textLength - 1 - revealedSize;
    case 'center': {
      // Reveal from the middle outward, alternating right/left.
      const middle = Math.floor(textLength / 2);
      const half = Math.floor(revealedSize / 2);
      const next = revealedSize % 2 === 0 ? middle + half : middle - half - 1;

      return Math.max(0, Math.min(textLength - 1, next));
    }
  }
}

function decryptText(
  original: string,
  revealed: Set<number>,
  charPool: string[],
  useOriginalCharsOnly: boolean,
): string {
  const chars = original.split('');

  // When restricted to the original chars, distribute a permutation of the
  // remaining (unrevealed, non-space) source chars so each appears exactly
  // once. Otherwise sample randomly from the provided pool.
  if (useOriginalCharsOnly) {
    const remaining = chars.filter((c, i) => c !== ' ' && !revealed.has(i));

    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    let cursor = 0;

    return chars
      .map((char, i) => {
        if (char === ' ') return ' ';
        if (revealed.has(i)) return char;
        return remaining[cursor++];
      })
      .join('');
  }

  return chars
    .map((char, i) => {
      if (char === ' ') return ' ';
      if (revealed.has(i)) return char;
      return charPool[Math.floor(Math.random() * charPool.length)];
    })
    .join('');
}
