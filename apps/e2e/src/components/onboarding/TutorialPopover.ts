import { Locator, Page } from '@playwright/test';

export class TutorialPopover {
  readonly dontShowAgainButton: Locator;

  constructor(private readonly page: Page) {
    this.dontShowAgainButton = this.page.getByTestId(
      'tutorial-flow-popover-dont-show-me-this-again-button',
    );
  }

  async dismissPermanently(): Promise<void> {
    await this.dontShowAgainButton.click();
  }
}
