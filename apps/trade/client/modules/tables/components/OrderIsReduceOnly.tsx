import { useTranslation } from 'react-i18next';

export interface OrderIsReduceOnlyProps {
  isReduceOnly: boolean;
}

export function OrderIsReduceOnly({ isReduceOnly }: OrderIsReduceOnlyProps) {
  const { t } = useTranslation();

  return isReduceOnly ? t(($) => $.yes) : t(($) => $.no);
}
