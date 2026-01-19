import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import MainLogin from './pages/MainLogin';
import Register from './pages/Register';
import Enroll from './pages/student/Enroll';
import InstructorMain from './pages/instructor/InstructorMain';
import AdminMain from './pages/admin/AdminMain';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<MainLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/enroll" element={<Enroll />} />
        <Route path="/instructor" element={<InstructorMain />} />
        <Route path="/admin/dashboard" element={<AdminMain />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
