import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FirstStepsApp } from "./FirstStepsApp";
import { describe, test, expect } from "vitest";

describe("FirstStepsApp", () => {
  test("should render all initial product items", () => {
    render(<FirstStepsApp />);
    expect(screen.getByText("Nintendo Switch")).toBeInTheDocument();
    expect(screen.getByText("Xbox Series X")).toBeInTheDocument();
    expect(screen.getByText("PlayStation 5")).toBeInTheDocument();
  });

  test("should delete an item when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<FirstStepsApp />);

    const xboxItem = screen.getByText("Xbox Series X");
    expect(xboxItem).toBeInTheDocument();

    const xboxRow = screen.getByText("Xbox Series X").closest("section");
    const deleteButton = within(xboxRow!).getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(screen.queryByText("Xbox Series X")).not.toBeInTheDocument();
  });

  test("should increase item quantity when '+' button is clicked", async () => {
    const user = userEvent.setup();
    render(<FirstStepsApp />);

    const nintendoRow = screen.getByText("Nintendo Switch").closest("section");
    expect(nintendoRow).not.toBeNull();

    const increaseButton = within(nintendoRow as HTMLElement).getByRole('button', { name: '+' });
    await user.click(increaseButton);
    const quantityDisplay = within(nintendoRow as HTMLElement).getByText("2", { selector: '.quantity-display' });
    expect(quantityDisplay).toBeInTheDocument();

    expect(quantityDisplay?.textContent).toBe("2");

  });

  test("should decrease item quantity when '-' button is clicked", async () => {
    const user = userEvent.setup();
    render(<FirstStepsApp />);
    
    const nintendoRow = screen.getByText("Nintendo Switch").closest("section");
    const quantityDisplay = nintendoRow?.querySelector(".quantity-display");
    const increaseButton = nintendoRow?.querySelector("button:last-of-type");
    await user.click(increaseButton!)
    await user.click(increaseButton!)
    expect(quantityDisplay?.textContent).toBe("3");

    const decreaseButton = nintendoRow?.querySelector("button:first-of-type");
    await user.click(decreaseButton!)

    expect(quantityDisplay?.textContent).toBe("2");
  });

  test("should not allow quantity to go below zero", async () => {
    const user = userEvent.setup();
    render(<FirstStepsApp />);
    
    const nintendoRow = screen.getByText("Nintendo Switch").closest("section");
    const quantityDisplay = nintendoRow?.querySelector(".quantity-display");
    expect(quantityDisplay?.textContent).toBe("1");

    const decreaseButton = nintendoRow?.querySelector("button:first-of-type");
    await user.click(decreaseButton!)
    await user.click(decreaseButton!)

    expect(quantityDisplay?.textContent).toBe("0");
  });
});
