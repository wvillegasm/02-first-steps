import "./ItemCounter.css";

interface ItemCounterProps {
  name: string;
  quantity: number;
  onQuantityChange: (name: string, delta: number) => void;
  onDeleteItem: (name: string) => void;
}

export const ItemCounter: React.FC<ItemCounterProps> = ({
  name,
  quantity,
  onQuantityChange,
  onDeleteItem,
}) => {
  const onHandleQuantity = (delta: number) => {
    // Handle quantity change logic here
    if (quantity + delta < 0) return; // Prevent negative quantities
    onQuantityChange(name, delta);
  };

  return (
    <section className="item-row" aria-label={name}>
      {/* Image would go here */}
      <div className="item-details">
        <span className="item-text">{name}</span>
        <div className="controls-container">
          <div className="quantity-controls">
            <button
              className="quantity-btn"
              onClick={() => onHandleQuantity(-1)}
            >
              -
            </button>
            <span
              className="quantity-display"
              role="status"
              aria-label={`Quantity of ${name}: ${quantity}`}
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              className="quantity-btn"
              onClick={() => onHandleQuantity(1)}
            >
              +
            </button>
          </div>
          <button className="delete-btn" onClick={() => onDeleteItem(name)}>
            Delete
          </button>
        </div>
      </div>
    </section>
  );
};
