import { useState } from "react";
import "./App.css"; // Keep any global styles here
import ThreeScene from "./components/ThreeScene";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="w-full h-screen">
      <ThreeScene />
    </div>
  );
}

export default App;
