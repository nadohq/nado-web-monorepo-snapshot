import { joinClassNames, WithChildren } from '@nadohq/web-common';
import { INTER } from '@nadohq/web-ui';

export function AppRootLayout({ children }: WithChildren) {
  return (
    <html
      lang="en"
      className={joinClassNames(INTER.className, INTER.variable, 'antialiased')}
      data-theme="nadoDark"
    >
      <body>{children}</body>
    </html>
  );
}
