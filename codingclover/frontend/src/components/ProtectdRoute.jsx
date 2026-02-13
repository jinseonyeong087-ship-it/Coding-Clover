import { Navigate, Outlet } from 'react-router-dom';
import InstructorPermit from './InstructorPermit';
import Norole from './Norole';

function ProtectedRoute({ allowedRoles }) {
    const loginId = localStorage.getItem('loginId');
    const users = JSON.parse(localStorage.getItem('users'));
    const role = users?.role;

    if (loginId !== 'true') {
        return <Navigate to="/auth/login" />; // 로그인 안 했으면 로그인부터 해라
    }

    if (allowedRoles && !allowedRoles.includes(users?.role)) {
        return <Navigate to="/norole" />;  // 접근권한 없으니 로그인부터 해라
    }

    if (users?.role === 'INSTRUCTOR') {
        const instructorStatus = localStorage.getItem('instructorStatus');
        if (instructorStatus !== 'APPROVED') {
            return <InstructorPermit />;
        }
    }

    if (role === 'ADMIN') {
        if (adminStatus !== 'APPROVED') {
            return <Norole />;
        }
    }


    // children= /dashbord, 부모는 App.jsx
    // App.jsx에서 ProtectedRoute로 감싼 컴포넌트들은 위에 로직에서 통과하면 Outlet=접근권한 있는 페이지로 넘겨줌
    return <Outlet />;
}

export default ProtectedRoute;