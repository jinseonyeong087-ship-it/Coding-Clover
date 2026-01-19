import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Home from './pages/Home';
import MainLogin from './pages/MainLogin';
import SignUp from './pages/SignUp';
import Enroll from './pages/student/Enroll';
import InstructorMain from './pages/instructor/InstructorMain';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<MainLogin />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/enroll" element={<Enroll />} />
        <Route path="/instructor" element={<InstructorMain />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
