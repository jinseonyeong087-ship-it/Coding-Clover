import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Edit, Coins, ChevronRight, BookOpen, MonitorPlay, Calendar, AlertCircle, Trash2 } from "lucide-react";
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
      // 임시: 백엔드 개발 전까지는 빈 배열 반환
      setCancelRequests({});
      return;
      
      /* 백엔드 준비 후 주석 해제
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

      requestList.forEach((request) => {
        const key = request.enrollmentId ?? request.courseId;
        if (key !== undefined && key !== null) {
          requestMap[key] = request;
        }
      });

      setCancelRequests(requestMap);
      */
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

    // 임시: 백엔드 개발 전까지는 클라이언트 상태만 업데이트
    alert('취소 요청이 접수되었습니다. (임시: 백엔드 연결 대기중)');
    setCancelRequests((prev) => ({
      ...prev,
      [requestKey]: {
        enrollmentId: enrollment.enrollmentId,
        courseId: enrollment.courseId,
        requestedAt: new Date().toISOString()
      }
    }));
    return;

    /* 백엔드 준비 후 주석 해제
    try {
      setCancelRequestLoadingId(requestKey);
      const response = await fetch(`/student/enrollment/${requestKey}/cancel-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId: enrollment.courseId })
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
    */
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
      {/* Background Decoration */}
      <div className="fixed inset-0 z-[-1] bg-background">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="pt-20 pb-12 container mx-auto px-6 max-w-7xl">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground animate-pulse">사용자 정보를 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto mt-20 p-8 rounded-2xl border border-destructive/20 bg-destructive/5 text-center shadow-lg backdrop-blur-sm">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-80" />
            <h2 className="text-xl font-bold text-destructive mb-2">
              {error.includes('로그인') ? '로그인 필요' : '오류 발생'}
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => window.location.reload()}>새로고침</Button>
              <Button onClick={() => navigate('/auth/login')}>로그인</Button>
            </div>
          </div>
        )}

        {!loading && !error && user && (
          <div className="space-y-12">
            {/* Header & Stats */}
            <header>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                My dashboard
              </h1>
              <p className="text-base text-muted-foreground">
                안녕하세요, <span className="font-bold text-foreground">{user.name}</span>님. 오늘의 학습 현황입니다.
              </p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Summary Card */}
              <div className="md:col-span-2 bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden group">
                {/* Decorative bg */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-700" />

                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 z-10 w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold">{user.name}</h2>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    {!isEditing && (
                      <Button variant="ghost" size="sm" onClick={handleEditToggle} className="hover:bg-primary/10 hover:text-primary transition-colors h-8">
                        <Edit className="w-3.5 h-3.5 mr-2" /> 정보 수정
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-4 space-y-4 bg-background/50 p-4 rounded-xl border border-border/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-bold text-muted-foreground uppercase">이름</Label>
                          <Input
                            value={editForm.name}
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            className="mt-1 h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-bold text-muted-foreground uppercase">학습 수준</Label>
                          <select
                            className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={editForm.educationLevel}
                            onChange={e => setEditForm({ ...editForm, educationLevel: e.target.value })}
                          >
                            <option value="">선택해주세요</option>
                            {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">관심 분야</Label>
                        <div className="flex flex-wrap gap-2">
                          {INTEREST_OPTIONS.map(i => (
                            <label
                              key={i}
                              className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all select-none
                                                    ${selectedInterests.includes(i)
                                  ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105"
                                  : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}
                            >
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={selectedInterests.includes(i)}
                                onChange={e => handleInterestChange(i, e.target.checked)}
                              />
                              {i}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={handleCancel} className="h-8">취소</Button>
                        <Button size="sm" onClick={handleSave} className="h-8">저장하기</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 flex flex-wrap gap-4">
                      <div className="bg-background/50 px-4 py-2 rounded-lg border border-border/50">
                        <span className="text-xs font-bold text-muted-foreground block mb-0.5">가입일</span>
                        <span className="text-sm font-medium">{user.joinDate}</span>
                      </div>
                      <div className="bg-background/50 px-4 py-2 rounded-lg border border-border/50">
                        <span className="text-xs font-bold text-muted-foreground block mb-0.5">학습 수준</span>
                        <span className="text-sm font-medium">{user.educationLevel || "미설정"}</span>
                      </div>
                      <div className="bg-background/50 px-4 py-2 rounded-lg border border-border/50">
                        <span className="text-xs font-bold text-muted-foreground block mb-0.5">관심 분야</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {user.interestCategory && user.interestCategory !== "미설정" ? (
                            parseInterests(user.interestCategory).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[10px] h-5 px-1.5">{tag}</Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Points Card */}
              <div onClick={() => navigate('/student/points')} className="cursor-pointer bg-gradient-to-br from-indigo-600 via-primary to-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                      <Coins className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="mt-4">
                    <p className="text-indigo-100 font-medium mb-1">내 포인트</p>
                    <h3 className="text-3xl font-extrabold tracking-tight">
                      {pointsLoading ? '...' : points.toLocaleString()} <span className="text-xl font-bold opacity-80">P</span>
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdraw Button */}
            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 text-xs"
                    disabled={isWithdrawing}
                  >
                    {isWithdrawing ? '처리중...' : '계정 탈퇴'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md mx-auto">
                  <AlertDialogHeader className="space-y-4 pb-6">
                    <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <AlertDialogTitle className="text-xl font-bold text-center text-foreground">
                      정말로 탈퇴하시겠습니까?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-muted-foreground">
                      계정을 탈퇴하면 모든 데이터가 영구적으로 삭제됩니다
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  
                  <div className="py-6 border-y border-border/50">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                        삭제될 데이터
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/30 rounded-xl p-3 text-center">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-xs font-medium">개인정보</p>
                        </div>
                        <div className="bg-muted/30 rounded-xl p-3 text-center">
                          <div className="w-8 h-8 bg-purple-500/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-purple-500" />
                          </div>
                          <p className="text-xs font-medium">수강내역</p>
                        </div>
                        <div className="bg-muted/30 rounded-xl p-3 text-center">
                          <div className="w-8 h-8 bg-amber-500/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <Coins className="w-4 h-4 text-amber-500" />
                          </div>
                          <p className="text-xs font-medium">포인트</p>
                        </div>
                        <div className="bg-muted/30 rounded-xl p-3 text-center">
                          <div className="w-8 h-8 bg-slate-500/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-slate-500" />
                          </div>
                          <p className="text-xs font-medium">학습기록</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AlertDialogFooter className="pt-6 gap-3">
                    <AlertDialogCancel className="flex-1 rounded-xl font-medium h-11">
                      취소
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleWithdraw}
                      className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl font-bold h-11 shadow-lg"
                      disabled={isWithdrawing}
                    >
                      {isWithdrawing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          탈퇴 처리중...
                        </>
                      ) : (
                        '확인, 탈퇴합니다'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Enrolled Courses */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">내 강의실</h2>
                  <p className="text-muted-foreground mt-1 text-sm">현재 수강 중인 강좌 목록입니다.</p>
                </div>
                {/* Optional: Filter or Sort */}
              </div>

              {enrollments.length === 0 ? (
                <div className="bg-background/40 border border-dashed border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">수강 중인 강좌가 없습니다</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    다양한 코딩 강좌가 준비되어 있습니다. <br />지금 바로 학습을 시작해보세요!
                  </p>
                  <Button onClick={() => navigate('/lecture')} className="font-bold shadow-lg">
                    강좌 둘러보기
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrollments.map((enrollment) => {
                    const isCanceled = enrollment.status === 'CANCELED' || enrollment.status === 'CANCELLED';
                    const requestKey = enrollment.enrollmentId ?? enrollment.courseId;
                    const isRequested = Boolean(cancelRequests[requestKey]);

                    return (
                      <div
                        key={requestKey}
                        className="group flex flex-col bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
                      >
                      <div className="h-40 bg-muted relative overflow-hidden">
                        {/* Placeholder Pattern/Gradient */}
                        {/* In a real app, use enrollment.courseThumbnail */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                          <MonitorPlay className="w-16 h-16 text-white" />
                        </div>
                        <div className="absolute top-4 left-4">
                          <Badge className={`
                                            ${enrollment.status === 'ENROLLED' ? 'bg-emerald-500 hover:bg-emerald-500 text-white border-none' :
                              enrollment.status === 'COMPLETED' ? 'bg-purple-500 hover:bg-purple-500 text-white border-none' :
                                'bg-slate-500 hover:bg-slate-500 text-white border-none'}
                                        `}>
                            {enrollment.status === 'ENROLLED' ? '수강중' :
                              enrollment.status === 'COMPLETED' ? '수강완료' : '수강취소'}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="mb-4">
                          <h3 className="text-lg font-bold line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                            {enrollment.courseTitle}
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            수강신청: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="mt-auto pt-4 border-t border-border/50 space-y-4">
                          {/* Progress Bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-muted-foreground">
                                진도율 {courseProgress[enrollment.courseId] && (
                                  <span className="text-muted-foreground/70">
                                    ({courseProgress[enrollment.courseId].completed}/{courseProgress[enrollment.courseId].total})
                                  </span>
                                )}
                              </span>
                              <span className="text-primary">
                                {courseProgress[enrollment.courseId]?.percent ?? 0}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  (courseProgress[enrollment.courseId]?.percent ?? 0) === 100 ? 'bg-purple-500' : 'bg-primary'
                                }`}
                                style={{ width: `${Math.max(courseProgress[enrollment.courseId]?.percent ?? 0, 2)}%` }}
                              />
                            </div>
                          </div>

                          <Button
                            className="w-full font-bold shadow-sm h-10"
                            disabled={isCanceled}
                            variant={enrollment.status === 'COMPLETED' ? 'outline' : 'default'}
                            onClick={() => navigate(`/student/course/${enrollment.courseId}/lectures`)}
                          >
                            {enrollment.status === 'ENROLLED' ? (
                              (courseProgress[enrollment.courseId]?.percent ?? 0) > 0 ? '이어듣기' : '학습 시작'
                            ) : enrollment.status === 'COMPLETED' ? '다시보기' : '강의 보기'}
                          </Button>

                          {enrollment.status === 'ENROLLED' && (
                            <Button
                              className="w-full font-semibold h-9"
                              variant="outline"
                              disabled={isRequested || cancelRequestLoadingId === requestKey}
                              onClick={() => handleCancelRequest(enrollment)}
                            >
                              {isRequested
                                ? '취소 요청 완료'
                                : cancelRequestLoadingId === requestKey
                                  ? '요청 처리중...'
                                  : '수강 취소 요청'}
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
          </div>
        )}
      </div>

      <Tail />

    </>
  );
}

export default MyPage;
