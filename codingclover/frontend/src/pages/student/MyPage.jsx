import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { User, Edit, Coins, ChevronRight } from "lucide-react";
import axios from 'axios';
import { getPointsBalance } from '@/lib/pointsApi';
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

  // 포인트 조회 함수
  const fetchUserPoints = async () => {
    try {
      setPointsLoading(true);
      const balance = await getPointsBalance();
      setPoints(balance);
    } catch (error) {
      console.error('포인트 조회 실패:', error);
      setPoints(150000); // 샘플 데이터
    } finally {
      setPointsLoading(false);
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
      <div className='py-8'/>

      <section className="container mx-auto px-4 py-20">

        {loading && <p className="text-center">사용자 정보를 불러오는 중...</p>}

        {error && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-destructive">
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold text-destructive mb-2">
                  {error.includes('로그인') ? '로그인 필요' : '서버 오류'}
                </h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                {error.includes('백엔드 서버를 재시작') && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm text-yellow-800">
                    <p className="font-medium">해결 방법:</p>
                    <p>1. 백엔드 서버를 중지하고 재시작하세요</p>
                    <p>2. 새로고침 버튼을 눌러 다시 시도하세요</p>
                  </div>
                )}
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    새로고침
                  </Button>
                  <Button onClick={() => window.location.href = '/auth/login'}>
                    로그인 페이지로
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && !error && user && (
          <>
            <div className="max-w-4xl mx-auto flex justify-between mb-8">
              <h1 className="text-3xl font-bold">마이페이지</h1>
              {!isEditing && (
                <Button variant="outline" onClick={handleEditToggle}>
                  <Edit className="w-4 h-4 mr-2" />
                  정보 수정
                </Button>
              )}
            </div>

            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" /> 프로필 정보
                </CardTitle>
                <CardDescription>회원 기본 정보</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">

                  <div>
                    <Label>이름</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    ) : (
                      <Input value={user.name} readOnly />
                    )}
                  </div>

                  <div>
                    <Label>이메일</Label>
                    <Input
                      value={user.email}
                      readOnly
                      className={isEditing ? "bg-gray-50 text-gray-600 cursor-not-allowed" : ""}
                    />
                  </div>

                  <div>
                    <Label>가입일</Label>
                    <Input
                      value={user.joinDate}
                      readOnly
                      className={isEditing ? "bg-gray-50 text-gray-600 cursor-not-allowed" : ""}
                    />
                  </div>

                  <div>
                    <Label>학습 수준</Label>
                    {isEditing ? (
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={editForm.educationLevel}
                        onChange={e => setEditForm({ ...editForm, educationLevel: e.target.value })}
                      >
                        <option value="">선택</option>
                        {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <Input value={user.educationLevel || "미설정"} readOnly />
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label>관심 분야</Label>

                    {isEditing ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {INTEREST_OPTIONS.map(i => (
                          <label key={i} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedInterests.includes(i)}
                              onChange={e => handleInterestChange(i, e.target.checked)}
                            />
                            {i}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <Input value={user.interestCategory || "미설정"} readOnly />
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={handleCancel}>취소</Button>
                    <Button onClick={handleSave}>저장</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 포인트 카드 */}
            <Card className="max-w-4xl mx-auto mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img src={coinImg} alt="코인" className="w-6 h-6" />
                  내 포인트
                </CardTitle>
                <CardDescription>
                  포인트 잔액 및 사용 내역을 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {pointsLoading ? '로딩중...' : `${points.toLocaleString()}P`}
                    </div>
                    <p className="text-sm text-gray-600">
                      현재 보유 포인트
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/student/points')}
                    className="flex items-center gap-2"
                  >
                    상세보기
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        {/* 수강 목록 */}
        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-bold mb-6">내가 듣는 강좌</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {enrollments.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">아직 수강 중인 강좌가 없습니다.</p>
                <p className="text-sm text-gray-400 mt-2">강좌를 둘러보고 수강 신청해보세요!</p>
              </div>
            ) : (
              enrollments.map((enrollment) => (
                <Card key={enrollment.enrollmentId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{enrollment.courseTitle}</CardTitle>
                    <CardDescription>
                      수강 상태: {enrollment.status === 'ENROLLED' ? '수강중' :
                        enrollment.status === 'COMPLETED' ? '완료' : '취소됨'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">
                      수강 신청일: {new Date(enrollment.enrolledAt).toLocaleDateString('ko-KR')}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${enrollment.status === 'ENROLLED' ? 'bg-blue-600' :
                          enrollment.status === 'COMPLETED' ? 'bg-green-600' : 'bg-gray-400'
                          }`}
                        style={{ width: "0%" }}
                      />
                    </div>
                    <Button
                      className="w-full"
                      disabled={enrollment.status === 'CANCELLED'}
                      variant={enrollment.status === 'COMPLETED' ? 'outline' : 'default'}
                    >
                      {enrollment.status === 'ENROLLED' ? '강의 보기' :
                        enrollment.status === 'COMPLETED' ? '다시 보기' : '취소된 강좌'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}

          </div>
        </div>

      </section>

      <Tail />
    </>
  );
}

export default MyPage;
