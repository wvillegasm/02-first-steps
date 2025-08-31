import { render, screen } from "@testing-library/react";
import { FirstStepsApp } from "./FirstStepsApp";

interface ItemCounterProps {
  name: string;
  quantity: number;
  onQuantityChange: (name: string, delta: number) => void;
  onDeleteItem: (name: string) => void;
}

const mockItemCounter: React.FC<ItemCounterProps> = vi.fn(
  (props: ItemCounterProps) => <div data-testid="item-counter" />
);

vi.mock("./components/ItemCounter", () => ({
  ItemCounter: (props: ItemCounterProps) => mockItemCounter(props),
}));

describe("FirstStepsApp", () => {
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
