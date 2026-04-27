import { BaseTestProps, WithChildren } from '@nadohq/web-common';
import { Icons } from '@nadohq/web-ui';
import { useProductIdLinks } from 'client/hooks/ui/navigation/useProductIdLinks';
import { get } from 'lodash';
import Link from 'next/link';

interface Props extends WithChildren, BaseTestProps {
  productId: number | undefined;
}

export function ProductLabelLink({ productId, children, dataTestId }: Props) {
  const productIdLinks = useProductIdLinks();
  const productIdLink = productId
    ? get(productIdLinks, productId, undefined)
    : undefined;

  if (!productIdLink) {
    return children;
  }

  return (
    <Link
      href={productIdLink}
      className="flex items-center gap-x-2"
      data-testid={dataTestId}
    >
      {children}
      {/* We do not need a chevron to indicate 'clickability' on desktop, Link's cursor does */}
      <Icons.CaretRight className="text-xs lg:hidden" />
    </Link>
  );
}
