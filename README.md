# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

## Unit Testing

### Component Mocking Philosophy: Spying vs. Rendering

When mocking components, there are two common approaches, each with its own trade-offs.

#### 1. The "Spy" Approach (Recommended)

In this method, the mock is a simple "spy" function that doesn't replicate the component's rendering logic. Its only job is to record when it's called and with what props.

```tsx
// The mock is just a spy that renders a placeholder
const mockItemCounter = vi.fn((_props: unknown) => (
  <div data-testid="item-counter" />
));

// The test then asserts that the spy was called correctly
expect(mockItemCounter).toHaveBeenCalledWith(
  expect.objectContaining({ name: "Nintendo Switch" })
);
```

**Why this is the recommended practice:**

- **Focus and Isolation:** It perfectly isolates the component under test. You are testing _its_ behavior (that it passes the correct props) without relying on the implementation details of its children.
- **Less Brittle Tests:** If the `ItemCounter` component's internal structure changes (e.g., how it displays the `name` prop), your tests for the parent component will not break. The test correctly focuses on the _contract_ between the two components (the props).
- **Clarity of Intent:** The test clearly states, "I expect this component to call its child with these specific props."

#### 2. The "Implementation" Approach

This alternative involves creating a mock that more closely mimics the real component's rendering. The test then queries the DOM for the content rendered by the mock.

```tsx
// The mock renders content based on its props
const mockItemCounter = vi.fn(({ name }: ItemCounterProps) => (
  <div data-testid="item-counter">{name}</div>
));

// The test asserts on the rendered output of the mock
render(<FirstStepsApp />);
expect(screen.getByText("Nintendo Switch")).toBeInTheDocument();
```

**Trade-offs:**

- **Pro:** The test assertions might feel more intuitive because you are interacting with the DOM, similar to how a user would.
- **Con:** It makes the test more brittle. If you change the implementation of the _mock_ (e.g., wrap the name in a `<span>`), the test will fail, even though the component under test is behaving correctly. The test becomes coupled to the mock's implementation.

**Conclusion:**

For most unit and integration tests, the **"Spy" approach is the recommended and more robust practice.** It leads to more maintainable and less brittle tests that correctly isolate the component under test.

### Mocking Components

When unit testing React components, it's often useful to mock child components to isolate the component under test. This ensures that the test focuses only on the component's behavior and is not affected by the implementation details of its children.

Below are examples of how to mock the `ItemCounter` component within `FirstStepsApp` using different testing frameworks.

#### Vitest

Vitest provides a built-in `vi` object for mocking, which is compatible with Jest's API.

```tsx
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { FirstStepsApp } from "./FirstStepsApp";

// Define the props for the mocked component
interface ItemCounterProps {
  name: string;
  quantity: number;
  onQuantityChange: (name: string, delta: number) => void;
  onDeleteItem: (name: string) => void;
}

// Create a mock function for the ItemCounter component
const mockItemCounter = vi.fn((props: ItemCounterProps) => (
  <div data-testid="item-counter" />
));

// Mock the entire module that exports ItemCounter
vi.mock("./components/ItemCounter", () => ({
  ItemCounter: (props: ItemCounterProps) => mockItemCounter(props),
}));

describe("FirstStepsApp", () => {
  // Clear mock history after each test to ensure isolation
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should render three times", () => {
    render(<FirstStepsApp />);
    expect(screen.getAllByTestId("item-counter")).toHaveLength(3);
  });

  test("should render item counters with correct props", () => {
    const expectedProps = [
      { name: "Nintendo Switch", quantity: 1 },
      { name: "Xbox Series X", quantity: 1 },
      { name: "PlayStation 5", quantity: 1 },
    ];

    render(<FirstStepsApp />);

    // Verify that the mock was called three times
    expect(mockItemCounter).toHaveBeenCalledTimes(3);

    // Verify that each call received the correct props
    expectedProps.forEach((element, idx) => {
      expect(mockItemCounter).toHaveBeenNthCalledWith(
        idx + 1,
        expect.objectContaining({
          name: element.name,
          quantity: element.quantity,
          onQuantityChange: expect.any(Function),
          onDeleteItem: expect.any(Function),
        })
      );
    });
  });
});
```

**Key Concepts:**

- **`vi.fn()`**: Creates a spy, a function that records information about its calls.
- **`vi.mock()`**: Replaces a module with a mock implementation. The factory function returns the mocked module's exports.
- **`vi.clearAllMocks()`**: Resets the `mock.calls` and `mock.instances` properties of all spies.

---

#### Jest

Jest's mocking API is nearly identical to Vitest's. Simply replace `vi` with `jest`.

```tsx
import { render, screen } from "@testing-library/react";
import { FirstStepsApp } from "./FirstStepsApp";

// Define the props for the mocked component
interface ItemCounterProps {
  name: string;
  quantity: number;
  onQuantityChange: (name: string, delta: number) => void;
  onDeleteItem: (name: string) => void;
}

// Create a mock function for the ItemCounter component
const mockItemCounter = jest.fn((props: ItemCounterProps) => (
  <div data-testid="item-counter" />
));

// Mock the entire module that exports ItemCounter
jest.mock("./components/ItemCounter", () => ({
  ItemCounter: (props: ItemCounterProps) => mockItemCounter(props),
}));

describe("FirstStepsApp", () => {
  // Clear mock history after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render three times", () => {
    render(<FirstStepsApp />);
    expect(screen.getAllByTestId("item-counter")).toHaveLength(3);
  });

  test("should render item counters with correct props", () => {
    const expectedProps = [
      { name: "Nintendo Switch", quantity: 1 },
      { name: "Xbox Series X", quantity: 1 },
      { name: "PlayStation 5", quantity: 1 },
    ];

    render(<FirstStepsApp />);

    expect(mockItemCounter).toHaveBeenCalledTimes(3);

    expectedProps.forEach((element, idx) => {
      expect(mockItemCounter).toHaveBeenNthCalledWith(
        idx + 1,
        expect.objectContaining({
          name: element.name,
          quantity: element.quantity,
          onQuantityChange: expect.any(Function),
          onDeleteItem: expect.any(Function),
        })
      );
    });
  });
});
```

