import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  CreditCard,
  LogOut,
  Settings,
  GraduationCap
} from 'lucide-react';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("users");
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => {
    // Dashboard exact match
    if (path === '/admin' && (location.pathname === '/admin' || location.pathname === '/admin/')) return true;
    // Detailed Paths
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const menuItems = [
    {
      category: "메인",
      items: [
        { icon: LayoutDashboard, label: "대시보드", path: "/admin/dashboard" },
      ]
    },
    {
      category: "회원 관리",
      items: [
        { icon: Users, label: "학생 관리", path: "/admin/users/students" },
        { icon: GraduationCap, label: "강사 관리", path: "/admin/users/instructors" },
      ]
    },
    {
      category: "콘텐츠 관리",
      items: [
        { icon: BookOpen, label: "강좌 관리", path: "/admin/course" },
        { icon: Video, label: "강의 관리", path: "/admin/lectures" },
      ]
    },
    {
      category: "운영 관리",
      items: [
        { icon: CreditCard, label: "결제/정산 관리", path: "/admin/payments" },
      ]
    }
  ];

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
        <div className="p-6 border-b border-gray-100 bg-slate-900">
          <h2 className="font-bold text-xl text-white">관리자 페이지</h2>
          <p className="text-xs text-slate-400 mt-1">Admin Console</p>
        </div>

        <div className="p-4 space-y-6">
          {menuItems.map((category, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-xs font-semibold text-gray-500 mb-3">{category.category}</h3>
              <div className="space-y-1">
                {category.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                      ${isActive(item.path)
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive(item.path) ? 'text-slate-700' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-500 mb-3">계정</h3>
            <div className="space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
