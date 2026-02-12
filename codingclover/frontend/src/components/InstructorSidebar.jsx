import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  FilePlus,
  LogOut,
  User,
  Settings
} from 'lucide-react';

const InstructorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("users");
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => {
    if (path === '/instructor/mypage' && location.pathname === '/instructor/mypage') return true;
    if (path !== '/instructor/mypage' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const menuItems = [
    {
      category: "대시보드",
      items: [
        { icon: LayoutDashboard, label: "대시보드", path: "/instructor/mypage" },
      ]
    },
    {
      category: "강좌 관리",
      items: [
        { icon: BookOpen, label: "강좌 관리", path: "/instructor/course" },
        { icon: LayoutDashboard, label: "강의 관리", path: "/instructor/lecture/upload" },
        { icon: FilePlus, label: "새 강좌 개설", path: "/instructor/course/new" }
      ]
    },
    {
      category: "학습 지원",
      items: [
        { icon: MessageCircle, label: "질의응답 관리", path: "/instructor/qna/list" }
      ]
    },
  ];

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
        <div className="p-6 border-b border-gray-100 bg-purple-50">
          <h2 className="font-bold text-xl text-purple-900">강사 페이지</h2>
          <p className="text-xs text-purple-600 mt-1">Instructor Center</p>
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
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive(item.path) ? 'text-purple-600' : 'text-gray-400'}`} />
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

export default InstructorSidebar;
