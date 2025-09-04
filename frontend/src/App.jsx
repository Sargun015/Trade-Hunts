import LandingPage from './pages/LandingPage.jsx'
import BrowseSkills from './pages/BrowseSkills.jsx'
import Profile from './pages/Profile.jsx'
import './App.css' 
import React from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx' 
import SignUp from './pages/SignUp.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import MessagesPage from './pages/MessagesPage.jsx'
import ActiveServicesPage from './pages/ActiveServicesPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';



function App() {

  return (
    <>
    <Header />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/browse" element={<BrowseSkills />} />
      <Route path="/profile" element={<Profile />} />
      <Route path='/login' element={<Login/>}  />
      <Route path='/signup' element={<SignUp/>}  />
      <Route path='/forgot-password' element={<ForgotPassword/>}  />
      <Route path='reset-password' element={<ResetPassword/>}></Route>
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/services" element={<ActiveServicesPage />} />
      <Route path="/service/:requestId" element={<ServiceDetailsPage />} />
    </Routes>
    <Footer />
    </>
  )
}

export default App
