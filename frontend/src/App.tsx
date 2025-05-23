
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login/Login'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { Animals } from './pages/Animals/Animals'
import { AnimalDetails } from './pages/AnimalDetails/AnimalDetail'
import { AnimalEdit } from './pages/AnimalEdit/AnimalEdit'
import { AnimalCreate } from './pages/AnimalCreate/AnimalCreate'
import { AppointmentCreate } from './pages/AppointmentCreate/AppointmentCreate'
import { AppointmentEdit } from './pages/AppointmentEdit/AppointmentEdit'
import { AppointmentDetail } from './pages/AppointmentDetail/AppointmentDetail'
import { Appointments } from './pages/Appointments/Appointments'
import { Inventory } from './pages/Inventory/Inventory'
import { InventoryCreate } from './pages/InventoryCreate/InventoryCreate'
import { RequireRole } from './RequireRole'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <RequireRole allowedRoles={["farmer"]}>
          <Dashboard />
        </RequireRole>
      }
      />

      <Route path="/animal" element={
        <RequireRole allowedRoles={["farmer", "veterinarian"]}>
          <Animals />
        </RequireRole>
      }
      />
      <Route path="/animal/:id" element={
        <RequireRole allowedRoles={["farmer", "veterinarian"]}>
          <AnimalDetails />
        </RequireRole>
      }
      />
      <Route path="/animal/:id/edit" element={
        <RequireRole allowedRoles={["farmer"]}>
          <AnimalEdit />
        </RequireRole>
      }
      />
      <Route path="/animal/add" element={
        <RequireRole allowedRoles={["farmer"]}>
          <AnimalCreate />
        </RequireRole>
      }
      />

      <Route path="/inventory" element={
        <RequireRole allowedRoles={["farmer"]}>
          <Inventory />
        </RequireRole>
      }
      />
      <Route path="/inventory/add" element={
        <RequireRole allowedRoles={["farmer"]}>
          <InventoryCreate />
        </RequireRole>
      }
      />

      <Route path="/appointment" element={
        <RequireRole allowedRoles={["farmer", "veterinarian"]}>
          <Appointments />
        </RequireRole>
      }
      />
      <Route path="/appointment/:id" element={
        <RequireRole allowedRoles={["farmer", "veterinarian"]}>
          <AppointmentDetail />
        </RequireRole>
      }
      />
      <Route path="/appointment/:id/edit" element={
        <RequireRole allowedRoles={["veterinarian"]}>
          <AppointmentEdit />
        </RequireRole>
      }
      />
      <Route path="/appointment/add" element={
        <RequireRole allowedRoles={["farmer"]}>
          <AppointmentCreate />
        </RequireRole>
      }
      />
    </Routes>
  )
}

export default App
