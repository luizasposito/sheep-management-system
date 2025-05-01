import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Inventory } from "./pages/Inventory/Inventory";
import { Animals } from "./pages/Animals/Animals";
import { AnimalDetails } from "./pages/AnimalDetails/AnimalDetail";
import { AnimalEdit } from "./pages/AnimalEdit/AnimalEdit";
import { MonitorInsideEnvironment } from "./pages/MonitorInsideEnvironment/MonitorInsideEnvironment"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/animal" element={<Animals />} />
        <Route path="/animal/:id" element={<AnimalDetails />} />
        <Route path="/animal/:id/edit" element={<AnimalEdit />} />
        <Route path="/environment" element={<MonitorInsideEnvironment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
