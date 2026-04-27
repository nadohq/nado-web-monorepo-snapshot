import { joinClassNames, WithChildren } from '@nadohq/web-common';
import { INTER, REPLICA, REPLICA_MONO, ThemeName } from '@nadohq/web-ui';

export function AppRootLayout({ children }: WithChildren) {
  const currentTheme: ThemeName = 'nadoDark';

  return (
    <html
      lang="en"
      className={joinClassNames(
        INTER.className,
        INTER.variable,
        REPLICA.variable,
        REPLICA_MONO.variable,
      )}
      data-theme={currentTheme}
    >
      <body
        className={joinClassNames(
          'bg-background text-text-secondary tracking-default leading-none',
          // Prevent scrolling as the inner content (underneath navbar) will handle scrolling
          'flex h-dvh flex-col overflow-hidden',
        )}
      >
        {children}
      </body>
    </html>
  );
}
