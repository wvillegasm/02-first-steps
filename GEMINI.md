# About the Project

This project aims to provide a guide to learn React.js with TypeScript.

## Tech Stack

- **Language:** TypeScript
- **Framework/Library:** React, Vite
- **Styling:** CSS Modules, TailwindCSS
- **Testing:** Vitest, React Testing Library

## Code Conventions

- **Style:** Follow ESLint rules from `eslint.config.js` and project formatting rules (e.g., Prettier). Code must pass lint/format checks before commit.
- **Naming:** Components in PascalCase, hooks in camelCase with the `use` prefix.
- **Commits:** Use Conventional Commits format: `type(scope): description` (e.g., `feat(auth): add login route`).

## Architecture and Structure

- `src/components`: Contains reusable components.
- `src/helpers`: Contains utility functions.
- `src/assets`: Contains static assets like images or SVGs.

## Rules and Guidelines

- Whenever a new business logic function is added to `src/helpers`, it must be accompanied by its corresponding test file.
- Do not install new dependencies without explicit authorization.
- Maintain compatibility with Node.js v20 (e.g., 20.x). Use an `.nvmrc` and `engines` in `package.json` to enforce the Node version.

## Important Files

- `vite.config.ts`: Main Vite configuration.
- `package.json`: Project dependencies and scripts.
