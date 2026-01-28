import React, { useState, useEffect } from 'react';
import InstructorNav from '../../components/InstructorNav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { User, Edit, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

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

// 승인 상태에 따른 스타일과 텍스트
const getStatusInfo = (status) => {
  switch (status) {
    case 'APPLIED':
      return { text: '심사 중', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    case 'APPROVED':
      return { text: '승인됨', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
    case 'REJECTED':
      return { text: '거절됨', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' };
    default:
      return { text: '미신청', icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50' };
  }
};

function InstructorMypage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    careerYears: '',
    resumeFile: null
  });

  // 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      const loginId = getLoginId();
      if (!loginId) {
        setError('로그인이 필요한 서비스입니다.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/instructor/mypage', {
          headers: {
            'Content-Type': 'application/json',
            'X-Login-Id': loginId
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setFormData({
            bio: data.bio || '',
            careerYears: data.careerYears || '',
            resumeFile: null
          });
        } else {
          throw new Error('프로필 정보를 불러올 수 없습니다.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const loginId = getLoginId();
    if (!loginId) {
      alert('로그인이 필요합니다.');
      setIsSubmitting(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('bio', formData.bio);
      submitData.append('careerYears', formData.careerYears);
      if (formData.resumeFile) {
        submitData.append('resumeFile', formData.resumeFile);
      }

      const response = await fetch('/api/instructor/mypage', {
        method: 'POST',
        headers: {
          'X-Login-Id': loginId
        },
        credentials: 'include',
        body: submitData
      });

      if (response.ok) {
        alert('강사 신청이 완료되었습니다. 관리자 승인을 기다려주세요.');
        setIsEditing(false);
        // 페이지 새로고침으로 최신 상태 반영
        window.location.reload();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || '신청 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 파일 선택 처리
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, resumeFile: file }));
  };

  // 로딩 중
  if (loading) {
    return (
      <>
        <InstructorNav />
        <section className="container mx-auto px-4 py-16">
          <p className="text-center">프로필 정보를 불러오는 중...</p>
        </section>
        <Tail />
      </>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <>
        <InstructorNav />
        <section className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto border-destructive">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-destructive mb-2">오류</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>새로고침</Button>
            </CardContent>
          </Card>
        </section>
        <Tail />
      </>
    );
  }

  const statusInfo = getStatusInfo(profile?.status);
  const StatusIcon = statusInfo.icon;
  const isApproved = profile?.status === 'APPROVED';
  const hasProfile = profile?.status !== null;

  return (
    <>
      <InstructorNav />

      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">강사 마이페이지</h1>
          
          {/* 승인 상태 표시 */}
          {hasProfile && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusInfo.bg}`}>
              <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
              <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
            </div>
          )}
        </div>

        {/* 승인되지 않은 경우 - 신청 폼 또는 대기 메시지 */}
        {!isApproved && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                강사 신청
              </CardTitle>
              <CardDescription>
                {hasProfile 
                  ? '신청이 완료되었습니다. 관리자 승인을 기다려주세요.' 
                  : '강사로 활동하기 위해 신청서를 작성해주세요.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!hasProfile || isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>이름</Label>
                      <Input value={profile?.name || ''} readOnly className="bg-gray-50" />
                    </div>
                    <div>
                      <Label>이메일</Label>
                      <Input value={profile?.email || ''} readOnly className="bg-gray-50" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">자기소개 *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="강사로서의 경험과 전문 분야를 소개해주세요."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="careerYears">경력 연차 *</Label>
                    <Input
                      id="careerYears"
                      type="number"
                      value={formData.careerYears}
                      onChange={(e) => setFormData(prev => ({ ...prev, careerYears: e.target.value }))}
                      placeholder="관련 분야 경력 연차를 입력해주세요."
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="resumeFile">이력서 첨부</Label>
                    <Input
                      id="resumeFile"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      PDF, DOC, DOCX 파일만 업로드 가능합니다.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    {isEditing && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        disabled={isSubmitting}
                      >
                        취소
                      </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? '처리 중...' : '신청서 제출'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>이름</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{profile.name}</p>
                    </div>
                    <div>
                      <Label>이메일</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{profile.email}</p>
                    </div>
                  </div>

                  <div>
                    <Label>자기소개</Label>
                    <p className="mt-1 p-3 bg-gray-50 rounded">{profile.bio}</p>
                  </div>

                  <div>
                    <Label>경력 연차</Label>
                    <p className="mt-1 p-2 bg-gray-50 rounded">{profile.careerYears}년</p>
                  </div>

                  {profile.resumeFilePath && (
                    <div>
                      <Label>이력서</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">파일이 업로드되었습니다.</p>
                    </div>
                  )}

                  {profile.status === 'APPLIED' && (
                    <div className="flex justify-end pt-4 border-t">
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        정보 수정
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 승인된 경우 - 강사 정보 및 강좌 목록 */}
        {isApproved && (
          <>
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" /> 강사 정보
                </CardTitle>
                <CardDescription>승인된 강사 프로필</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>이름</Label>
                    <Input value={profile.name} readOnly />
                  </div>
                  <div>
                    <Label>이메일</Label>
                    <Input value={profile.email} readOnly />
                  </div>
                </div>

                <div>
                  <Label>자기소개</Label>
                  <Textarea value={profile.bio || ''} readOnly rows={3} />
                </div>

                <div>
                  <Label>경력 연차</Label>
                  <Input value={`${profile.careerYears}년`} readOnly />
                </div>
              </CardContent>
            </Card>

            {/* 개설 강좌 목록 */}
            <div className="max-w-4xl mx-auto mt-12">
              <h2 className="text-2xl font-bold mb-6">개설 강좌</h2>
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <p>아직 개설된 강좌가 없습니다.</p>
                  <p className="text-sm mt-2">새로운 강좌를 개설해보세요!</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </section>

      <Tail />
    </>
  );
}

export default InstructorMypage;