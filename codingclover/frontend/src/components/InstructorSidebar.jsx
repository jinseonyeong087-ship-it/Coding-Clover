import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  FilePlus,
  UserX,
  User,
  Settings
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";

const InstructorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  const getLoginId = () => {
    const storedUsers = localStorage.getItem("users");
    if (!storedUsers) return null;
    try {
      const userData = JSON.parse(storedUsers);
      return userData.loginId || null;
    } catch {
      return null;
    }
  };

  // 계정 탈퇴 함수
  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);

      const loginId = getLoginId();
      if (!loginId) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/instructor/withdraw', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Login-Id': loginId
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('탈퇴 처리에 실패했습니다.');
      }

      localStorage.clear();
      alert('계정이 성공적으로 탈퇴되었습니다.');
      navigate('/auth/login', { replace: true });

    } catch (error) {
      console.error('계정 탈퇴 실패:', error);
      alert(error.message || '탈퇴 처리 중 오류가 발생했습니다.');
    } finally {
      setIsWithdrawing(false);
      setShowWithdrawDialog(false);
    }
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
        { icon: MessageCircle, label: "질의응답 관리", path: "/instructor/qna" }
      ]
    },
  ];

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-xl text-gray-900">강사 페이지</h2>
          <p className="text-xs text-gray-500 mt-1">Instructor Center</p>
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

          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-500 mb-3">계정</h3>
            <div className="space-y-1">
              <button
                onClick={() => setShowWithdrawDialog(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <UserX className="w-4 h-4 text-gray-400" />
                계정 탈퇴
              </button>
            </div>
          </div>
        </div>

        {/* 계정 탈퇴 확인 다이얼로그 */}
        <AlertDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>계정 탈퇴</AlertDialogTitle>
              <AlertDialogDescription>
                정말로 계정을 탈퇴하시겠습니까? 이 작업은 취소할 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="bg-red-600 hover:bg-red-700"
              >
                {isWithdrawing ? '처리중...' : '탈퇴하기'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default InstructorSidebar;
