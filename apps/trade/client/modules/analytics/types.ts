import { SizeClass } from '@nadohq/web-ui';

export interface AnalyticsBaseEventProperties {
  sizeClass: SizeClass;
  buildId: string;
}

export type AnalyticsEvent = {
  type: 'example_event';
  data: never;
};
