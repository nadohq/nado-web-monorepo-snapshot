import { useCopyText } from '@nadohq/web-common';
import { CompactInput, CopyIcon, TextButton } from '@nadohq/web-ui';
import { getResolvedColorValue } from 'client/modules/theme/colorVars';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

export interface DirectDepositAddressDisplayProps {
  directDepositAddress: string;
}

export function DirectDepositAddressDisplay({
  directDepositAddress,
}: DirectDepositAddressDisplayProps) {
  const { t } = useTranslation();
  const { isCopied, copy } = useCopyText();

  // The `ethereum:` prefix allows for deeplinking to wallet apps
  const qrCodeValue = `ethereum:${directDepositAddress}`;

  return (
    <div className="flex flex-col gap-y-3">
      <QRCodeSVG
        // `marginSize` is used to increase the padding around the QR code. This allows for easier scanning.
        marginSize={1}
        title={t(($) => $.imageAltText.depositAddressQRCode)}
        bgColor={getResolvedColorValue('surface-card')}
        fgColor={getResolvedColorValue('text-primary')}
        value={qrCodeValue}
        size={240}
        className="self-center"
      />
      <div className="flex flex-col items-center gap-y-2">
        <div className="text-text-tertiary text-sm">
          {t(($) => $.directDepositAddress)}
        </div>
        <CompactInput
          className="w-full"
          placeholder={t(($) => $.inputPlaceholders.ethereumAddress)}
          value={directDepositAddress}
          endElement={
            <TextButton
              colorVariant="primary"
              onClick={() => {
                copy(directDepositAddress);
              }}
            >
              <CopyIcon isCopied={isCopied} size={18} />
            </TextButton>
          }
          readOnly
        />
      </div>
    </div>
  );
}
