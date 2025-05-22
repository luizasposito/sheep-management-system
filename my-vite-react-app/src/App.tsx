
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


const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/animal" element={<Animals />} />
      <Route path="/animal/:id" element={<AnimalDetails />} />
      <Route path="/animal/:id/edit" element={<AnimalEdit />} />
      <Route path="/animal/add" element={<AnimalCreate />} />

      <Route path="/inventory" element={<Inventory />} />
      <Route path="/inventory/add" element={<InventoryCreate />} />

      <Route path="/appointment" element={<Appointments />} />
      <Route path="/appointment/:id" element={<AppointmentDetail />} />
      <Route path="/appointment/:id/edit" element={<AppointmentEdit />} />
      <Route path="/appointment/add" element={<AppointmentCreate />} />

    </Routes>
  )
}

export default App
