import {
  BaseTestProps,
  joinClassNames,
  NextImageSrc,
  WithClassnames,
} from '@nadohq/web-common';
import { CardButton } from '@nadohq/web-ui';
import Image from 'next/image';
import { ReactNode } from 'react';

export interface DepositOptionCardButtonProps
  extends BaseTestProps, WithClassnames {
  title: ReactNode;
  description: string;
  imageSrc: NextImageSrc;
  disabled?: boolean;

  onClick(): void;
}

export function DepositOptionCardButton({
  className,
  title,
  description,
  imageSrc,
  onClick,
  disabled,
  dataTestId,
}: DepositOptionCardButtonProps) {
  return (
    <CardButton
      className={joinClassNames(
        'bg-surface-1 items-center justify-between gap-x-4 overflow-hidden p-2',
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      dataTestId={dataTestId}
    >
      <div className="flex flex-col gap-y-1 text-left whitespace-normal">
        <div className="text-xs font-semibold">{title}</div>
        <div className="text-2xs text-text-tertiary leading-normal">
          {description}
        </div>
      </div>
      <Image
        className="h-auto w-36 shrink-0 object-cover sm:w-54"
        src={imageSrc}
        alt=""
      />
    </CardButton>
  );
}
