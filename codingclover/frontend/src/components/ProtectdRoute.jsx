import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
    const loginId = localStorage.getItem('loginId');
    const users = JSON.parse(localStorage.getItem('users'));

    if (loginId !== 'true') {
        return <Navigate to="/auth/login" />; // 로그인부터 해라
    }

    if (allowedRoles && !allowedRoles.includes(users?.role)) {
        return <Navigate to="/noroll" />;  // 권한 없으니 로그인부터 해라
    }

    // children= /dashbord, 부모는 App.jsx
    return <Outlet />;
}

export default ProtectedRoute;