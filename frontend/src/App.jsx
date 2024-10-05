import { useState } from "react";
import "./App.css";
import ThreeScene from "./components/ThreeScene";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="max-w-[1200px] mx-auto">
      <h1 className="text-red-50">Hello</h1>
      <ThreeScene />
    </div>
  );
}

export default App;
