
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "./App";

// Mock dos componentes para evitar renderização pesada, só testando se aparecem no output
vi.mock("./pages/Login/Login", () => ({ Login: () => <div>Login Page</div> }));
vi.mock("./pages/Dashboard/Dashboard", () => ({ Dashboard: () => <div>Dashboard Page</div> }));
vi.mock("./pages/Animals/Animals", () => ({ Animals: () => <div>Animals Page</div> }));
vi.mock("./pages/AnimalDetails/AnimalDetail", () => ({ AnimalDetails: () => <div>AnimalDetails Page</div> }));
vi.mock("./pages/AnimalEdit/AnimalEdit", () => ({ AnimalEdit: () => <div>AnimalEdit Page</div> }));
vi.mock("./pages/AnimalCreate/AnimalCreate", () => ({ AnimalCreate: () => <div>AnimalCreate Page</div> }));
vi.mock("./pages/AppointmentCreate/AppointmentCreate", () => ({ AppointmentCreate: () => <div>AppointmentCreate Page</div> }));
vi.mock("./pages/AppointmentEdit/AppointmentEdit", () => ({ AppointmentEdit: () => <div>AppointmentEdit Page</div> }));
vi.mock("./pages/AppointmentDetail/AppointmentDetail", () => ({ AppointmentDetail: () => <div>AppointmentDetail Page</div> }));
vi.mock("./pages/Appointments/Appointments", () => ({ Appointments: () => <div>Appointments Page</div> }));
vi.mock("./pages/Inventory/Inventory", () => ({ Inventory: () => <div>Inventory Page</div> }));
vi.mock("./pages/InventoryCreate/InventoryCreate", () => ({ InventoryCreate: () => <div>InventoryCreate Page</div> }));

// Mock do RequireRole só para liberar a renderização dos componentes filhos
vi.mock("./RequireRole", () => ({
  RequireRole: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("App routing", () => {
  it("redirects from / to /login and renders Login", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    // Como "/" redireciona para "/login", vamos procurar por texto de Login
    const loginText = screen.queryByText("Login Page");
    expect(loginText).not.toBeNull();
  });

  it("renders Dashboard for /dashboard", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>
    );
    const dashboardText = screen.queryByText("Dashboard Page");
    expect(dashboardText).not.toBeNull();
  });

  it("renders Animals for /animal", () => {
    render(
      <MemoryRouter initialEntries={["/animal"]}>
        <App />
      </MemoryRouter>
    );
    const animalsText = screen.queryByText("Animals Page");
    expect(animalsText).not.toBeNull();
  });

  it("renders AnimalDetails for /animal/123", () => {
    render(
      <MemoryRouter initialEntries={["/animal/123"]}>
        <App />
      </MemoryRouter>
    );
    const detailsText = screen.queryByText("AnimalDetails Page");
    expect(detailsText).not.toBeNull();
  });

  it("renders AnimalEdit for /animal/123/edit", () => {
    render(
      <MemoryRouter initialEntries={["/animal/123/edit"]}>
        <App />
      </MemoryRouter>
    );
    const editText = screen.queryByText("AnimalEdit Page");
    expect(editText).not.toBeNull();
  });

  it("renders AnimalCreate for /animal/add", () => {
    render(
      <MemoryRouter initialEntries={["/animal/add"]}>
        <App />
      </MemoryRouter>
    );
    const createText = screen.queryByText("AnimalCreate Page");
    expect(createText).not.toBeNull();
  });

  it("renders Inventory for /inventory", () => {
    render(
      <MemoryRouter initialEntries={["/inventory"]}>
        <App />
      </MemoryRouter>
    );
    const inventoryText = screen.queryByText("Inventory Page");
    expect(inventoryText).not.toBeNull();
  });

  it("renders InventoryCreate for /inventory/add", () => {
    render(
      <MemoryRouter initialEntries={["/inventory/add"]}>
        <App />
      </MemoryRouter>
    );
    const invCreateText = screen.queryByText("InventoryCreate Page");
    expect(invCreateText).not.toBeNull();
  });

  it("renders Appointments for /appointment", () => {
    render(
      <MemoryRouter initialEntries={["/appointment"]}>
        <App />
      </MemoryRouter>
    );
    const appointmentsText = screen.queryByText("Appointments Page");
    expect(appointmentsText).not.toBeNull();
  });

  it("renders AppointmentDetail for /appointment/123", () => {
    render(
      <MemoryRouter initialEntries={["/appointment/123"]}>
        <App />
      </MemoryRouter>
    );
    const detailText = screen.queryByText("AppointmentDetail Page");
    expect(detailText).not.toBeNull();
  });

  it("renders AppointmentEdit for /appointment/123/edit", () => {
    render(
      <MemoryRouter initialEntries={["/appointment/123/edit"]}>
        <App />
      </MemoryRouter>
    );
    const editText = screen.queryByText("AppointmentEdit Page");
    expect(editText).not.toBeNull();
  });

  it("renders AppointmentCreate for /appointment/add", () => {
    render(
      <MemoryRouter initialEntries={["/appointment/add"]}>
        <App />
      </MemoryRouter>
    );
    const createText = screen.queryByText("AppointmentCreate Page");
    expect(createText).not.toBeNull();
  });
});
