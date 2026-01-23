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

        if (response.status === 403) {
          // 인증되지 않은 사용자
          alert('로그인이 필요합니다.');
          window.location.href = '/auth/login';
          return;
        }

        if (response.status === 401) {
          // 인증 만료
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          window.location.href = '/auth/login';
          return;
        }

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
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/student/mypage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: editForm.name,
          educationLevel: editForm.educationLevel,
          interestCategory: editForm.interestCategory
        })
      });

      if (response.status === 403 || response.status === 401) {
        alert('로그인이 필요합니다.');
        window.location.href = '/auth/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      setUser(editForm);
      setIsEditing(false);
      alert('프로필이 성공적으로 업데이트되었습니다.');
    } catch (err) {
      alert(`오류: ${err.message}`);
      console.error('Error updating profile:', err);
    }
  };

  const handleCancel = () => {
    setEditForm(user);
    setIsEditing(false);
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
                      <Input
                        id="educationLevel"
                        value={editForm.educationLevel}
                        onChange={(e) => setEditForm({...editForm, educationLevel: e.target.value})}
                        placeholder="예: 대학교 재학, 고등학교 졸업 등"
                      />
                    ) : (
                      <Input value={user.educationLevel || '미설정'} readOnly />
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="interestCategory">관심 분야</Label>
                    {isEditing ? (
                      <Input
                        id="interestCategory"
                        value={editForm.interestCategory}
                        onChange={(e) => setEditForm({...editForm, interestCategory: e.target.value})}
                        placeholder="예: Web Development, Mobile App 등"
                      />
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

 
