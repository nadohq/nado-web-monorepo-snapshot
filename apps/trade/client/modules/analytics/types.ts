import type { DialogType } from 'client/modules/app/dialogs/types';

/**
 * Type for GTM data layer events sent from the Trade app.
 *
 * High-level overview is available at https://www.notion.so/GTM-Analytics-Event-Flow-34559f6be93380a6ad7ec9ff274a6487
 *
 * GTM's dataLayer is a JavaScript object that stores properties about the user throughout the user's session on the app.
 *
 * A dataLayer event is an object that contains an "event" property (a string representing the type of event)
 * and any number of additional properties that provide context about the event or more generally about the user/session.
 *
 * The additional properties are merged with the existing GTM dataLayer object over time so that the data available to
 * all GTM tags and triggers is enriched without having to re-send everything every time.
 *
 * Think of GTM doing below every time an event is sent from the app:
 *
 * ```
 * dataLayer = {
 *   ...oldDataLayer,
 *   ...newDataLayerEvent,
 * }
 * ```
 *
 * Based on the properties of the dataLayer when an event is sent, GTM can trigger "tags" as configured in the GTM dashboard.
 *
 * Think of "tags" as integrations with third-party platforms.
 * Eg. a "tag" may record a page view on Clarity, another may record a conversion on Addressable, etc
 *
 * Tags can be configured to trigger on specific "events" and when certain conditions on the GTM dataLayer are met.
 *
 * The app only needs to define a generic event flow and lets GTM handle the specifics of which events to trigger for which
 * third-party platforms and under which conditions (eg. valueUsd > 50000 -> send "high value customer" conversion to AdWords)
 *
 * Eventually, app is nicely decoupled from marketing/reporting.
 * Marketing team has more freedom to iterate without frequently requiring app changes and deployments.
 *
 */
export type GTMDataLayerEvent =
  /** "low-level" event to set `walletAddress` GTM data layer variable */
  | {
      event: 'set_walletAddress';
      walletAddress: string;
    }
  /** "low-level" event to set `sourceChainId` GTM data layer variable */
  | {
      event: 'set_sourceChainId';
      sourceChainId: number;
    }
  /** "low-level" event to set `languageCode` GTM data layer variable */
  | {
      event: 'set_languageCode';
      languageCode: string;
    }
  /** "low-level" event to set the active subaccount name */
  | {
      event: 'set_activeSubaccount';
      subaccountName: string;
    }
  /** "low-level" event to set position metrics GTM data layer variables */
  | {
      event: 'set_positionsMetrics';
      numPositions: number;
      openInterestUsd: number;
    }
  /**
   * "low-level" event for any dialog opening
   *
   * If a specific dialog needs to be tracked and/or trigger conversion event(s),
   * A trigger can be defined in GTM for the "dialog_opened" event with the
   * corresponding "dialogType" variable of interest.
   */
  | {
      event: 'dialog_opened';
      /**
       *  `connect` represents Privy connect modal so that analytics flow
       *  is consistent pre- and post- Privy.
       **/
      dialogType: DialogType | 'connect';
    }
  | {
      event: 'deposit_success';
      asset: string;
      valueUsd: number;
      submissionIndex: string;
    }
  | {
      event: 'place_order';
      market: string;
      iso: boolean;
      valueUsd: number;
      digest: string;
    }
  | {
      event: 'place_order_error';
      market: string;
      iso: boolean;
      valueUsd: number;
      errorMessage: string;
    }
  | {
      event: 'close_position';
      market: string;
      fraction: number;
    }
  | {
      event: 'close_position_error';
      market: string;
      fraction: number;
      errorMessage: string;
    }
  | {
      event: 'cancel_order';
      market: string;
    }
  | {
      event: 'cancel_order_error';
      market: string;
      errorMessage: string;
    }
  | {
      event: 'initial_margin_usage_warning';
    }
  | {
      event: 'maint_margin_usage_warning';
      marginUsageFraction: number;
    }
  | {
      event: 'liquidation';
    }
  | {
      event: 'stale_data';
    }
  | {
      event: 'language_changed';
      languageCode: string;
    }
  | {
      event: 'competition_enroll_clicked';
      contestIds: number[];
    }
  | {
      event: 'trollbox_opened';
    }
  | {
      event: 'trollbox_message_sent';
    };
