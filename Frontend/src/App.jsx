import React from 'react'
import Navbar from './components/Navbar'
import ProtectedRoots from './components/ProtectedRoots'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home'; 
import NotFound from './pages/NotFound';
import Blog from './pages/Blog';

const logout = () => {
  localStorage.clear()
  return <Navigate to="/home" />;
}

const RegisterAndLogout = () => { 
  localStorage.clear()
  return <Register to="/home" />;
}
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/logout" element={<logout />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
