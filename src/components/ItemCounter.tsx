import "./ItemCounter.css";

interface ItemCounterProps {
  name: string;
  quantity: number;
  onQuantityChange: (name: string, delta: number) => void;
}

export const ItemCounter: React.FC<ItemCounterProps> = ({
  name,
  quantity,
  onQuantityChange,
}) => {
  const onHandleQuantity = (delta: number) => {
    // Handle quantity change logic here
    if (quantity + delta < 0) return; // Prevent negative quantities
    onQuantityChange(name, delta);
  };

  return (
    <section className="item-row">
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
            <span className="quantity-display">{quantity}</span>
            <button
              className="quantity-btn"
              onClick={() => onHandleQuantity(1)}
            >
              +
            </button>
          </div>
          <button className="delete-btn">Delete</button>
        </div>
      </div>
    </section>
  );
};