**Key Concepts:**

- **`jest.fn()`**: Equivalent to `vi.fn()`.
- **`jest.mock()`**: Equivalent to `vi.mock()`.
- **`jest.clearAllMocks()`**: Equivalent to `vi.clearAllMocks()`.

---

#### Mocha (CommonJS)

Mocha does not have a built-in mocking library. A common choice is to use **Sinon** for spies and stubs and **Proxyquire** for module mocking.

First, install the dependencies:

```bash
npm install --save-dev sinon proxyquire chai @types/sinon @types/chai
```

Then, write the test:

```tsx
import { render, screen } from "@testing-library/react";
import { expect } from "chai";
import proxyquire from "proxyquire";
import sinon from "sinon";
import React from "react";

// Define the props for the mocked component
interface ItemCounterProps {
  name: string;
  quantity: number;
  onQuantityChange: (name: string, delta: number) => void;
  onDeleteItem: (name: string) => void;
}

// Create a Sinon spy for the ItemCounter component
const mockItemCounter = sinon.spy((props: ItemCounterProps) => (
  <div data-testid="item-counter" />
));

// Use Proxyquire to import FirstStepsApp with a mocked ItemCounter
const { FirstStepsApp } = proxyquire("../src/FirstStepsApp", {
  "./components/ItemCounter": {
    ItemCounter: (props: ItemCounterProps) => mockItemCounter(props),
  },
});

describe("FirstStepsApp", () => {
  // Reset spy history after each test
  afterEach(() => {
    mockItemCounter.resetHistory();
  });

  it("should render three times", () => {
    render(<FirstStepsApp />);
    expect(screen.getAllByTestId("item-counter")).to.have.lengthOf(3);
  });

  it("should render item counters with correct props", () => {
    const expectedProps = [
      { name: "Nintendo Switch", quantity: 1 },
      { name: "Xbox Series X", quantity: 1 },
      { name: "PlayStation 5", quantity: 1 },
    ];

    render(<FirstStepsApp />);

    expect(mockItemCounter.callCount).to.equal(3);

    expectedProps.forEach((element, idx) => {
      const { firstArg } = mockItemCounter.getCall(idx);
      expect(firstArg).to.deep.include({
        name: element.name,
        quantity: element.quantity,
      });
      expect(firstArg.onQuantityChange).to.be.a("function");
      expect(firstArg.onDeleteItem).to.be.a("function");
    });
  });
});
```

**Key Concepts:**

- **`sinon.spy()`**: Creates a spy to track function calls.
- **`proxyquire`**: Allows you to override `require()` dependencies for the module you are testing.
- **`chai`**: An assertion library commonly used with Mocha.

---

#### Mocha (ES Modules)

Mocking ES Modules is more complex. A library like **`mock-import`** can be used.

First, install the dependencies:

```bash
npm install --save-dev sinon mock-import chai @types/sinon @types/chai
```

Then, write the test:

```tsx
import { render, screen } from "@testing-library/react";
import { expect } from "chai";
import { mockImport, stopAll } from "mock-import";
import sinon from "sinon";
import React from "react";

// Define the props for the mocked component
interface ItemCounterProps {
  name: string;
  quantity: number;
  onQuantityChange: (name: string, delta: number) => void;
  onDeleteItem: (name: string) => void;
}

// Create a Sinon spy
const mockItemCounter = sinon.spy((props: ItemCounterProps) => (
  <div data-testid="item-counter" />
));

// Mock the import before FirstStepsApp is imported
mockImport("./components/ItemCounter", {
  ItemCounter: (props: ItemCounterProps) => mockItemCounter(props),
});

// Dynamically import the module under test after setting up the mock
const { FirstStepsApp } = await import("../src/FirstStepsApp");

describe("FirstStepsApp", () => {
  afterEach(() => {
    mockItemCounter.resetHistory();
  });

  // Clean up all mocks after the suite finishes
  after(() => {
    stopAll();
  });

  it("should render three times", () => {
    render(<FirstStepsApp />);
    expect(screen.getAllByTestId("item-counter")).to.have.lengthOf(3);
  });

  it("should render item counters with correct props", () => {
    const expectedProps = [
      { name: "Nintendo Switch", quantity: 1 },
      { name: "Xbox Series X", quantity: 1 },
      { name: "PlayStation 5", quantity: 1 },
    ];

    render(<FirstStepsApp />);

    expect(mockItemCounter.callCount).to.equal(3);

    expectedProps.forEach((element, idx) => {
      const { firstArg } = mockItemCounter.getCall(idx);
      expect(firstArg).to.deep.include({
        name: element.name,
        quantity: element.quantity,
      });
      expect(firstArg.onQuantityChange).to.be.a("function");
      expect(firstArg.onDeleteItem).to.be.a("function");
    });
  });
});
```

**Key Concepts:**

- **`mock-import`**: Intercepts ES module imports and replaces them with mocks.
- **Dynamic `import()`**: The module being tested must be imported _after_ the mock is configured.
- **`stopAll()`**: A cleanup function from `mock-import` to remove all active mocks.
