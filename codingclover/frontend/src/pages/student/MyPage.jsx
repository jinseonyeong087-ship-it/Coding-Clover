import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '../../components/Tail';
import StudentSidebar from '@/components/StudentSidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Edit, Coins, ChevronRight, BookOpen, MonitorPlay, Calendar, AlertCircle, Trash2, Code2 } from "lucide-react";
import axios from 'axios';
import coinImg from '../../img/coin.png';

// 상수
const EDUCATION_OPTIONS = [
  "입문 (코딩 경험 없음)",
  "초급 (기초 문법 이해)",
  "중급 (프로젝트 경험 있음)"
];

const INTEREST_OPTIONS = [
  "C", "C++", "Java", "Python",
  "HTML/CSS", "JavaScript",
  "Kotlin", "Swift", "Dart", "Database"
];

// 유틸리티 함수
const getUserIdentifier = () => {
  const storedUsers = localStorage.getItem("users");
  if (!storedUsers) return null;
  try {
    const userData = JSON.parse(storedUsers);
    // loginId가 없으면 email을 반환 (소셜 로그인 대비)
    return userData.loginId || userData.email || null;
  } catch {
    return null;
  }
};

const parseInterests = (value) => {
  if (!value || value === "미설정") return [];
  return value.split(', ').filter(v => v && v !== "미설정");
};

