import { joinClassNames, WithChildren } from '@nadohq/web-common';
import { INTER } from '@nadohq/web-ui';

export function AppRootLayout({ children }: WithChildren) {
  return (
    <html
      lang="en"
      className={joinClassNames(
        INTER.className,
        INTER.variable,
        'overscroll-none antialiased',
      )}
      data-theme="nadoDark"
    >
      <body className="bg-background text-text-secondary">{children}</body>
    </html>
  );
}
