import { useState } from "react";
import { ItemCounter } from "./components/ItemCounter";
import { UserCard } from "./components/UserCard";

const productNames = [
  { name: "Nintendo Switch", quantity: 1 },
  { name: "Xbox Series X", quantity: 1 },
  { name: "PlayStation 5", quantity: 1 },
];

export const FirstStepsApp = () => {
  const [productItems, setProductItems] = useState(productNames);

  const handleQuantityChange = (name: string, delta: number) => {
    setProductItems((prevItems) =>
      prevItems.map((item) =>
        item.name === name ? { ...item, quantity: item.quantity + delta } : item
      )
    );
  };

  return (
    <>
      <UserCard name="Wilfredo" email="test@google.com" address="123 Main St" />
      {productItems.map((product) => (
        <ItemCounter
          key={product.name}
          name={product.name}
          quantity={product.quantity}
          onQuantityChange={handleQuantityChange}
        />
      ))}
    </>
  );
};
