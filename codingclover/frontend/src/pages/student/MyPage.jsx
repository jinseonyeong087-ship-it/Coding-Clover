import React, { useState, useEffect } from 'react';
import StudentNav from '../../components/StudentNav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { User, Edit } from "lucide-react";


// 로그인 ID 추출
const getLoginId = () => {
  const storedUsers = localStorage.getItem("users");
  if (!storedUsers) return "student";
  try {
    return JSON.parse(storedUsers).loginId || "student";
  } catch {
    return "student";
  }
};

// 관심분야 배열
const parseInterests = (value) => {
  if (!value || value === "미설정") return [];
  return value.split(', ').filter(v => v && v !== "미설정");
};

function MyPage() {

  //마이페이지 화면 상태
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    educationLevel: '',
  });

  const [selectedInterests, setSelectedInterests] = useState([]);

  // 코딩 학습 수준 드롭다운
  const educationOptions = [
    "입문 (코딩 경험 없음)",
    "초급 (기초 문법 이해)",
    "중급 (프로젝트 경험 있음)"
  ];

  //관심분야 체크박스
  const interestOptions = [
    "C", "C++", "Java", "Python",
    "HTML/CSS", "JavaScript",
    "Kotlin", "Swift", "Dart", "Database"
  ];

  //백엔드 api 호출
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/student/mypage', {
          headers: {
            'Content-Type': 'application/json',
            'X-Login-Id': getLoginId()
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`서버 오류 (${response.status})`);
        }
        //백엔드 json을 js 객체로 변환
        const data = await response.json();
        //user 상태 설정
        setUser({
          ...data,
          joinDate: new Date(data.joinDate).toLocaleDateString('ko-KR')
        });
        //수정 폼 초기값 설정
        setEditForm({
          name: data.name,
          educationLevel: data.educationLevel || ''
        });
        //관심분야 문자열 ->체크박스 배열 변환
        setSelectedInterests(parseInterests(data.interestCategory));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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
      const interestCategory =
        selectedInterests.length > 0
          ? selectedInterests.join(', ')
          : "미설정";
      //백엔드에 수정내용 전송
      const response = await fetch('/api/student/mypage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Login-Id': getLoginId()
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
      setUser(prev => ({
        ...prev,
        name: editForm.name,
        educationLevel: editForm.educationLevel,
        interestCategory
      }));

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
        {error && <p className="text-center text-red-600">오류: {error}</p>}

        {!loading && !error && user && (
          <>
            <div className="flex justify-between mb-8">
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
                        {educationOptions.map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <Input value={user.educationLevel || "미설정"} readOnly />
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label>관심 분야</Label>

                    {isEditing ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {interestOptions.map(i => (
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
        {/* ===============================
            내가 듣는 강좌 (더미)
           =============================== */}
        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-bold mb-6">내가 듣는 강좌</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* 더미 강좌 1 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">파이썬 기초 프로그래밍</CardTitle>
                <CardDescription>김강사 | 초급</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">진행률: 65% (13/20강)</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }} />
                </div>
                <p className="text-sm text-gray-500">마지막 수강: 2026.01.23</p>
                <Button className="w-full">강좌 계속하기</Button>
              </CardContent>
            </Card>

            {/* 더미 강좌 2 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">JavaScript 웹 개발</CardTitle>
                <CardDescription>박강사 | 중급</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">진행률: 40% (8/20강)</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "40%" }} />
                </div>
                <p className="text-sm text-gray-500">마지막 수강: 2026.01.22</p>
                <Button className="w-full" variant="outline">
                  강좌 계속하기
                </Button>
              </CardContent>
            </Card>

            {/* 더미 강좌 3 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Java 객체지향 프로그래밍</CardTitle>
                <CardDescription>이강사 | 중급</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">진행률: 85% (17/20강)</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: "85%" }} />
                </div>
                <p className="text-sm text-gray-500">마지막 수강: 2026.01.24</p>
                <Button className="w-full">강좌 계속하기</Button>
              </CardContent>
            </Card>

          </div>
        </div>

      </section>

      <Tail />
    </>
  );
}

export default MyPage;
