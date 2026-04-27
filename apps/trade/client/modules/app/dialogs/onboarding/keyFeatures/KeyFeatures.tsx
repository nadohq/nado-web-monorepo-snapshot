import { mergeClassNames, WithClassnames } from '@nadohq/web-common';
import { IconComponent, Icons } from '@nadohq/web-ui';
import { useTranslation } from 'react-i18next';

export function KeyFeatures({ className }: WithClassnames) {
  const { t } = useTranslation();

  const keyFeatures = [
    {
      icon: Icons.LightningFill,
      description: t(($) => $.keyFeatures.fastLiquidity),
    },
    {
      icon: Icons.Plus,
      description: t(($) => $.keyFeatures.collateralInterest),
    },
    {
      icon: Icons.CurrencyCircleDollar,
      description: t(($) => $.keyFeatures.lowTradingFees),
    },
  ];

  return (
    <div className={mergeClassNames('flex flex-col gap-4', className)}>
      {keyFeatures.map(({ icon, description }, index) => (
        <Feature key={index} description={description} icon={icon} />
      ))}
    </div>
  );
}

function Feature({
  icon: Icon,
  description,
}: {
  icon: IconComponent;
  description: string;
}) {
  return (
    <div className="text-text-secondary flex items-center gap-x-2">
      <div className="bg-surface-2 rounded-sm p-1">
        <Icon size={16} />
      </div>
      <span>{description}</span>
    </div>
  );
}
