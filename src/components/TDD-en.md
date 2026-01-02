## Use of mocks for internal components

This is a crucial architectural debate. When defending the use of mocks for internal components like a `Validator` in Clean Architecture, you are not just discussing a testing preference; you are discussing **Architectural Integrity**.

Here is the technical justification, framed for a senior audience and grounded in industry standards (SOLID, Uncle Bob, and Martin Fowler).

## The Case for Mocking Ports in Clean Architecture

### 1. The Dependency Inversion Principle (DIP)

The most solid argument comes from the **DIP (the 'D' in SOLID)**. In Clean Architecture, the _Application Layer_ (Use Cases) should only depend on abstractions (Ports), never on concrete implementations (Adapters).

- **The Sustenance:** The `Validator` class acts as a **Port**. By using a mock, you are testing against the **Interface Contract**, not the **Implementation Detail**.
- **The Goal:** If you use the real `JoiValidator`, you are implicitly making your Use Case depend on Joi. If Joi is updated and its behavior changes, your business logic test fails. This violates the rule that high-level policies (Business Logic) should not be affected by low-level details (Validation Libraries).

### 2. "Solitary" vs. "Sociable" Unit Tests

According to Martin Fowler, there are two styles of unit testing:

- **Sociable Tests:** Use real collaborators (the Chicago/Classicist school).
- **Solitary Tests:** Use test doubles to isolate the unit (the London/Mockist school).

**In Hexagonal Architecture, Solitary Tests are the standard for Use Cases.** * **Why?** Because the Use Case is an **orchestrator**. Its only "job" is to coordinate the flow between the Domain and the Ports. We aren't testing *if the data is valid*; we are testing *if the Use Case correctly handles the scenario where a validator says the data is invalid\*.

### 3. Avoiding "Cascading Failures"

A senior engineer’s test suite should be a precision instrument.

- **The Problem:** If you use the real Joi schema and you make a typo in a Regex inside that schema, the `CreateSubscription` test will fail.
- **The Argument:** A test for a Use Case should have **exactly one reason to fail**: a bug in the orchestration logic. If it fails due to a validation schema error, the test is "noisy" and lacks **Failure Localization**. By mocking the validator, you ensure that if the test fails, the bug is definitely in the Use Case.

### 4. Protecting the "Boundary"

Alistair Cockburn (creator of Hexagonal Architecture) emphasizes the **Boundary**. The `Validator` is a boundary between your application and an external concern (data format).

- **The Sustenance:** Mocking the `Validator` is essentially **mocking the boundary**. It allows you to simulate edge cases that might be hard to trigger with real Joi logic (e.g., specific infrastructure exceptions or rare validation states) without having to setup complex Joi objects.

---

## Summary for the Team (The "Elevator Pitch")

> "We mock the `Validator` in our Use Case tests because we are verifying the **Orchestration Contract**.
> Testing the Use Case with a real Joi implementation creates **Hidden Coupling**. It makes our business logic tests fragile to changes in third-party libraries or schema updates.
> We ensure correctness via a **Dual-Layer Testing Strategy**:
>
> 1. **Unit Tests (Solitary):** Use Mocks to verify the Use Case logic in milliseconds.
> 2. **Contract/Integration Tests (Sociable):** Test the `JoiValidator` implementation separately to ensure the schema itself is correct.
>
> This gives us faster builds, better error localization, and true architectural decoupling."

---

# Foundations of Test-Driven Development (TDD)

## Why Tests Must Be Written in Isolation

---

## 1. What TDD Really Is

**Test-Driven Development (TDD)** is not simply “writing tests.”
It is a **design technique** where tests:

- Define the expected behavior
- Drive the structure of the code
- Force clear boundaries between components

In TDD:

1. **Red** → the test fails and clarifies the problem
2. **Green** → implement the minimum to make it pass
3. **Refactor** → improve the design without changing behavior

If tests **do not influence the design**, it is not TDD — it is late testing.

---

