import { Page, Response } from '@playwright/test';

const API_RESPONSE_TIMEOUT_MS = 10_000;

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  abstract goto(...args: unknown[]): Promise<void>;

  async waitForAPIResponse(payloadKey: string, timeoutMs?: number) {
    return await this.page.waitForResponse(
      async (response: Response) => {
        if (!response.url().includes('/v1')) return false;

        if (response.status() < 200 || response.status() >= 300) return false;

        try {
          const reqBody = response.request().postDataJSON();

          return reqBody && payloadKey in reqBody;
        } catch {
          return false;
        }
      },
      { timeout: timeoutMs ?? API_RESPONSE_TIMEOUT_MS },
    );
  }

  protected async gotoAndWaitForResponses(
    url: string,
    payloadKeys: string[],
  ): Promise<void> {
    const responsePromises = payloadKeys.map((key) =>
      this.waitForAPIResponse(key).catch(() => undefined),
    );

    await this.page.goto(url);
    await Promise.allSettled(responsePromises);
    await this.page.waitForTimeout(1_000);
  }
}