function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', educationLevel: '' });
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [points, setPoints] = useState(0);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [courseProgress, setCourseProgress] = useState({}); // { courseId: { completed, total, percent } }
  const [cancelRequests, setCancelRequests] = useState({});
  const [cancelRequestLoadingId, setCancelRequestLoadingId] = useState(null);

  // 각 수강 강좌의 진도율 조회
  const fetchCourseProgress = async (enrollmentList) => {
    const enrolled = enrollmentList.filter(e => e.status === 'ENROLLED' || e.status === 'COMPLETED');
    const progressMap = {};

    await Promise.all(enrolled.map(async (enrollment) => {
      try {
        // 강의 목록 조회
        const lecturesRes = await fetch(`/student/lecture/${enrollment.courseId}/lectures`, {
          credentials: 'include'
        });
        const lectures = lecturesRes.ok ? await lecturesRes.json() : [];

        // 진도 조회
        const progressRes = await fetch(`/api/student/course/${enrollment.courseId}/progress`, {
          credentials: 'include'
        });

        let progressData = [];
        if (progressRes.ok) {
          progressData = await progressRes.json();
        } else {
          console.warn(`진도 조회 실패 (courseId: ${enrollment.courseId}):`, progressRes.status);
        }

        const completedCount = progressData.filter(p => p.completedYn).length;
        const totalCount = lectures.length;
        const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        progressMap[enrollment.courseId] = { completed: completedCount, total: totalCount, percent };
      } catch (err) {
        console.error(`진도율 조회 오류 (courseId: ${enrollment.courseId}):`, err);
        progressMap[enrollment.courseId] = { completed: 0, total: 0, percent: 0 };
      }
    }));

    setCourseProgress(progressMap);
  };

  // 수강 취소 요청 목록 조회
  const fetchCancelRequests = async () => {
    try {
      const response = await fetch('/student/cancel-requests', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        setCancelRequests({});
        return;
      }

      const data = await response.json();
      const requestMap = {};
      const requestList = Array.isArray(data) ? data : [];

      requestList
        .filter((request) => request.status === 'CANCEL_REQUESTED')
        .forEach((request) => {
          const key = request.enrollmentId ?? request.courseId;
          if (key !== undefined && key !== null) {
            requestMap[key] = request;
          }
        });

      setCancelRequests(requestMap);
    } catch (error) {
      console.error('수강 취소 요청 조회 실패:', error);
      setCancelRequests({});
    }
  };

  // 포인트 조회 함수
  const fetchUserPoints = async () => {
    try {
      setPointsLoading(true);

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

      const currentIdentifier = getUserIdentifier();
      if (!currentIdentifier) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch('/api/wallet/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const balanceData = await response.json();
        console.log('마이페이지 포인트 조회 결과:', balanceData);
        const balance = balanceData.balance || balanceData.amount || 0;
        setPoints(balance);
      } else {
        console.warn('포인트 조회 실패');
        setPoints(0); // API 실패 시 0으로 설정
      }
    } catch (error) {
      console.error('포인트 조회 실패:', error);
      setPoints(0); // 오류 시 0으로 설정
    } finally {
      setPointsLoading(false);
    }
  };

  // 환불 요청 함수
  const handleRefundRequest = () => {
    // 모달창에서 확인 버튼 클릭 시 실행될 로직은 AlertDialog 안에서 처리
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
    }
  };

  // 데이터 가져오기 함수
  const fetchData = async () => {
    try {
      setLoading(true);

      const currentIdentifier = getUserIdentifier();
      if (!currentIdentifier) {
        throw new Error('로그인이 필요합니다.');
      }

      // 두 API를 병렬로 호출
      const [profileResponse, enrollmentResponse] = await Promise.all([
        fetch('/api/student/mypage', {
          headers: {
            'Content-Type': 'application/json',
            'X-Login-Id': currentIdentifier
          },
          credentials: 'include'
        }),
        fetch('/student/enrollment', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
      ]);

      // 프로필 데이터 처리
      console.log('프로필 API 응답 상태:', profileResponse.status);
      if (profileResponse.ok) {
        const userData = await profileResponse.json();
        console.log('받은 사용자 데이터:', userData);
        const processedUserData = {
          ...userData,
          joinDate: new Date(userData.joinDate).toLocaleDateString('ko-KR')
        };
        setUser(processedUserData);
        setEditForm({
          name: userData.name,
          educationLevel: userData.educationLevel || ''
        });
        setSelectedInterests(parseInterests(userData.interestCategory));
      } else {
        // 에러 응답의 자세한 내용 확인
        let errorDetail = '';
        try {
          const errorText = await profileResponse.text();
          console.error('서버 에러 응답:', errorText);
          errorDetail = ` - ${errorText}`;
        } catch (e) {
          console.error('에러 응답 읽기 실패:', e);
        }
        throw new Error(`프로필 조회 실패 (${profileResponse.status})${errorDetail}`);
      }

      // 수강 목록 데이터 처리
      if (enrollmentResponse.ok) {
        const enrollmentData = await enrollmentResponse.json();
        setEnrollments(enrollmentData);
        fetchCourseProgress(enrollmentData);
        fetchCancelRequests();
      } else {
        setEnrollments([]);
      }

    } catch (err) {
      console.error('데이터 로딩 에러:', err);
      setError(err.message);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  //백엔드 api 호출
  useEffect(() => {
    // 로그인 상태 체크
    const identifier = getUserIdentifier();
    if (!identifier) {
      setError('로그인이 필요한 서비스입니다.');
      setLoading(false);
      return;
    }

    // edit 파라미터 체크
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true') {
      setIsEditing(true);
    }

    fetchData();
    fetchUserPoints();
  }, []);

  const handleCancelRequest = async (enrollment) => {
    const requestKey = enrollment.enrollmentId ?? enrollment.courseId;
    if (!requestKey) {
      alert('수강 취소 요청 대상이 올바르지 않습니다.');
      return;
    }

    if (!confirm('수강 취소 요청을 제출하시겠습니까?')) {
      return;
    }

    try {
      setCancelRequestLoadingId(requestKey);
      const response = await fetch(`/student/enrollment/${requestKey}/cancel-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: '' })
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || '수강 취소 요청에 실패했습니다.');
      }

      alert('취소 요청이 접수되었습니다.');
      setCancelRequests((prev) => ({
        ...prev,
        [requestKey]: {
          enrollmentId: enrollment.enrollmentId,
          courseId: enrollment.courseId,
          requestedAt: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('수강 취소 요청 실패:', error);
      alert(error.message || '수강 취소 요청 중 오류가 발생했습니다.');
    } finally {
      setCancelRequestLoadingId(null);
    }
  };

  //수정모드 전환
  const handleEditToggle = () => {
    if (!isEditing && user) {
      setEditForm({
        name: user.name,
        educationLevel: user.educationLevel || ''
      });
      setSelectedInterests(parseInterests(user.interestCategory));
    }
    setIsEditing(prev => !prev);
  };

  //체크박스 상태 관리
  const handleInterestChange = (interest, checked) => {
    setSelectedInterests(prev =>
      checked
        ? [...prev, interest]
        : prev.filter(i => i !== interest)
    );
  };

  //db 업데이트
  // 프론트엔드에서 저장버튼 → 컨트롤러 → 서비스 → 레포지토리 → DB
  const handleSave = async () => {
    try {
      const currentIdentifier = getUserIdentifier();
      if (!currentIdentifier) {
        alert('로그인이 필요합니다.');
        return;
      }

      const interestCategory =
        selectedInterests.length > 0
          ? selectedInterests.join(', ')
          : "미설정";
      //백엔드에 수정내용 전송
      const response = await fetch('/api/student/mypage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Login-Id': currentIdentifier
        },
        credentials: 'include',
        body: JSON.stringify({
          name: editForm.name,
          educationLevel: editForm.educationLevel,
          interestCategory
        })
      });

      if (!response.ok) {
        throw new Error("저장 실패");
      }

      // 상태만 갱신 (reload 제거)
      const updatedUser = {
        ...user,
        name: editForm.name,
        educationLevel: editForm.educationLevel,
        interestCategory
      };

      setUser(updatedUser);

      // localStorage의 users 정보도 업데이트
      const storedUsers = localStorage.getItem("users");
      console.log("현재 저장된 사용자 정보:", storedUsers);
      if (storedUsers) {
        try {
          const userData = JSON.parse(storedUsers);
          console.log("기존 사용자 데이터:", userData);
          const updatedUserData = {
            ...userData,
            name: editForm.name,
            educationLevel: editForm.educationLevel,
            interestCategory
          };
          console.log("업데이트될 사용자 데이터:", updatedUserData);
          localStorage.setItem("users", JSON.stringify(updatedUserData));
          console.log("로컬스토리지 사용자 정보 업데이트 완료");

          // 다른 컴포넌트(네비바 등)에 사용자 정보 업데이트 알림
          const event = new Event('userInfoUpdated');
          window.dispatchEvent(event);
          console.log("userInfoUpdated 이벤트 발생");
        } catch (error) {
          console.error("로컬스토리지 업데이트 실패:", error);
        }
      } else {
        console.warn("저장된 사용자 정보가 없습니다.");
      }

      setIsEditing(false);
      alert("저장 완료!");
    } catch (err) {
      alert(err.message);
    }
  };

  const [activeTab, setActiveTab] = useState('courses');
  const [testHistory, setTestHistory] = useState([]);
  const [testHistoryLoading, setTestHistoryLoading] = useState(false);

  // 코딩 테스트 내역 조회
  const fetchTestHistory = async () => {
    try {
      setTestHistoryLoading(true);
      const currentIdentifier = getUserIdentifier();
      if (!currentIdentifier) return;

      const response = await axios.get('/api/student/coding-test/results', { withCredentials: true });
      setTestHistory(response.data || []);
    } catch (err) {
      console.error('코딩 테스트 내역 조회 실패:', err);
      setTestHistory([]);
    } finally {
      setTestHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'codingtests') {
      fetchTestHistory();
    }
  }, [activeTab]);

  //수정 취소
  const handleCancel = () => {
    if (user) {
      setEditForm({
        name: user.name,
        educationLevel: user.educationLevel || ''
      });
      setSelectedInterests(parseInterests(user.interestCategory));
    }
    setIsEditing(false);
  };

  //화면
  return (
    <>
      <Nav />
      {/* Platform Standard Layout - Clean, Sidebar, White/Gray Theme */}
      <div className="min-h-screen bg-white text-gray-900 pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row gap-8">

          {/* Left Sidebar */}
          <StudentSidebar />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-100 text-center">
                <p>{error}</p>
                <Button onClick={() => window.location.reload()} variant="link" className="text-red-700 underline mt-2">다시 시도</Button>
              </div>
            ) : user && (
              <div className="space-y-8">

                {/* 1. Profile Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="shrink-0 relative">
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-400">
                        <User className="w-10 h-10" />
                      </div>
                      <button onClick={handleEditToggle} className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Info Form or Display */}
                    <div className="flex-1 w-full">
                      {isEditing ? (
                        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
                          <h3 className="font-bold text-lg mb-4">회원정보 수정</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>이름</Label>
                              <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="bg-white" />
                            </div>
                            <div>
                              <Label>학습 수준</Label>
                              <select className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm" value={editForm.educationLevel} onChange={e => setEditForm({ ...editForm, educationLevel: e.target.value })}>
                                <option value="">선택해주세요</option>
                                {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <Label className="mb-2 block">관심 분야</Label>
                            <div className="flex flex-wrap gap-2">
                              {INTEREST_OPTIONS.map(i => (
                                <label key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer select-none transition-colors ${selectedInterests.includes(i) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                                  <input type="checkbox" className="hidden" checked={selectedInterests.includes(i)} onChange={e => handleInterestChange(i, e.target.checked)} />
                                  {i}
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={handleCancel}>취소</Button>
                            <Button onClick={handleSave}>저장하기</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row justify-between w-full h-full">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">{user.educationLevel || '새싹 개발자'}</Badge>
                            </div>
                            <p className="text-gray-500 mb-4">{user.email}</p>

                            <div className="flex gap-2 text-sm text-gray-600">
                              <span className="font-medium">관심분야:</span>
                              <span>{user.interestCategory || '설정되지 않음'}</span>
                            </div>
                          </div>

                          {/* Right Side Stats in Profile */}
                          <div className="mt-6 md:mt-0 flex gap-8 md:border-l md:border-gray-100 md:pl-8">
                            <div className="text-center cursor-pointer group" onClick={() => navigate('/student/points')}>
                              <div className="w-12 h-12 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-2 group-hover:bg-amber-100 transition-colors">
                                <Coins className="w-6 h-6 text-amber-500" />
                              </div>
                              <p className="text-xs text-gray-500 mb-0.5">보유 포인트</p>
                              <p className="text-lg font-bold text-gray-900">{points.toLocaleString()} P</p>
                            </div>
                            <div className="text-center">
                              <div className="w-12 h-12 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-2">
                                <BookOpen className="w-6 h-6 text-blue-500" />
                              </div>
                              <p className="text-xs text-gray-500 mb-0.5">수강중</p>
                              <p className="text-lg font-bold text-gray-900">{enrollments.filter(e => e.status === 'ENROLLED').length} 개</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Status Dashboard (Horizontal Bar) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 grid grid-cols-3 divide-x divide-gray-100">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">수강중</p>
                    <p className="text-2xl font-bold text-primary">{enrollments.filter(e => e.status === 'ENROLLED').length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">수강완료</p>
                    <p className="text-2xl font-bold text-gray-900">{enrollments.filter(e => e.status === 'COMPLETED').length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">취소/환불</p>
                    <p className="text-2xl font-bold text-gray-400">{enrollments.filter(e => ['CANCELED', 'CANCELLED', 'CANCEL_REQUESTED'].includes(e.status)).length}</p>
                  </div>
                </div>

                {/* 3. Tab Navigation */}
                <div className="flex gap-4 border-b border-gray-200 mb-6">
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'courses' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    수강중인 강좌
                    {activeTab === 'courses' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                  </button>
                  <button
                    onClick={() => setActiveTab('codingtests')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'codingtests' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    코딩 테스트 내역
                    {activeTab === 'codingtests' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                  </button>
                </div>

                {/* 4. Tab Content */}
                {activeTab === 'courses' ? (
                  <div>
                    {enrollments.length === 0 ? (
                      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="mb-4">수강 중인 강좌가 없습니다.</p>
                        <Button onClick={() => navigate('/lecture')}>강좌 보러가기</Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrollments.map((enrollment) => {
                          const isCanceled = enrollment.status === 'CANCELED' || enrollment.status === 'CANCELLED';
                          const requestKey = enrollment.enrollmentId ?? enrollment.courseId;
                          const isRequested = Boolean(cancelRequests[requestKey]);
                          const progress = courseProgress[enrollment.courseId] || { completed: 0, total: 0, percent: 0 };
                          const thumbnail = enrollment.thumbnail || enrollment.courseThumbnail || enrollment.thumbnailUrl;

                          return (
                            <div key={requestKey} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-md transition-all">
                              {/* Thumbnail */}
                              <div className="aspect-video bg-gray-100 relative">
                                {thumbnail ? (
                                  <img src={thumbnail} alt={enrollment.courseTitle} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                ) : null}
                                <div className={`w-full h-full items-center justify-center text-gray-400 bg-gray-50 ${thumbnail ? 'hidden' : 'flex'}`}>
                                  <MonitorPlay className="w-10 h-10 opacity-20" />
                                </div>

                                {/* Status Badge */}
                                <div className="absolute top-3 left-3">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold text-white
                                            ${enrollment.status === 'ENROLLED' ? 'bg-primary' :
                                      enrollment.status === 'COMPLETED' ? 'bg-gray-800' :
                                        'bg-red-500'}
                                         `}>
                                    {enrollment.status === 'ENROLLED' ? '수강중' :
                                      enrollment.status === 'COMPLETED' ? '완료' : '취소'}
                                  </span>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="p-4">
                                <h4 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-primary transition-colors">{enrollment.courseTitle}</h4>
                                <p className="text-xs text-gray-500 mb-4">{new Date(enrollment.enrolledAt).toLocaleDateString()} 신청</p>

                                <div className="space-y-1 mb-4">
                                  <div className="flex justify-between text-xs text-gray-600">
                                    <span>진도율</span>
                                    <span className="font-bold text-primary">{progress.percent}%</span>
                                  </div>
                                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${progress.percent}%` }} />
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => navigate(`/student/course/${enrollment.courseId}/lectures`)}
                                    size="sm"
                                    className="flex-1 h-9 rounded bg-white border border-gray-200 text-gray-900 hover:bg-black hover:text-white hover:border-black shadow-none"
                                    disabled={isCanceled}
                                  >
                                    {enrollment.status === 'COMPLETED' ? '복습하기' : '이어하기'}
                                  </Button>

                                  {enrollment.status === 'ENROLLED' && (
                                    <Button
                                      disabled={isRequested || cancelRequestLoadingId === requestKey}
                                      onClick={() => handleCancelRequest(enrollment)}
                                      size="sm"
                                      className="h-9 px-3 rounded border border-gray-200 bg-white text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 shadow-none text-xs font-medium"
                                    >
                                      {isRequested ? '요청됨' : '취소 요청'}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {testHistoryLoading ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : testHistory.length === 0 ? (
                      <div className="p-12 text-center text-gray-500">
                        <Code2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p>응시한 코딩 테스트 내역이 없습니다.</p>
                        <Button onClick={() => navigate('/coding-test')} className="mt-4">테스트 도전하기</Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4 font-bold">테스트 제목</th>
                              <th className="px-6 py-4 font-bold text-center">결과</th>
                              <th className="px-6 py-4 font-bold text-center">점수</th>
                              <th className="px-6 py-4 font-bold text-center">응시일</th>
                              <th className="px-6 py-4 font-bold text-right">상세보기</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {testHistory.map((result) => (
                              <tr key={result.resultId} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{result.title}</td>
                                <td className="px-6 py-4 text-center">
                                  <Badge variant={result.status === "PASS" ? "default" : "destructive"} className={result.status === "PASS" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0" : ""}>
                                    {result.status === "PASS" ? '합격' : '불합격'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-center font-mono font-bold text-primary">{result.score}점</td>
                                <td className="px-6 py-4 text-center text-gray-500">{new Date(result.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/student/coding-test/results/${result.resultId}`)}
                                    className="text-gray-400 hover:text-primary"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
      <Tail />
    </>
  );
}

export default MyPage;
