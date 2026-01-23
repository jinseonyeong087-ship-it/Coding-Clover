import React, { useState, useEffect } from 'react';
import StudentNav from '../../components/StudentNav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { User, Edit } from "lucide-react"

function MyPage() {
  // 사용자 데이터 (API에서 가져옴)
  const [user, setUser] = useState({
    name: '',
    email: '',
    joinDate: '',
    educationLevel: '',
    interestCategory: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(user);

  // 학습 수준 옵션
  const educationOptions = [
    "초등학교",
    "중학교", 
    "고등학교",
    "대학교 재학",
    "대학교 졸업",
    "대학원",
    "기타"
  ];

  // 관심 분야 옵션
  const interestOptions = [
    "Web Development",
    "Mobile App Development", 
    "Data Science",
    "AI/Machine Learning",
    "Game Development",
    "Backend Development",
    "Frontend Development",
    "DevOps",
    "Cybersecurity",
    "Database",
    "Cloud Computing",
    "Blockchain"
  ];

  // 관심 분야 체크박스 상태
  const [selectedInterests, setSelectedInterests] = useState([]);

  // 사용자 데이터 로드 시 관심 분야 파싱
  useEffect(() => {
    if (user.interestCategory && user.interestCategory !== "미설정") {
      const interests = user.interestCategory
        .split(', ')
        .filter(item => item.length > 0 && item !== "미설정");
      setSelectedInterests(interests);
    } else {
      setSelectedInterests([]);
    }
  }, [user.interestCategory]);

  // 컴포넌트 마운트 시 사용자 정보 조회
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/student/mypage', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`서버 오류: ${response.status}`);
        }

        const data = await response.json();
        
        setUser({
          name: data.name,
          email: data.email,
          joinDate: new Date(data.joinDate).toLocaleDateString('ko-KR'),
          educationLevel: data.educationLevel || '',
          interestCategory: data.interestCategory || ''
        });
      } catch (err) {
        setError(err.message);
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm(user);
      // 편집 모드 진입 시 현재 관심 분야를 체크박스에 반영
      if (user.interestCategory) {
        setSelectedInterests(user.interestCategory.split(', ').filter(item => item.length > 0));
      }
    }
  };

  // 관심 분야 체크박스 핸들러
  const handleInterestChange = (interest, checked) => {
    if (checked) {
      setSelectedInterests([...selectedInterests, interest]);
    } else {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    }
  };

  const handleSave = async () => {
    try {
      // 관심 분야를 문자열로 결합
      const interestCategoryString = selectedInterests.length > 0 
        ? selectedInterests.join(', ')
        : "미설정";
      
      const dataToSend = {
        name: editForm.name,
        educationLevel: editForm.educationLevel,
        interestCategory: interestCategoryString
      };
      
      const response = await fetch('/api/student/mypage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend)
      });

      const result = await response.text();

      if (response.ok) {
        setIsEditing(false);
        alert(`저장 완료!`);
        // 페이지 새로고침으로 DB에서 최신 데이터 다시 로드
        window.location.reload();
      } else {
        alert(`서버 오류 (${response.status}): ${result}`);
      }
      
    } catch (err) {
      alert(`네트워크 오류: ${err.message}`);
      console.error('Error calling API:', err);
    }
  };

  const handleCancel = () => {
    setEditForm(user);
    setIsEditing(false);
    // 관심 분야도 원래대로 되돌리기
    if (user.interestCategory) {
      setSelectedInterests(user.interestCategory.split(', ').filter(item => item.length > 0));
    } else {
      setSelectedInterests([]);
    }
  };

  return (
    <>
      <StudentNav />

      <section className="container mx-auto px-4 py-16">
        {loading && (
          <div className="text-center py-16">
            <p className="text-lg">사용자 정보를 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-lg text-red-600">오류: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              다시 시도
            </Button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">마이페이지</h1>
              <Button onClick={handleEditToggle} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? '취소' : '정보 수정'}
              </Button>
            </div>

            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  프로필 정보
                </CardTitle>
                <CardDescription>
                  회원가입 시 입력한 기본 정보입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      />
                    ) : (
                      <Input value={user.name} readOnly />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input value={user.email} readOnly className="bg-gray-50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="joinDate">가입일</Label>
                    <Input value={user.joinDate} readOnly className="bg-gray-50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="educationLevel">학습 수준</Label>
                    {isEditing ? (
                      <select 
                        value={editForm.educationLevel} 
                        onChange={(e) => setEditForm({...editForm, educationLevel: e.target.value})}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      >
                        <option value="">학습 수준을 선택하세요</option>
                        {educationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input value={user.educationLevel || '미설정'} readOnly />
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="interestCategory">관심 분야</Label>
                    {isEditing ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">관심있는 분야를 모두 선택하세요 (복수 선택 가능)</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {interestOptions.map((interest) => (
                            <div key={interest} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={interest}
                                checked={selectedInterests.includes(interest)}
                                onChange={(e) => handleInterestChange(interest, e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <Label 
                                htmlFor={interest}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {interest}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {selectedInterests.length > 0 && (
                          <div className="text-sm text-gray-600">
                            선택된 항목: {selectedInterests.join(', ')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input value={user.interestCategory || '미설정'} readOnly />
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button variant="outline" onClick={handleCancel}>
                      취소
                    </Button>
                    <Button onClick={handleSave}>
                      저장하기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </section>

      <Tail />
    </>
  );
}

export default MyPage;

 
