'use client';

import { MarketCategory, useSubaccountContext } from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { Button, Icons, Z_INDEX } from '@nadohq/web-ui';
import {
  PopoverContent,
  PopoverPortal,
  Root as PopoverRoot,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import WidgetBot from '@widgetbot/react-embed';
import { useCreation } from 'ahooks';
import { useMarketForCurrentRoute } from 'client/hooks/ui/navigation/useMarketForCurrentRoute';
import { useAnalyticsContext } from 'client/modules/analytics/AnalyticsContext';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const WIDGETBOT_CONFIG = {
  serverId: '1478370405881221152',
  shardUrl: 'https://e-counity.widgetbot.co',
  channels: {
    crypto: '1496240729259900948',
    stocks: '1496240751988838410',
    commodities: '1496240833228177449',
    forex: '1496240933362995201',
  } as Partial<Record<MarketCategory, string>>,
};

const DEFAULT_CHANNEL = WIDGETBOT_CONFIG.channels.crypto;

const { serverId, shardUrl, channels } = WIDGETBOT_CONFIG;

export function TrollboxPopover() {
  const {
    currentSubaccount: { address },
  } = useSubaccountContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastMessagePreview, setLastMessagePreview] = useState<ReactNode>(null);
  const apiRef = useRef<WidgetBot['api'] | null>(null);
  const { sendGTMEvent } = useAnalyticsContext();

  const isEnabled = !!address;

  const onAPI = useCallback(
    (api: WidgetBot['api']) => {
      apiRef.current = api;
      api.on('message', ({ message }) => {
        setLastMessagePreview(message.author.name + ': ' + message.content);
      });
      api.on('latestMessage', ({ message }) => {
        setLastMessagePreview(message.author.name + ': ' + message.content);
      });
      api.on('sentMessage', () => {
        sendGTMEvent({ event: 'trollbox_message_sent' });
      });
    },
    [sendGTMEvent],
  );

  // cleanup apiRef when disabled and on unmount to avoid stale reference
  useEffect(() => {
    if (!isEnabled) {
      apiRef.current = null;
    }
    return () => {
      apiRef.current = null;
    };
  }, [isEnabled]);

  useEffect(() => {
    if (isExpanded) {
      sendGTMEvent({ event: 'trollbox_opened' });
    }
  }, [isExpanded, sendGTMEvent]);

  const currentMarket = useMarketForCurrentRoute();

  const channelId = (() => {
    const marketCategories = currentMarket?.metadata.marketCategories;
    for (const category of marketCategories ?? []) {
      if (channels[category]) {
        return channels[category];
      }
    }
    // we return undefined and not DEFAULT_CHANNEL here to avoid switching
    // to default channel when user navigates to a non-market page (eg. portfolio)
    return undefined;
  })();

  // Latch the channelId whenever the widget is first rendered (isEnabled is true) so
  // the embed is mounted once with the correct initialChannelId when first rendered.
  // Subsequent channel changes are handled imperatively via api.emit('navigate', ...)
  // effect below to avoid a janky remount of the whole WidgetBot iframe (~2s).
  const initialChannelId = useCreation(() => channelId, [isEnabled]);

  useEffect(() => {
    if (channelId) {
      try {
        apiRef.current?.emit('navigate', {
          guild: serverId,
          channel: channelId,
        });
      } catch (error) {
        console.error('Failed to navigate WidgetBot to channel', error);
      }
    }
  }, [channelId]);

  const embedContent = useMemo(() => {
    if (!isEnabled) {
      return null;
    }

    // default username is the first 7 characters of the wallet address
    // but users can change it in the widget
    const initialUsername = address.slice(0, 7);

    return (
      <WidgetBot
        className="h-105 w-full"
        shard={shardUrl}
        server={serverId}
        channel={initialChannelId ?? DEFAULT_CHANNEL}
        username={initialUsername}
        onAPI={onAPI}
        emitLatestMessage
      />
    );
  }, [isEnabled, address, onAPI, initialChannelId]);

  if (!isEnabled) {
    return null;
  }

  return (
    <PopoverRoot open={isExpanded} onOpenChange={setIsExpanded}>
      <PopoverTrigger asChild>
        <Button
          className={joinClassNames(
            'flex items-center gap-x-1.5',
            'text-text-secondary hover:text-text-primary',
            isExpanded && 'text-text-primary',
          )}
          startIcon={
            isExpanded ? (
              <Icons.ChatsFill size={16} />
            ) : (
              <Icons.Chats size={16} />
            )
          }
        >
          <span className="max-w-110 overflow-hidden text-ellipsis whitespace-nowrap">
            {lastMessagePreview}
          </span>
        </Button>
      </PopoverTrigger>
      {/* We use forceMount to ensure the popover content (ie. the widget) is rendered even when it's not visible.
          This avoids having to duplicate logic for getting message previews and ensures quick display of the widget
          which otherwise takes 2 seconds to load whenever the popover is collapsed and re-opened.
       */}
      <PopoverPortal forceMount>
        <PopoverContent
          align="start"
          sideOffset={0}
          // Keep the popover open on outside interactions so users can chat _while_ trading,
          // but still allow explicit dismiss behaviors (e.g. Escape key)
          onInteractOutside={(event) => event.preventDefault()}
          className={joinClassNames(
            'flex flex-col gap-y-2',
            'bg-surface-1 rounded-xl text-sm',
            'isolate w-110 p-1.5',
            Z_INDEX.popover,
            !isExpanded && 'hidden',
          )}
        >
          <Button
            className="text-text-secondary hover:text-text-primary hover:bg-surface-2 w-full rounded-md"
            onClick={() => setIsExpanded(false)}
          >
            <Icons.CaretDown size={16} />
          </Button>
          {embedContent}
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  );
}
