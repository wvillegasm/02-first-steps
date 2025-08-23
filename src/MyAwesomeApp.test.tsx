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
    const preElement = screen.getByRole('region', { name: /app data/i });
    expect(preElement).toHaveTextContent(/"title":\s*"React Course"/);
    expect(preElement).toHaveTextContent(/"subtitle":\s*"Devtalles"/);
  });
});