## 2. The First Core Principle: Tests in Isolation

### Definition

A test written in isolation validates **a single unit of behavior**, without depending on:

- Network
- Databases
- File system
- External APIs
- Time
- Real implementations of third-party libraries

This is **not a preference**.
It is a **necessary condition** for TDD to work as a design practice.

---

## 3. Why NOT Use Real Third-Party Implementations in Unit Tests?

### Principle 1: A Test Must Fail for One Reason Only

When using real libraries, a test can fail due to:

- API changes in the dependency
- Bugs in the library
- Hidden global state
- Environment misconfiguration
- Latency or hidden I/O

Result:
❌ You no longer know **what actually broke**.

TDD requires **clear causality**.

---

### Principle 2: Tests Describe _Your_ Contract, Not a Third Party’s

A third-party library:

- Was not designed by you
- Is outside your control
- Already has its own test suite

Using it directly in unit tests:

- Couples your tests to external implementation details
- Duplicates tests that are not your responsibility

**In TDD, you only care about how _your code_ uses the library**, not how the library works internally.

---

### Principle 3: Isolation Forces Better Design

Using stubs, spies, or mocks:

- Forces explicit interfaces
- Encourages dependency injection
- Reduces coupling
- Makes system boundaries visible

Tests become the **first clients of your design**.
If a test is hard to write without a real dependency, **the design is the problem**, not the test.

---

### Principle 4: Fast Feedback Is Essential

TDD lives or dies by fast **Red → Green → Refactor** cycles.

Real implementations often:

- Initialize resources
- Execute heavy logic
- Perform implicit I/O

A **unit test must run in milliseconds**, not seconds.

Slow tests ⇒ fewer cycles ⇒ poorer design.

---

## 4. “Third-Party Libraries Should Not Be Mocked” — Analyzing the Claim

### Common Argument

> “If you mock a library, you don’t know if it will work in production.”

### Correct Technical Answer

That is **not the responsibility of unit tests**.

That responsibility belongs to:

- Integration tests
- Contract tests
- End-to-end tests

Each test level has a distinct purpose.
Trying to validate everything at the unit level damages design and maintainability.

---

## 5. When SHOULD You Use Real Implementations?

Clear professional rule:

| Test Type         | Real Implementation? | Primary Goal     |
| ----------------- | -------------------- | ---------------- |
| Unit tests        | ❌ No                | Design and logic |
| Integration tests | ✅ Yes               | Real integration |
| End-to-end tests  | ✅ Yes               | Full system flow |

**TDD is primarily practiced at the unit level.**

---

## 6. Why Stubs and Spies Are NOT “Cheating”

In TDD:

- A **stub** defines expected responses
- A **spy** verifies observable effects
- A **mock** defines explicit contracts

They do not fake reality.
They **model it in a controlled way** to enable good design.

The right question in TDD is not:

> “Does this work with the whole system?”

But:

> “What do I need from this dependency to satisfy this behavior?”

---

## 7. The Golden Rule

> **If a unit test requires a real dependency to pass, the design is too tightly coupled.**

And an even stronger one:

> **If you have to defend using real libraries in unit tests, the test is not unit-level.**

---

## 8. Conclusion

Isolated tests:

- Are not a trend
- Are not dogma
- Are the natural consequence of wanting:
  - Good design
  - Low coupling
  - Fast feedback
  - Maintainable code

TDD is not about “testing more.”
It is about **designing better from the start**.

---

# TDD Example in React (ESM)

## BAD vs GOOD (Isolated Unit Tests + Clean Boundaries)

This example shows a very common scenario in React:

- A component fetches data from a server (third-party boundary: `fetch` / HTTP).
- It shows loading/error/success states.
- It performs a small piece of UI logic (rendering a list).

The key question: **Do we test React + our logic, or React + network + fetch implementation?**

---

# ✅ Business Requirement

Build a `<UsersList />` component:

- When mounted, it loads `/api/users`
- While loading: show `"Loading..."`
- On success: render user names as a list
- On error: show `"Something went wrong"`

