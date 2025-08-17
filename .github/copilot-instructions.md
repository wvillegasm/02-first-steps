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
- Mobile-first responsive design with flexbox layouts

## Development Workflow

### Available Scripts

- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - TypeScript compilation + Vite production build
- `npm run lint` - ESLint with React hooks and TypeScript rules
- `npm run preview` - Preview production build locally

### File Organization

```
src/
├── main.tsx              # App entry point
├── FirstStepsApp.tsx     # Main app component
├── MyAwesomeApp.tsx      # Example/homework component
└── components/
    ├── ItemCounter.tsx   # Stateful counter with callbacks
    ├── ItemCounter.css
    ├── UserCard.tsx      # Simple display component
    └── UserCard.css
```

### Component Communication

- Parent-to-child: Props
- Child-to-parent: Callback functions passed as props
- Prevent negative values with guard clauses in event handlers
- Use descriptive callback names: `onQuantityChange`, `onHandleQuantity`

## Project-Specific Conventions

### Educational Context

- This is a learning project - prioritize clarity and optimization
- Homework assignments in `homeworks/` directory provide component requirements
- Components should demonstrate specific React concepts (state, props, event handling)

### ESLint Configuration

- Uses TypeScript ESLint with React hooks rules
- React Refresh plugin for Vite HMR compatibility
- Configured for browser globals and ES2022 features

### Build System

- Vite with SWC for fast TypeScript compilation and React refresh
- TypeScript project references: separate configs for app (`tsconfig.app.json`) and Node (`tsconfig.node.json`)
- ESNext modules with bundler resolution for modern tooling

## Common Patterns to Follow

1. Always define prop interfaces before component declaration
2. Use functional components with hooks (no class components)
3. Implement guard clauses for edge cases (negative quantities, etc.)
4. Prefer controlled components with explicit state management
5. Use semantic HTML elements (`<section>`, `<button>`) for accessibility
6. **Document all utility functions** with comprehensive JSDoc including examples and parameter descriptions

## AI Coding Instructions for Pull Request Generation

### The Process

The instructions outline a clear, two-step process:

1.  **Analyze Branch Changes**: This is the discovery phase. The assistant is instructed to use a specific Git command (`git diff main...`) to compare the current branch with the `main` branch. This command identifies every single line of code that has been added, removed, or modified. The purpose is to gather all the raw data about the changes.

2.  **Generate the Pull Request Description**: This is the reporting phase. After analyzing the changes, the assistant must format that information into a predefined template. This ensures that the context, details, and verification steps for the changes are presented in a structured way.

3.  **File for Changes Report**: Create the changes report inside of the `changes/tracking-changes.md` file.

---

### The Pull Request Template

1.  **File for Pull Request Description**: Create a new file in the `changes/` directory with a name that reflects the changes made (e.g., `changes/feature-xyz.md`).

The template is broken down into several sections, each with a specific purpose:

- **📝 Summary**: A high-level overview. This section answers the "why" behind the PR. It explains the purpose of the changes, linking them to a specific feature or bug fix (e.g., `Fixes #123`).

- **💥 Breaking Changes**: A critical alert section. It forces the developer to declare if their changes might break other parts of the application, which is vital information for reviewers.

- **✨ Changes Details**: The core of the report. This provides a file-by-file breakdown of what was changed and why. It allows reviewers to quickly understand the scope and logic of the modifications before diving into the code itself.

- **🖼️ Screenshots / GIFs**: Visual evidence. For any changes that affect the user interface, this section provides visual proof of what the changes look like, which is often clearer than a text description.

- **✅ Testing**: A quality assurance checklist. It confirms what kind of testing was performed to ensure the changes work correctly and don't introduce new bugs.

- **👀 Reviewers**: A call to action. It suggests which team members should review the code, helping to streamline the review process.
