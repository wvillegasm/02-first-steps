# AI Coding Instructions for React First Steps Project

## Project Overview

This is a React 19 + TypeScript + Vite educational project focused on learning React fundamentals. It's part of a DevTalles course structure [DevTalles-corp/react-first-steps](https://github.com/DevTalles-corp/react-first-steps/tree/fin-seccion-04), emphasizing component composition, state management, and TypeScript integration.

## Key Architecture Patterns

### Component Structure

- **Entry Point**: `src/main.tsx` → `FirstStepsApp` → individual components
- **Components**: Located in `src/components/` with co-located CSS files
- **Naming**: Use PascalCase for components, prefer named exports: `export const ComponentName`
- **Props**: Always define TypeScript interfaces for component props (see `ItemCounter.tsx` and `UserCard.tsx`)

### State Management Pattern

- Use `useState` with immutable updates via spread operator and `map()` transformations
- State lifting: Parent component (`FirstStepsApp`) manages shared state, passes handlers down
- Example pattern from `FirstStepsApp.tsx`:
  ```tsx
  const handleQuantityChange = (name: string, delta: number) => {
    setProductItems((prevItems) =>
      prevItems.map((item) =>
        item.name === name ? { ...item, quantity: item.quantity + delta } : item
      )
    );
  };
  ```

### TypeScript Conventions

- Use `import type` for type-only imports (CSSProperties, interface definitions)
- Enable strict mode with `noUnusedLocals` and `noUnusedParameters`
- Prefer explicit prop interfaces over inline types
- Use React.FC type annotation: `export const Component: React.FC<Props> = ({ prop }) =>`
- **Documentation**: All utility functions must have JSDoc comments with `@param`, `@returns`, `@throws`, and `@example` annotations for educational clarity

### CSS/Styling Approach

- Co-locate CSS files with components (e.g., `ItemCounter.tsx` + `ItemCounter.css`)
- Use CSS classes with semantic naming (`.item-row`, `.quantity-controls`)
- Inline styles for dynamic/computed values using CSSProperties type

## Pull Request Review

- Use file `.github/pr-reviewer-prompt.md` as a template for PR reviews.

## AI Coding Instructions — React First Steps (concise)

This file gives a minimal, actionable guide for AI coding agents working on this learning repo. Focus on discoverable patterns and concrete examples.

### Big picture

- Entry: `src/main.tsx` → `FirstStepsApp` composes `src/components/*` (co-located CSS).
- Parent lifts state (see `FirstStepsApp.tsx` product list). Child `ItemCounter` receives callbacks for quantity and delete.

### Key files to read first

- `src/FirstStepsApp.tsx` — state + handlers (`handleQuantityChange`, `handleDeleteItem`).
- `src/components/ItemCounter.tsx` — props interface, guard clauses, UI controls.
- `src/helpers/*` — utility functions (must have JSDoc).
- `vite.config.ts`, `vitest.config.ts`, `tsconfig.app.json`, `tsconfig.test.json` — build/test wiring.

### Concrete conventions (do exactly)

- Use PascalCase components and named exports: `export const Foo: React.FC<Props> = () => {}`.
- Define prop interfaces above the component; prefer `import type` for types.
- State updates must be immutable: prefer `setState(prev => prev.map(...) | prev.filter(...))`.
- Validate inputs in handlers (e.g., prevent negative quantities).
- All utility functions require JSDoc with `@param`, `@returns`, `@throws`, and `@example`.

### Testing & TypeScript rules

- Tests use Vitest. `vitest.config.ts` enables `globals: true` and references `tsconfig.test.json`.
- Keep test types out of the app build: `tsconfig.app.json` excludes `**/*.test.*` and `tsconfig.test.json` includes `vitest/globals`.
- Run tests: `npm run test` (watch) or `npm run test -- --run` for CI.

### Examples

- Parent handler (FirstStepsApp):
  `const handleDeleteItem = (name: string) => setProductItems(prev => prev.filter(i => i.name !== name));`
- Child prop (ItemCounter):
  `interface ItemCounterProps { name:string; quantity:number; onQuantityChange:(n:string,d:number)=>void; onDeleteItem:(n:string)=>void }`

### Pull request & change-report workflow

- Use `git diff main` to collect changes.
- Add a `changes/feature-*.md` file with: Summary, Breaking changes, File-by-file details, Testing checklist, Reviewers.

### Quick checks before finishing a change

1. `npm run lint` — ESLint rules
2. `npm run test -- --run` — unit tests
3. `npm run build` — TypeScript + Vite build

If anything is unclear, ask for the specific file or area to inspect and I will update these instructions.
