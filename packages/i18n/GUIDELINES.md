# I18N Key Naming Guidelines

## Key Namespaces

A namespace is a separate JSON file under `locales/en/`.

We currently use a single default namespace `common`, so all our i18n keys are in `locales/en/common.json`.

## Key Naming

Use camelCase for key names.

Prefer key names that roughly follow copy when it's concise and straightforward.
Otherwise prefer key names that convey the UI **intent** so key names remain meaningful to both developers and translators.

If the text is an abbreviation (eg. "Est." for "Estimated"), use the long-form word/expression in the key name with suffix "Abbrev" (eg. "estimatedAbbrev").

## Key Scopes

Prefer flat key names unless you need to add *multiple* related keys that are unlikely to be reusable elsewhere.

Predefined scopes in `common` namespace:
- `buttons` – for all button labels
- `definitions` – for definition tooltips (title and content, possibly styled, see below notes)
- `tooltips` – for free-floating tooltips (ie. untitled, single word/sentence)
- `imageAltText` – for image alt text descriptions
- `inputPlaceholders` – for input field placeholder text
- `emptyPlaceholders` – for messages shown in empty state UIs
- `errors` – for error messages
- `notifications` – for user notifications and alerts
- `dialogTitles` – for dialog titles
- `pageTitles` – for page titles


### Notes on `definitions` scope

This scope is split in two categories. The top-level scope contains simple definition tooltips with sub-keys `title` and `content` only.

There is a nested `definitions.custom` scope for definition tooltips that require a more complex structure or styling, which can be
defined in `client/modules/tooltips/DefinitionTooltip/content/customDefinitionTooltips.tsx`.

Note that both `definitions` and `definitions.custom` have access to `primaryQuoteTokenSymbol` as predefined interpolation variable.
See `client/modules/tooltips/DefinitionTooltip/DefinitionTooltip.tsx` for details.


## Dynamic Sentences

Instead of assembling sentences from multiple keys, prefer using a single key with interpolation OR a single key with a switch case.

### Patterns

- **Interpolation** — dynamic values within a sentence:
    ```tsx
    t(($) => $.buttons.buySymbol, { symbol: 'BTC' })
    ```

- **Pluralization** — pass `count` for i18next [pluralization](https://www.i18next.com/translation-function/plurals):
    ```tsx
    t(($) => $.ordersSubmitted, { count: numOrders })
    ```

- **Context** — multiple variations from one key via i18next [context](https://www.i18next.com/translation-function/context). Use when there are 3+ variations; use a ternary for exactly two:
    ```tsx
    t(($) => $.closeAllPositions, { context: side })
    // locale: { "closeAllPositions": "...", "closeAllPositions_long": "...", "closeAllPositions_short": "..." }
    ```
    Pro tip: find examples with regexp `_.[^"]+` in translation files.

- **Conditional** — ternary for two distinct messages:
    ```tsx
    const msg = isThisAboutA ? t(($) => $.messageAboutA) : t(($) => $.messageAboutB);
    ```

- **Trans** — styled/interactive content within a sentence. Always use *lowercased named components* (not array/indexed):
    ```tsx
    <Trans
        i18nKey={($) => $.directDepositConfirmation}
        components={{ highlight: <span className="text-text-primary"/>, action: <LinkButton.../> }}
        values={{ productSymbol, chainName }} />
    ```
    **Never** use existing html tag names (ex. `p` or `link`) for a named component.

- **Never** assemble sentences by concatenating multiple `t()` calls or by appending strings outside a translation key.


## Example Structure 

### locales/en/common.json

```json
{
    "buttons": {
        "buySymbol": "Buy {{symbol}}",
        "cancel": "Cancel",
        "confirm": "Confirm",
        "submit": "Submit"
    },
    "leverage": "Leverage",
    "asset": "Asset",
    "crossMargin": "Cross Margin"
}
```


## Untranslatable strings

### Internal errors / Exception messages

Do not create keys to translate error messages not displayed in UI.
For such cases, do prefix the error message with `[filename] ` to better convey this is not a message meant for user but for debugging.
