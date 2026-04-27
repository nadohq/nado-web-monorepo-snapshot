const config = {
  singleQuote: true,
  tabWidth: 2,
  semi: true,
  trailingComma: 'all',
  plugins: [
    'prettier-plugin-organize-imports',
    'prettier-plugin-sort-json',
    'prettier-plugin-tailwindcss',
  ],
  jsonRecursiveSort: true,
  // use caseInsensitiveLexical to match Phrase's sort order in locales files
  jsonSortOrder: "{\"/.*/\": \"caseInsensitiveLexical\"}",
};

export default config;