---

# ❌ BAD: Component coupled to real `fetch` (hard to test, flaky, slow)

## Why it's bad

- Uses the real global `fetch` (or relies on environment polyfills)
- Tests are brittle and environment-dependent
- Difficult to control timing and edge cases
- The component is tightly coupled to transport details

## Implementation (bad)

```jsx
// UsersList.bad.jsx (ESM)
import React, { useEffect, useState } from "react";

export function UsersListBad() {
  const [state, setState] = useState({
    status: "idle",
    users: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, status: "loading" }));
      try {
        const res = await fetch("/api/users"); // ⚠️ hard dependency
        if (!res.ok) throw new Error("HTTP error");
        const users = await res.json();

        if (!cancelled) setState({ status: "success", users, error: null });
      } catch (err) {
        if (!cancelled) setState({ status: "error", users: [], error: err });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") return <p>Loading...</p>;
  if (state.status === "error") return <p>Something went wrong</p>;

  return (
    <ul>
      {state.users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

## Test (bad)

Often this becomes:

- A test that depends on the runtime having `fetch`
- Or a test that mocks global `fetch` in an ad-hoc way across files
- Or a test that accidentally hits a real server

Example of problematic test:

```jsx
// UsersList.bad.test.jsx
import { render, screen } from "@testing-library/react";
import { UsersListBad } from "./UsersList.bad.jsx";

test("renders users", async () => {
  render(<UsersListBad />);

  // ❌ This will hang or fail unless fetch is available & mocked correctly
  expect(await screen.findByText("Loading...")).toBeInTheDocument();
});
```

This is not _clean_ TDD: your unit tests become environment & tooling battles.

---

# ✅ GOOD: Inject a dependency boundary (service) and test in isolation

## The principle

- Move network logic behind a small dependency: `usersApi`
- The component depends on a simple interface: `usersApi.listUsers()`
- In tests, stub that interface
- In production, wire it to fetch/axios

This makes tests:

- fast
- deterministic
- focused on UI behavior
- resilient to network implementation changes

---

## 1) Create a tiny API module (boundary)

```js
// usersApi.js (ESM)
export function createUsersApi({ httpClient }) {
  if (!httpClient?.get) throw new Error("httpClient.get is required");

  return {
    async listUsers() {
      const res = await httpClient.get("/api/users");
      return res.data;
    },
  };
}
```

### Production httpClient (fetch adapter)

```js
// fetchHttpClient.js (ESM)
export const fetchHttpClient = {
  async get(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP error");
    const data = await res.json();
    return { data };
  },
};
```

---

## 2) Component depends on the boundary, not on fetch

```jsx
// UsersList.jsx (ESM)
import React, { useEffect, useState } from "react";

