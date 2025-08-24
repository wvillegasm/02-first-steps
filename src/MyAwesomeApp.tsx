import type { CSSProperties } from "react";

const codeStyles: CSSProperties = {
  backgroundColor: "#f5f5f5",
  border: "1px solid #cacaca",
  padding: "10px",
  borderRadius: "15px",
  fontFamily: "monospace",
  overflowX: "auto",
};

export const MyAwesomeApp = () => {
  return (
    <>
      <h1>React Course</h1>
      <h3>Devtalles</h3>

      <pre style={codeStyles} aria-label="app data">
        {JSON.stringify(
          { title: "React Course", subtitle: "Devtalles" },
          null,
          2
        )}
      </pre>
    </>
  );
};
