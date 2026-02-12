import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Edit,
  BookOpen,
  MonitorPlay,
  FileText,
  Clock,
  Coins,
  MessageCircle,
  LogOut
} from 'lucide-react';

const StudentSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("users");
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      category: "나의 학습",
      items: [
        { icon: MonitorPlay, label: "수강중인 강좌", path: "/student/mypage" },
        { icon: FileText, label: "수강 신청 내역", path: "/student/enrollment" } // TODO: 경로 확인 필요
      ]
    },
    {
      category: "나의 활동",
      items: [
        { icon: BookOpen, label: "시험 응시 내역", path: "/student/exam/list" },
        { icon: Coins, label: "포인트 현황", path: "/student/points" },
        { icon: MessageCircle, label: "문의 내역", path: "/student/qna/list" }
      ]
    },
    {
      category: "나의 정보",
      items: [
        { icon: Edit, label: "회원정보 수정", path: "/student/profile/edit" }, // TODO: 실제 경로에 맞게 수정 필요, 현재 MyPage 내 모달이라면 로직 조정 필요
        // { icon: LogOut, label: "회원 탈퇴", path: "#", action: "withdraw" } // 탈퇴는 별도 처리
      ]
    }
  ];

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-xl text-gray-900">마이페이지</h2>
        </div>

        <div className="p-4 space-y-8">
          {menuItems.map((category, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-xs font-semibold text-gray-500 mb-3">{category.category}</h3>
              <div className="space-y-1">
                {category.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    onClick={() => item.action === 'withdraw' ? null : navigate(item.path)} // withdraw 로직은 별도 핸들링 필요 시 추가
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                      ${isActive(item.path)
                        ? 'bg-primary/5 text-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive(item.path) ? 'text-primary' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* 회원 탈퇴 등 하단 메뉴 별도 처리 */}
          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-500 mb-3">기타</h3>
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

export default StudentSidebar;
