'use client';

import { joinClassNames } from '@nadohq/web-common';
import { Button, Icons, Z_INDEX } from '@nadohq/web-ui';
import {
  PopoverContent,
  Root as PopoverRoot,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { TutorialFlowAccordion } from 'client/modules/tutorial/components/TutorialFlowAccordion/TutorialFlowAccordion';
import { TutorialFlowHeader } from 'client/modules/tutorial/components/TutorialFlowHeader';
import { TutorialFlowSuccessContent } from 'client/modules/tutorial/components/TutorialFlowSuccessContent';
import { useUserTutorialFlow } from 'client/modules/tutorial/hooks/useUserTutorialFlow';
import { useTranslation } from 'react-i18next';

export function TutorialFlowPopover() {
  const { t } = useTranslation();

  const {
    steps,
    performStep,
    skipStep,
    onDismissFlow,
    setIsExpanded,
    setActiveStepId,
    isExpanded,
    isCompleted,
    completedStepIds,
    activeStepId,
    shouldShowTutorialFlow,
  } = useUserTutorialFlow();

  if (!shouldShowTutorialFlow) {
    return null;
  }

  const tutorialFlowContent = (() => {
    if (isCompleted) {
      return <TutorialFlowSuccessContent onClose={onDismissFlow} />;
    }

    return (
      <>
        <TutorialFlowAccordion
          steps={steps}
          performStep={performStep}
          skipStep={skipStep}
          setActiveStepId={setActiveStepId}
          activeStepId={activeStepId}
          completedStepIds={completedStepIds}
        />
        <Button
          className={joinClassNames(
            'flex justify-start px-2 py-1',
            'text-text-secondary hover:text-text-primary text-xs',
          )}
          onClick={onDismissFlow}
          dataTestId="tutorial-flow-popover-dont-show-me-this-again-button"
        >
          {t(($) => $.buttons.dontShowAgain)}
        </Button>
      </>
    );
  })();

  // Omitting onOpenChange to avoid closing the Popover on an outside interaction or page navigation
  return (
    <PopoverRoot open={isExpanded}>
      <PopoverTrigger asChild>
        <Button
          className={joinClassNames(
            'text-text-secondary hover:text-text-primary',
            'flex items-center gap-x-1.5',
          )}
          onClick={() => setIsExpanded(!isExpanded)}
          startIcon={<Icons.Play size={12} />}
        >
          {t(($) => $.buttons.getStarted)}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={20}
        className={joinClassNames(
          /**
           * This aligns left of the popover to the `Operational` footer button
           * `align="end"` will technically align the right side of the content with the trigger,
           * but there's not enough space for the content to fit, so Radix makes the popover content
           * flush with the left side of the screen. We then use margin to push it to the right
           */
          'ml-4',
          'flex flex-col gap-y-2',
          'bg-surface-1 rounded-xl text-sm',
          'isolate w-80 p-1.5',
          Z_INDEX.popover,
        )}
      >
        <TutorialFlowHeader
          numTotalSteps={steps.length}
          numCompletedSteps={completedStepIds.length}
          setIsExpanded={setIsExpanded}
        />
        {tutorialFlowContent}
      </PopoverContent>
    </PopoverRoot>
  );
}
