import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Home from './pages/Home';
import MainLogin from './pages/MainLogin';
import SignUp from './pages/SignUp';
import Enroll from './pages/student/Enroll';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<MainLogin />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/enroll" element={<Enroll />} />
      </Routes>
  );
}

export default App;
