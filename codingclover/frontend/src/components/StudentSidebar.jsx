import React, { useState } from 'react';
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
  UserX
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

const StudentSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  const getUserIdentifier = () => {
    const storedUsers = localStorage.getItem("users");
    if (!storedUsers) return null;
    try {
      const userData = JSON.parse(storedUsers);
      return userData.loginId || userData.email || null;
    } catch {
      return null;
    }
  };

  // 계정 탈퇴 함수
  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);

      const currentIdentifier = getUserIdentifier();
      if (!currentIdentifier) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/student/withdraw', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Login-Id': currentIdentifier
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('탈퇴 처리에 실패했습니다.');
      }

      // 로컬스토리지 데이터 삭제
      localStorage.removeItem('users');
      localStorage.clear();

      alert('계정이 성공적으로 탈퇴되었습니다.');

      // 로그인 페이지로 이동
      navigate('/auth/login', { replace: true });

    } catch (error) {
      console.error('계정 탈퇴 실패:', error);
      alert(error.message || '탈퇴 처리 중 오류가 발생했습니다.');
    } finally {
      setIsWithdrawing(false);
      setShowWithdrawDialog(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      category: "나의 학습",
      items: [
        { icon: MonitorPlay, label: "수강중인 강좌", path: "/student/mypage" },
      ]
    },
    {
      category: "나의 활동",
      items: [
        { icon: BookOpen, label: "시험 응시 내역", path: "/student/exam?tab=history" },
        { icon: Coins, label: "포인트 현황", path: "/student/points" }
      ]
    },

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

          {/* 계정 탈퇴 등 하단 메뉴 별도 처리 */}
          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-500 mb-3">기타</h3>
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

export default StudentSidebar;
