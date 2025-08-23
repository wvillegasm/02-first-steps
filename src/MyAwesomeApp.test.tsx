import { render, screen } from "@testing-library/react";
import { MyAwesomeApp } from "./MyAwesomeApp";
import { describe, test, expect } from "vitest";

describe("MyAwesomeApp", () => {
  test("should render the main title", () => {
    render(<MyAwesomeApp />);
    expect(screen.getByText("React Course")).toBeInTheDocument();
  });

  test("should render the subtitle", () => {
    render(<MyAwesomeApp />);
    expect(screen.getByText("Devtalles")).toBeInTheDocument();
  });

  test("should render the JSON object in a <pre> tag", () => {
    render(<MyAwesomeApp />);
    const preElement = screen.getByText(/title/i, { selector: 'pre' });
    expect(preElement).toBeInTheDocument();
    const expectedJson = JSON.stringify(
      { title: "React Course", subtitle: "Devtalles" },
      null,
      2
    );
    expect(preElement.textContent).toBe(expectedJson);
  });
});
