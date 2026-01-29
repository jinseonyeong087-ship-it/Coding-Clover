import React, { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { User, Edit, FileText, Clock, CheckCircle, XCircle, Upload } from "lucide-react";

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

    // 유효성 검사
    const errors = [];
    
    if (!formData.bio || formData.bio.trim().length === 0) {
      errors.push('자기소개를 입력해주세요.');
    } else if (formData.bio.trim().length < 10) {
      errors.push('자기소개는 최소 10자 이상 입력해주세요.');
    }
    
    if (!formData.careerYears || formData.careerYears.toString().trim().length === 0) {
      errors.push('경력 년수를 입력해주세요.');
    } else if (isNaN(formData.careerYears) || parseInt(formData.careerYears) < 0) {
      errors.push('경력 년수는 0 이상의 숫자를 입력해주세요.');
    }
    
    // 신규 신청인 경우 이력서 필수
    if (!profile?.resumeFilePath && !formData.resumeFile) {
      errors.push('이력서 파일을 업로드해주세요.');
    }
    
    // 이력서 파일 형식 확인 (업로드된 경우)
    if (formData.resumeFile) {
      const fileExtension = formData.resumeFile.name.split('.').pop().toLowerCase();
      if (fileExtension !== 'pdf') {
        errors.push('이력서는 PDF 파일만 업로드 가능합니다.');
      }
      
      // 파일 크기 확인 (10MB 제한)
      if (formData.resumeFile.size > 10 * 1024 * 1024) {
        errors.push('파일 크기는 10MB 이하만 허용됩니다.');
      }
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
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

  // 파일 선택 버튼 클릭
  const handleFileButtonClick = () => {
    document.getElementById('resumeFile').click();
  };

  // 로딩 중
  if (loading) {
    return (
      <>
        <Nav />
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
        <Nav />
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
      <Nav />

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
                    <Label htmlFor="bio">자기소개 <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="강사로서의 경험과 전문 분야를 소개해주세요. (최소 10자 이상)"
                      rows={4}
                      required
                      className={formData.bio.trim().length > 0 && formData.bio.trim().length < 10 ? 'border-red-300' : ''}
                    />
                    {formData.bio.trim().length > 0 && formData.bio.trim().length < 10 && (
                      <p className="text-sm text-red-500 mt-1">자기소개는 최소 10자 이상 입력해주세요.</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="careerYears">경력 연차 <span className="text-red-500">*</span></Label>
                    <Input
                      id="careerYears"
                      type="number"
                      value={formData.careerYears}
                      onChange={(e) => setFormData(prev => ({ ...prev, careerYears: e.target.value }))}
                      placeholder="숫자만 입력해 주세요 (0년 이상)"
                      min="0"
                      max="50"
                      required
                      className={formData.careerYears && (isNaN(formData.careerYears) || parseInt(formData.careerYears) < 0) ? 'border-red-300' : ''}
                    />
                    {formData.careerYears && (isNaN(formData.careerYears) || parseInt(formData.careerYears) < 0) && (
                      <p className="text-sm text-red-500 mt-1">경력은 0년 이상의 숫자를 입력해주세요.</p>
                    )}
                  </div>

                  <div>
                    <Label>이력서 첨부 <span className="text-red-500">*</span></Label>
                    <div className="space-y-3">
                      {/* 선택된 파일 표시 박스 */}
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                        formData.resumeFile || profile?.resumeFilePath 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-300 bg-gray-50'
                      }`}>
                        {formData.resumeFile ? (
                          <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                            <FileText className="w-4 h-4" />
                            <span>{formData.resumeFile.name}</span>
                          </div>
                        ) : profile?.resumeFilePath ? (
                          <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                            <FileText className="w-4 h-4" />
                            <span>기존 이력서 파일이 있습니다</span>
                          </div>
                        ) : (
                          <p className="text-sm text-red-500">
                            이력서 파일을 업로드해주세요 (필수)
                          </p>
                        )}
                      </div>

                      {/* 숨겨진 file input */}
                      <input
                        id="resumeFile"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.hwp"
                        className="hidden"
                      />

                      {/* 커스텀 파일 선택 버튼 */}
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleFileButtonClick}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        이력서 첨부하기 (PDF만 가능)
                      </Button>

                      <p className="text-sm text-muted-foreground">
                        PDF 파일만 업로드 가능합니다. (최대 10MB)
                        {!profile?.resumeFilePath && !formData.resumeFile && (
                          <span className="text-red-500 font-medium"> - 필수 항목입니다</span>
                        )}
                      </p>
                    </div>
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