We use prettier for formatting.

### Names
- Use PascalCase for `React components`, `types` and `interfaces`.
- Use UPPERCASE for `enums`.
- user snake_case for files not related with the React application.
- Use whole words in names when possible.

### Types
- Do not export `types`, `interfaces` or `functions` unless you need then elsewhere.
- Do not introduce values in the global namespace.

### Style
- Do not use `arrow functions` unless it offers a clear advantage (for instance, when a React component only includes the return statement).
- Do not use `@ts-ignore` or `any` unless strictly necessary.

### CSS
- Try not to use pixel units, instead, use `$grid-unit`. You can multiply this unit by any number.
- Do not use colors not included in `colors.scss`.
- Do not use font not included in `mixins.scss`.