export function UsersList({ usersApi }) {
  const [state, setState] = useState({ status: "idle", users: [] });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: "loading", users: [] });

      try {
        const users = await usersApi.listUsers();
        if (!cancelled) setState({ status: "success", users });
      } catch {
        if (!cancelled) setState({ status: "error", users: [] });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [usersApi]);

  if (state.status === "loading") return <p>Loading...</p>;
  if (state.status === "error") return <p>Something went wrong</p>;

  return (
    <ul>
      {state.users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

---

## 3) Unit tests (good) with React Testing Library + Jest/Vitest

> These tests do NOT need real `fetch`.

```jsx
// UsersList.test.jsx (ESM)
import { render, screen } from "@testing-library/react";
import { UsersList } from "./UsersList.jsx";

describe("<UsersList /> (unit)", () => {
  test("shows loading then renders users on success", async () => {
    const usersApi = {
      listUsers: vi.fn().mockResolvedValue([
        { id: "1", name: "Ana" },
        { id: "2", name: "Luis" },
      ]),
    };

    render(<UsersList usersApi={usersApi} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Luis")).toBeInTheDocument();
    expect(usersApi.listUsers).toHaveBeenCalledTimes(1);
  });

  test("shows error UI when api fails", async () => {
    const usersApi = {
      listUsers: vi.fn().mockRejectedValue(new Error("boom")),
    };

    render(<UsersList usersApi={usersApi} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });
});
```

> Note: This example uses `vi.fn()` (Vitest).
> If you use Jest, replace `vi.fn()` with `jest.fn()`.

---

# ✅ Optional: Integration test (wire the real fetch adapter)

This is where you test “does the API boundary work with fetch”.

You can do this with:

- MSW (Mock Service Worker) in a controlled way, OR
- a test server

Example sketch:

```js
// usersApi.integration.test.js
import { createUsersApi } from "./usersApi.js";
import { fetchHttpClient } from "./fetchHttpClient.js";

test("integration: usersApi uses fetch adapter", async () => {
  const api = createUsersApi({ httpClient: fetchHttpClient });

  // Here you’d use MSW to mock /api/users response
  const users = await api.listUsers();

  expect(Array.isArray(users)).toBe(true);
});
```

---

# Key TDD Lesson in React

> **Don’t couple components to I/O details.
> Couple them to a small interface and inject it.**

This gives:

- isolated unit tests
- better component design
- easier refactors (fetch → axios → graphql, etc.)
- clearer architecture boundaries

---

# How TDD Guides Architecture

## Core Idea

> **In TDD, you don’t design the architecture first.
> Architecture emerges as a consequence of writing easy tests.**

If a test is:

- hard to write
- slow
- fragile
- dependent on infrastructure

👉 that is an **architectural signal**, not a testing problem.

---

## 1. TDD Forces Clear Boundaries

### What happens when you write the first test

When you start with a test, you naturally ask:

- What do I need to execute this behavior?
- What does this logic really depend on?
- What can I control from the test?

These questions **force a separation** between:

- business logic
- infrastructure (HTTP, DB, time, storage, frameworks)

### Architectural result

Explicit boundaries start to appear:

```
[ UI / Controller ]
|
[ Application / Use Case ]
|
[ Boundary / Port ]
|
[ Infrastructure ]
```

Not because “Clean Architecture says so”,
but because **without these boundaries the tests are painful or impossible**.

---

## 2. TDD Naturally Leads to Dependency Inversion (SOLID)

### Key observation

In TDD:

- the test must control dependencies
- what you control must be injected, not created internally

This naturally leads to:

- dependency injection
- dependency inversion (DIP)

### Conceptual example

❌ Implementation-driven architecture:

```js
function service() {
  const db = new RealDatabase();
  return db.save();
}
```

This is nearly impossible to test in isolation.

✅ TDD-driven architecture:

```js
function createService({ database }) {
  return {
    execute(data) {
      return database.save(data);
    },
  };
}
```

👉 This is not SOLID theory.
👉 It is a direct consequence of wanting simple tests.

---

## 3. TDD Defines What Is “Core” and What Is “Detail”

One of the most powerful architectural effects of TDD is this question:

> **Which parts of the system deserve fast unit tests?**

Implicit answer:

- business rules
- value-generating logic
- behavior that must remain stable

That becomes the **core of the system**.

Everything else:

- frameworks
- HTTP
- ORM
- UI
- persistence

👉 becomes **replaceable detail**.

### Resulting structure

```
Core (highly tested, fast)
-------------------------
- business rules
- use cases
- validations

Outer layers (less unit tests, more integration)
------------------------------------------------
- React
- Express
- Database
- External APIs
```

TDD **protects the core** and pushes details outward.

---

## 4. TDD Actively Reduces Coupling

### Clear coupling signal

If writing a test requires:

- mocking half the system
- initializing many collaborators
- knowing too many internal details

👉 that is **excessive coupling**.

### What TDD does

- penalizes coupling
- rewards simplicity
- exposes oversized classes and modules

This leads naturally to:

- small classes
- single-responsibility functions
- composition over inheritance

Not because of “clean code rules”,
but because **otherwise the tests become unmanageable**.

---

## 5. TDD Shapes Module Boundaries

### A typical TDD question

> “What do I need to import to test this behavior?”

If the answer is:

- many imports
- circular dependencies
- cross-module coupling

👉 the design is wrong.

### Emergent architecture

TDD favors:

- modules with a single reason to change
- one-directional dependencies
- dependency trees instead of tangled graphs

This aligns naturally with:

- feature-based architectures
- vertical slices
- bounded contexts

---

## 6. TDD Reveals Architectural Layers Through Test Levels

Without explicitly planning it, teams discover this structure:

| Test Level        | Architectural Level |
| ----------------- | ------------------- |
| Unit tests        | Core / Domain       |
| Integration tests | Boundaries          |
| End-to-end tests  | Full system         |

If you:

- test databases in unit tests → architecture is wrong
- test business rules only in E2E → feedback is too slow

👉 **Test levels expose architectural levels.**

---

## 7. TDD Prevents Big Design Up Front (BDUF)

### The key difference

❌ BDUF:

- Design the entire architecture
- Then implement
- Then adapt tests

✅ TDD:

- Design one behavior
- Let minimal structure emerge
- Refactor when real pressure appears

Architecture evolves based on **evidence**, not speculation.

---

## 8. Architectural Signals You Get for Free with TDD

When TDD is practiced correctly, you get clear signals:

| Test Signal             | Architectural Meaning     |
| ----------------------- | ------------------------- |
| Tests are hard to write | Tight coupling            |
| Excessive mocking       | Classes too large         |
| Slow tests              | Infrastructure leaking in |
| Fragile tests           | Hidden dependencies       |
| Simple tests            | Good design               |

Tests become **design sensors**.

---

## 9. Practical Rule (Very Important)

> **If testing something requires deep knowledge of the system, the architecture is failing.**

An even stronger one:

> **The right architecture makes tests write themselves.**

---

## 10. Short Summary

- TDD does not “apply” an architecture
- TDD **reveals** the right architecture
- Decisions are not made by fashion
- They are made because they make tests:

  - simple
  - fast
  - isolated
  - expressive

---

# Architectural Anti-Patterns Revealed by TDD

TDD is not only a development technique — it is a **diagnostic tool**.
When practiced correctly, it exposes architectural problems **early**, often before production bugs appear.

Below are the **most common architectural anti-patterns** that TDD reliably reveals, **why they happen**, and **how TDD pushes you toward better design**.

---

## 1. The “God Object” (Large, All-Knowing Classes)

### Symptoms in TDD

- Tests require many mocks/stubs
- Test setup is long and complex
- One change breaks many unrelated tests

### Architectural Smell

- Too many responsibilities
- Business logic + orchestration + infrastructure mixed
- Violates Single Responsibility Principle (SRP)

### Example Smell

```js
class OrderService {
  constructor(db, mailer, payment, logger, cache) { ... }
  processOrder() { ... }
}
```

### What TDD Reveals

Writing tests feels painful and verbose.

👉 TDD response:

- Split responsibilities
- Extract smaller collaborators
- Move logic into focused units

**TDD pressure → smaller, composable objects**

---

## 2. Hard-Coded Dependencies (No Dependency Injection)

### Symptoms in TDD

- Impossible to test without real DB / API
- Requires monkey-patching globals
- Tests depend on environment setup

### Architectural Smell

- Tight coupling
- No dependency inversion
- Hidden dependencies

### Example Smell

```js
function sendEmail() {
  const client = new SmtpClient();
  client.send(...);
}
```

### What TDD Reveals

You cannot substitute dependencies in tests.

👉 TDD response:

- Inject dependencies
- Depend on interfaces, not implementations

```js
function createMailer({ smtpClient }) {
  return {
    send(email) {
      smtpClient.send(email);
    },
  };
}
```

**TDD pressure → Dependency Inversion (SOLID)**

---

## 3. Infrastructure Leaking Into Core Logic

### Symptoms in TDD

- Unit tests touch DB, HTTP, filesystem
- Tests are slow
- Tests fail intermittently

### Architectural Smell

- Core logic depends on infrastructure
- Business rules are not isolated

### Example Smell

```js
function calculateInvoice() {
  const data = db.query(...);
  return data.total * TAX;
}
```

### What TDD Reveals

You cannot test business rules without infrastructure.

👉 TDD response:

- Extract business logic
- Push infrastructure behind boundaries

**TDD pressure → Clean / Hexagonal Architecture**

---

## 4. Over-Mocking (Mocking Everything)

### Symptoms in TDD

- Tests assert implementation details
- Refactoring breaks many tests
- Tests read like scripts, not behavior

### Architectural Smell

- Poorly defined boundaries
- Tests coupled to internals
- Fear-driven testing

### Example Smell

```js
expect(repo.save).toHaveBeenCalled();
expect(logger.log).toHaveBeenCalled();
expect(cache.set).toHaveBeenCalled();
```

### What TDD Reveals

Tests are fragile and block refactoring.

👉 TDD correction:

- Mock only **boundaries**
- Assert **observable behavior**, not calls

**TDD pressure → behavior-focused design**

---

## 5. Anemic Domain Model

### Symptoms in TDD

- Tests focus on data plumbing
- Logic scattered across services
- Objects are just data containers

### Architectural Smell

- No behavior in domain objects
- Business rules live in procedural code

### Example Smell

```js
function applyDiscount(order) {
  if (order.total > 100) order.discount = 0.1;
}
```

### What TDD Reveals

Hard to test behavior coherently.

👉 TDD response:

- Move behavior into domain objects

```js
class Order {
  applyDiscount() { ... }
}
```

**TDD pressure → Rich domain models**

---

## 6. “Test-After” Architecture (Testing as an Afterthought)

### Symptoms in TDD

- Tests are added later
- Code resists testing
- Many workarounds in tests

### Architectural Smell

- Architecture designed without testability
- Hidden complexity
- Rigid design

### What TDD Reveals

Retrofitting tests is painful.

👉 TDD response:

- Design test-first
- Let tests shape the design

**TDD pressure → Evolvable architecture**

---

## 7. Excessive End-to-End Testing

### Symptoms in TDD

- Long feedback cycles
- Hard-to-debug failures
- Few unit tests

### Architectural Smell

- Lack of clear boundaries
- Fear of refactoring
- Poor modularity

### What TDD Reveals

You’re compensating for weak architecture.

👉 TDD response:

- Strengthen unit and integration tests
- Push complexity into testable core

**TDD pressure → balanced test pyramid**

---

## 8. Shared Mutable State

### Symptoms in TDD

- Tests pass individually but fail together
- Order-dependent tests
- Random failures

### Architectural Smell

- Global state
- Hidden side effects
- Non-deterministic behavior

### Example Smell

```js
let config = {};
export function setConfig(c) {
  config = c;
}
```

### What TDD Reveals

Tests become flaky.

👉 TDD response:

- Make state explicit
- Pass dependencies and state explicitly

**TDD pressure → functional, explicit design**

---

## 9. Circular Dependencies

### Symptoms in TDD

- Hard to isolate modules
- Mocking becomes complex
- Imports feel tangled

### Architectural Smell

- Poor module boundaries
- Bidirectional dependencies

### What TDD Reveals

Tests require too much context.

👉 TDD response:

- Break cycles
- Introduce ports/interfaces

**TDD pressure → unidirectional dependency flow**

---

## 10. Golden Rule (Architectural Diagnostic)

> **If writing a unit test feels harder than writing the production code,
> the architecture is wrong.**

And the stronger version:

> **Good architecture makes the “right thing” the easiest thing to test.**

---

## Summary

TDD exposes architectural problems early by:

- Penalizing coupling
- Punishing hidden dependencies
- Rewarding simplicity and clarity

It doesn’t just test code —
it **teaches the architecture how to improve**.

---
