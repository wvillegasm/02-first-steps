import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FirstStepsApp } from "./FirstStepsApp";

describe("FirstStepsApp", () => {
  test("renders all initial product items", () => {
    render(<FirstStepsApp />);
    expect(
      screen.getByRole("region", { name: /nintendo switch/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /xbox series x/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /playstation 5/i })
    ).toBeInTheDocument();
  });

  test("deletes an item when delete button is clicked", async () => {
    const user = userEvent.setup();

    render(<FirstStepsApp />);
    const xboxRow = screen.getByRole("region", { name: /xbox series x/i });
    expect(xboxRow).toBeInTheDocument();

    const deleteButton = within(xboxRow).getByRole("button", {
      name: /delete/i,
    });

    await user.click(deleteButton);

    expect(
      screen.queryByRole("region", { name: /xbox series x/i })
    ).not.toBeInTheDocument();
  });

  test("increases item quantity when '+' button is clicked", async () => {
    const user = userEvent.setup();

    render(<FirstStepsApp />);

    const nintendoRow = screen.getByRole("region", {
      name: /nintendo switch/i,
    });

    const increaseButton = within(nintendoRow).getByRole("button", {
      name: "+",
    });

    await user.click(increaseButton);

    const quantityDisplay = within(nintendoRow).getByRole("status", {
      name: /quantity/i,
    });

    expect(quantityDisplay).toBeInTheDocument();
    expect(quantityDisplay.textContent).toBe("2");
  });

  test("decreases item quantity when '-' button is clicked", async () => {
    const user = userEvent.setup();
    render(<FirstStepsApp />);

    const nintendoRow = screen.getByRole("region", {
      name: /nintendo switch/i,
    });

    const increaseButton = within(nintendoRow).getByRole("button", {
      name: "+",
    });

    await user.click(increaseButton);
    await user.click(increaseButton);
    const quantityDisplay = within(nintendoRow).getByText("3", {
      selector: ".quantity-display",
    });

    expect(quantityDisplay).toBeInTheDocument();
    expect(quantityDisplay.textContent).toBe("3");

    const decreaseButton = within(nintendoRow).getByRole("button", {
      name: "-",
    });

    await user.click(decreaseButton);
    expect(quantityDisplay.textContent).toBe("2");
  });

  test("does not allow quantity to go below zero", async () => {
    const user = userEvent.setup();

    render(<FirstStepsApp />);

    const nintendoRow = screen.getByRole("region", {
      name: /nintendo switch/i,
    });

    const quantityDisplay = within(nintendoRow).getByText("1", {
      selector: ".quantity-display",
    });

    expect(quantityDisplay).toBeInTheDocument();
    expect(quantityDisplay.textContent).toBe("1");

    const decreaseButton = within(nintendoRow).getByRole("button", {
      name: "-",
    });

    await user.click(decreaseButton);
    await user.click(decreaseButton);
    expect(quantityDisplay.textContent).toBe("0");
  });
});
