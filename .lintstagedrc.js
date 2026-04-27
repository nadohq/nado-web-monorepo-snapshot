import path from 'path';

/**
 * @type {import('lint-staged').Configuration}
 */
const config = {
  // Type check, Lint check and prettify
  '!(public/**/*)**/*.(ts|tsx|js)': (filenames) => {
    const relativeFiles = filenames.map((f) =>
      path.relative(path.resolve('.'), f),
    );
    const havePackagesChanged = relativeFiles.some((f) =>
      f.startsWith('packages/'),
    );
    return [
      // disable turbo cache to typecheck whole monorepo when packages/* changed
      havePackagesChanged ? `bun typecheck --force` : `bun typecheck`,
      `bun lint`,
      `bun depcheck`,
      `bun depcruise ${relativeFiles.join(' ')}`,
      `bun prettier --write ${relativeFiles.join(' ')}`,
      `bun run --cwd packages/i18n i18n:lint`,
    ];
  },

  // Prettify
  '**/*.(md|css|json)': (filenames) => {
    const relativeFiles = filenames.map((f) =>
      path.relative(path.resolve('.'), f),
    );
    return [`bun prettier --write ${relativeFiles.join(' ')}`];
  },
};

export default config;
