# About the Project

This project aims to provide a guide to learn React.js with TypeScript.

## Tech Stack

- **Language:** TypeScript
- **Framework/Library:** React, Vite
- **Styling:** CSS Modules, TailwindCSS
- **Testing:** Vitest, React Testing Library

## Code Conventions

- **Style:** Follow the ESLint rules defined in `eslint.config.js`.
- **Naming:** Components in PascalCase, hooks in camelCase with the `use` prefix.
- **Commits:** [e.g., Use the Conventional Commits format: `feat(scope): description`.]

## Architecture and Structure

- `src/components`: Contains reusable components.
- `src/helpers`: Contains utility functions.
- `src/assets`: Contains static assets like images or SVGs.

## Rules and Guidelines

- Whenever a new business logic function is added to `src/helpers`, it must be accompanied by its corresponding test file.
- Do not install new dependencies without explicit authorization.
- Maintain compatibility with Node.js v20.

## Important Files

- `vite.config.ts`: Main Vite configuration.
- `package.json`: Project dependencies and scripts.
