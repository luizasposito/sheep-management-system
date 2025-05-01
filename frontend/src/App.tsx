import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Inventory } from "./pages/Inventory/Inventory";
import { Animals } from "./pages/Animals/Animals";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/animal" element={<Animals />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
