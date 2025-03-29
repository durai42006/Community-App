import React from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { Routes, Route } from "react-router-dom"
import axios from 'axios'
import { Toaster } from 'react-hot-toast'
import { UserProvider } from '../context/userContext'
import { SocketProvider } from '../context/socketContext.jsx' // ✅ Import SocketProvider
import Dashboard from './pages/Dashboard'
import CommunityChat from './pages/CommunityChat.jsx'

axios.defaults.baseURL = 'http://localhost:8000'
axios.defaults.withCredentials = true

function App() {
  return (
    <UserProvider> 

        <Navbar />
        <Toaster position='bottom-right' toastOptions={{ duration: 2000 }} />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} /> */}
          <Route path="/community" element={<CommunityChat />} />
        </Routes>
    </UserProvider>
  )
}

export default App
