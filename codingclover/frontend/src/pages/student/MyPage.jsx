import React, { useState, useEffect } from 'react';
import StudentNav from '../../components/StudentNav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { User, Edit } from "lucide-react";

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

const parseInterests = (value) => {
  if (!value || value === "미설정") return [];
  return value.split(', ').filter(v => v && v !== "미설정");
};

const getCachedData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const setCachedData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Cache error:', e);
  }
};

function MyPage() {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverWarning, setServerWarning] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', educationLevel: '' });
  const [selectedInterests, setSelectedInterests] = useState([]);

  const initFormData = (userData) => {
    setEditForm({ name: userData.name, educationLevel: userData.educationLevel || '' });
    setSelectedInterests(parseInterests(userData.interestCategory));
  };

  const loadCachedData = () => {
    const cachedUser = getCachedData('cachedUserProfile');
    const cachedEnrollments = getCachedData('cachedEnrollments');
    
    if (cachedUser) {
      setUser(cachedUser);
      initFormData(cachedUser);
    }
    if (cachedEnrollments) {
      setEnrollments(cachedEnrollments);
    }
  };

  //백엔드 api 호출
  useEffect(() => {
    // 로그인 상태 체크
    const loginId = getLoginId();
    if (!loginId) {
      setError('로그인이 필요한 서비스입니다.');
      setLoading(false);
      return;
    }

    // 데이터 캐싱 채크
    const cachedUser = localStorage.getItem('cachedUserProfile');
    const cachedEnrollments = localStorage.getItem('cachedEnrollments');
    
    // 캐시된 데이터가 있으면 먼저 표시
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        setUser(userData);
        setEditForm({
          name: userData.name,
          educationLevel: userData.educationLevel || ''
        });
        setSelectedInterests(parseInterests(userData.interestCategory));
      } catch (e) {
        console.error('Cached user data parse error:', e);
      }
    }
    
    if (cachedEnrollments) {
      try {
        setEnrollments(JSON.parse(cachedEnrollments));
      } catch (e) {
        console.error('Cached enrollments data parse error:', e);
      }
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const currentLoginId = getLoginId();
        if (!currentLoginId) {
          throw new Error('로그인이 필요합니다.');
        }

        console.log('API 호출 시작 - Login ID:', currentLoginId);

        // 두 API를 병렬로 호출
        const [profileResponse, enrollmentResponse] = await Promise.all([
          fetch('/api/student/mypage', {
            headers: {
              'Content-Type': 'application/json',
              'X-Login-Id': currentLoginId
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

        console.log('프로필 API 응답 상태:', profileResponse.status);
        console.log('수강목록 API 응답 상태:', enrollmentResponse.status);

        // 프로필 데이터 처리
        if (profileResponse.ok) {
          const userData = await profileResponse.json();
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
          
          // 캐시에 저장
          localStorage.setItem('cachedUserProfile', JSON.stringify(processedUserData));
        } else if (profileResponse.status === 500) {
          // 서버 오류 세부 내용 확인
          try {
            const errorData = await profileResponse.text();
            console.error('500 에러 세부 내용:', errorData);
          } catch (e) {
            console.error('에러 응답 파싱 실패:', e);
          }
          
          // 서버 오류시 기본 사용자 정보 생성
          const storedUsers = localStorage.getItem("users");
          if (storedUsers) {
            try {
              const userData = JSON.parse(storedUsers);
              const fallbackUserData = {
                loginId: userData.loginId || '',
                name: userData.name || '사용자',
                email: userData.email || '',
                role: userData.role || 'STUDENT',
                educationLevel: '미설정',
                interestCategory: '미설정',
                joinDate: new Date().toLocaleDateString('ko-KR')
              };
              setUser(fallbackUserData);
              setEditForm({
                name: fallbackUserData.name,
                educationLevel: ''
              });
              setSelectedInterests([]);
              // 조용히 fallback 처리 (콘솔 메시지 없음)
              setServerWarning(`${userData.loginId} 계정의 프로필 데이터가 아직 생성되지 않았습니다. 백엔드에서 프로필을 초기화하는 중일 수 있습니다.`);
            } catch (e) {
              console.error('localStorage 데이터 파싱 실패:', e);
              throw new Error('사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
            }
          } else {
            throw new Error('로그인이 필요합니다.');
          }
        } else {
          // 다른 상태 코드별 에러 메시지 처리
          let errorMessage;
          if (profileResponse.status === 404) {
            errorMessage = '사용자 정보를 찾을 수 없습니다. 회원가입이 완료되었는지 확인해주세요.';
          } else if (profileResponse.status === 401) {
            errorMessage = '로그인이 필요합니다.';
          } else {
            errorMessage = `프로필 조회 실패 (오류 코드: ${profileResponse.status})`;
          }
          throw new Error(errorMessage);
        }

        // 수강 목록 데이터 처리
        if (enrollmentResponse.ok) {
          const enrollmentData = await enrollmentResponse.json();
          setEnrollments(enrollmentData);
          
          // 캐시에 저장
          localStorage.setItem('cachedEnrollments', JSON.stringify(enrollmentData));
        } else {
          console.error('수강 목록 조회 실패:', enrollmentResponse.status);
          setEnrollments([]);
        }

      } catch (err) {
        console.error('데이터 로딩 에러:', err);
        console.error('에러 스택:', err.stack);
        
        // 네트워크 에러와 서버 에러를 구분
        if (err.message.includes('Failed to fetch')) {
          setError('서버에 연결할 수 없습니다. 백엔드 서버가 http://localhost:3333 에서 실행 중인지 확인해주세요.');
        } else {
          setError(err.message);
        }
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      const currentLoginId = getLoginId();
      if (!currentLoginId) {
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
          'X-Login-Id': currentLoginId
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
      
      // 캐시도 업데이트
      localStorage.setItem('cachedUserProfile', JSON.stringify(updatedUser));

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
      <StudentNav />

      <section className="container mx-auto px-4 py-16">

        {loading && <p className="text-center">사용자 정보를 불러오는 중...</p>}
        
        {serverWarning && (
          <div className="max-w-4xl mx-auto mb-6">
            <Card className="border-yellow-500 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 text-yellow-800">
                  <span className="text-xl mt-0.5">ℹ️</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">프로필 정보 안내</p>
                    <p className="text-sm">{serverWarning}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                      onClick={() => window.location.reload()}
                    >
                      다시 시도
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {error && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-destructive">
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold text-destructive mb-2">
                  {error.includes('로그인') ? '로그인 필요' : '오류 발생'}
                </h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <div className="flex justify-center gap-3">
                  {error.includes('로그인') ? (
                    <Button onClick={() => window.location.href = '/auth/login'}>
                      로그인하기
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => window.location.reload()}>
                        새로고침
                      </Button>
                      <Button onClick={() => window.location.href = '/auth/login'}>
                        로그인 페이지로
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && !error && user && (
          <>
            <div className="flex justify-between mb-8">
              <h1 className="text-3xl font-bold">마이페이지</h1>
              {!isEditing && !serverWarning && (
                <Button variant="outline" onClick={handleEditToggle}>
                  <Edit className="w-4 h-4 mr-2" />
                  정보 수정
                </Button>
              )}
              {serverWarning && (
                <Button variant="outline" disabled>
                  <Edit className="w-4 h-4 mr-2" />
                  정보 수정 (서버 오류)
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
                        className={`h-2 rounded-full ${
                          enrollment.status === 'ENROLLED' ? 'bg-blue-600' :
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
