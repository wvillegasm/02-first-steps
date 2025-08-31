import { render, screen, within } from "@testing-library/react";
import { MyAwesomeApp } from "./MyAwesomeApp";

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
    const preElement = screen.getByLabelText(/app data/i);

    expect(preElement).toHaveTextContent(/"title":\s*"React Course"/);
    expect(preElement).toHaveTextContent(/"subtitle":\s*"Devtalles"/);
  });

  test("should have a form with street and city inputs", () => {
    render(<MyAwesomeApp />);

    const billingAddress = screen.getByLabelText(/billing address/i);

    expect(within(billingAddress).getByText(/street:/i)).toBeInTheDocument();

    const streetInput = screen.getByLabelText(/street:/i);
    const cityInput = screen.getByLabelText(/city:/i);

    expect(streetInput).toBeInTheDocument();
    expect(streetInput).toHaveAttribute("type", "text");
    expect(streetInput).toHaveAttribute("id", "street");

    expect(cityInput).toBeInTheDocument();

    const h1 = screen.getByTestId("last-name");
    expect(h1.innerHTML).toContain("Villalobos");
  });
});
