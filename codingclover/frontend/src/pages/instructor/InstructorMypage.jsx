import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Clock, CheckCircle, XCircle, Upload, Edit, User, ChevronDown, AlertCircle, BookOpen } from "lucide-react";
import InstructorSidebar from '@/components/InstructorSidebar';

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

const getStatusInfo = (status) => {
  switch (status) {
    case 'APPLIED':
      return { text: '심사 중', icon: Clock };
    case 'APPROVED':
      return { text: '승인', icon: CheckCircle };
    case 'REJECTED':
      return { text: '반려', icon: XCircle };
    default:
      return { text: '미신청', icon: FileText };
  }
};

function InstructorMypage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('ALL');
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

  // 강좌 목록 로드
  const loadCourses = async () => {
    const loginId = getLoginId();
    if (!loginId) return;

    try {
      const response = await fetch('/instructor/course', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('강좌 목록 로드 실패:', err);
    }
  };

  useEffect(() => {
    if (profile?.status === 'APPROVED') {
      loadCourses();
    }
  }, [profile]);

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

    if (!formData.bio || formData.bio.trim().length < 10) {
      alert('자기소개는 최소 10자 이상 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.careerYears || isNaN(formData.careerYears) || parseInt(formData.careerYears) < 0) {
      alert('경력 년수는 0 이상의 숫자를 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    if (!profile?.resumeFilePath && !formData.resumeFile) {
      alert('이력서 파일을 업로드해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('bio', formData.bio.trim());
      submitData.append('careerYears', parseInt(formData.careerYears));

      if (formData.resumeFile) {
        submitData.append('resumeFile', formData.resumeFile);
      }

      const response = await fetch('/api/instructor/mypage', {
        method: 'POST',
        headers: { 'X-Login-Id': loginId },
        credentials: 'include',
        body: submitData
      });

      if (response.ok) {
        alert('강사 신청이 완료되었습니다.');
        window.location.reload();
      } else {
        throw new Error('신청서 제출에 실패했습니다.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('PDF 파일만 업로드 가능합니다.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하만 허용됩니다.');
        return;
      }
      setFormData({ ...formData, resumeFile: file });
    }
  };

  const getFilterLabel = (filter) => {
    switch (filter) {
      case 'ALL': return '전체';
      case 'APPROVED': return '승인';
      case 'PENDING': return '승인 대기';
      case 'REJECTED': return '반려';
      default: return '전체';
    }
  };

  const filteredCourses = courses.filter(course => {
    if (courseFilter === 'ALL') return true;
    return course.proposalStatus === courseFilter;
  });

  if (loading) {
    return (
      <>
        <Nav />
        <div className="pt-20 pb-12 container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground animate-pulse">프로필 정보를 불러오는 중...</p>
          </div>
        </div>
        <Tail />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Nav />
        <div className="pt-20 pb-12 container mx-auto px-6 max-w-7xl">
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
        </div>
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
      {/* Platform Standard Layout - Clean, Sidebar, White/Gray Theme */}
      <div className="min-h-screen bg-white text-gray-900 pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-8">

          {/* Left Sidebar */}
          <InstructorSidebar />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="space-y-12">
              {/* Header */}
              <header>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-black">
                  Instructor dashboard
                </h1>
                <p className="text-base text-muted-foreground">
                  안녕하세요, <span className="font-bold text-foreground">{profile.name}</span>님.
                </p>
              </header>

              {/* Profile Card */}
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start gap-6 relative overflow-hidden group">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 shadow-inner">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1 z-10 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4">
                      <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                        <span className="text-xs font-bold text-gray-500 block mb-0.5">경력</span>
                        <span className="text-sm font-medium text-gray-900">{profile.careerYears || '미설정'}년</span>
                      </div>
                      <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                        <span className="text-xs font-bold text-gray-500 block mb-0.5">강사 상태</span>
                        <span className="text-sm font-medium text-gray-900">{statusInfo.text}</span>
                      </div>
                      {profile.bio && (
                        <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 w-full">
                          <span className="text-xs font-bold text-gray-500 block mb-0.5">자기소개</span>
                          <p className="text-sm text-gray-600">{profile.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Form */}
              {!isApproved && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{profile?.status === 'REJECTED' ? '강사 재신청' : '강사 신청'}</h2>
                    <p className="text-gray-500 mt-1 text-sm">
                      {profile?.status === 'REJECTED'
                        ? '신청이 반려되었습니다. 사유를 확인하고 다시 신청해주세요.'
                        : hasProfile
                          ? '신청이 완료되었습니다. 관리자 승인을 기다려주세요.'
                          : '강사로 활동하기 위해 신청서를 작성해주세요.'}
                    </p>
                  </div>

                  <Card className="bg-white border border-gray-200 rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <FileText className="w-5 h-5 text-purple-600" />
                        {profile?.status === 'REJECTED' ? '새로운 정보로 재신청' : '강사 등록 신청'}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      {profile?.status === 'REJECTED' && !isEditing && (
                        <div className="mb-8 bg-red-50 border border-red-100 rounded-xl p-6">
                          <h3 className="text-red-600 font-bold flex items-center gap-2 mb-2">
                            <XCircle className="w-5 h-5" />
                            반려 사유
                          </h3>
                          <p className="text-gray-700 whitespace-pre-wrap pl-7">
                            {profile.rejectReason || "반려 사유가 기재되지 않았습니다."}
                          </p>
                          <div className="mt-4 pl-7">
                            <Button onClick={() => setIsEditing(true)} variant="destructive">
                              <Edit className="w-4 h-4 mr-2" />
                              내용 수정 및 재신청
                            </Button>
                          </div>
                        </div>
                      )}

                      {(!hasProfile || isEditing) ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <Label>자기소개 *</Label>
                              <Textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="강사로서의 경험과 전문 분야를 소개해주세요"
                                className="h-32 mt-2"
                                required
                              />
                            </div>
                            <div>
                              <Label>경력 년수 *</Label>
                              <Input
                                type="number"
                                value={formData.careerYears}
                                onChange={(e) => setFormData({ ...formData, careerYears: e.target.value })}
                                placeholder="숫자만 입력"
                                className="mt-2"
                                min="0"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label>이력서 첨부</Label>
                            <input
                              type="file"
                              onChange={handleFileChange}
                              accept=".pdf"
                              className="hidden"
                              id="resumeFile"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('resumeFile').click()}
                              className="w-full h-11 border-dashed mt-2"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {formData.resumeFile ? formData.resumeFile.name : '이력서 첨부하기 (PDF만 가능)'}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">
                              PDF 파일만 업로드 가능합니다. (최대 10MB)
                              {!profile?.resumeFilePath && !formData.resumeFile && (
                                <span className="text-destructive font-medium ml-1"> * 필수</span>
                              )}
                            </p>
                          </div>

                          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                            {isEditing && (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsEditing(false)}
                                disabled={isSubmitting}
                              >
                                취소
                              </Button>
                            )}
                            <Button type="submit" disabled={isSubmitting} className="shadow-lg hover:shadow-primary/25 bg-primary hover:bg-primary/90">
                              {isSubmitting ? '처리 중...' : '신청서 제출'}
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-gray-500">자기소개</Label>
                              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">{profile.bio || '자기소개가 없습니다.'}</div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-500">경력 연차</Label>
                              <div className="text-lg font-medium text-gray-900">{profile.careerYears}년</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Course Management */}
              {isApproved && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">내 강좌실</h2>
                      <p className="text-gray-500 mt-1 text-sm">개설한 강좌 목록을 관리합니다.</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          {getFilterLabel(courseFilter)}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setCourseFilter('ALL')}>전체</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCourseFilter('APPROVED')}>승인</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCourseFilter('PENDING')}>승인 대기</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCourseFilter('REJECTED')}>반려</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {filteredCourses.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">개설된 강좌가 없습니다</h3>
                      <p className="text-gray-500 mb-6 max-w-sm">
                        {courseFilter === 'ALL'
                          ? '새로운 강좌를 개설하여 수강생들과 지식을 나눠보세요!'
                          : `${getFilterLabel(courseFilter)} 상태의 강좌가 없습니다.`}
                      </p>
                      {courseFilter === 'ALL' && (
                        <Button onClick={() => navigate('/instructor/course/new')} className="font-bold shadow-lg bg-primary hover:bg-primary/90">
                          강좌 개설하기
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {filteredCourses.map((course) => (
                        <div
                          key={course.courseId}
                          className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                          onClick={() => navigate(`/instructor/course/${course.courseId}`)}
                        >
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                                  {course.title}
                                </h3>
                                <p className="text-gray-500 mb-3 line-clamp-2 text-sm leading-relaxed">
                                  {course.description}
                                </p>
                                <div className="flex items-center gap-3 text-xs font-medium">
                                  <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-md">Lv. {course.level}</span>
                                  <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-md">
                                    {course.price.toLocaleString()}P
                                  </span>
                                  <span className="text-gray-400">
                                    {new Date(course.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.proposalStatus === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : course.proposalStatus === 'PENDING'
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-red-50 text-red-600'
                                  }`}>
                                  {course.proposalStatus === 'APPROVED' && '승인'}
                                  {course.proposalStatus === 'PENDING' && '심사 대기'}
                                  {course.proposalStatus === 'REJECTED' && '반려'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Tail />
    </>
  );
}

export default InstructorMypage;