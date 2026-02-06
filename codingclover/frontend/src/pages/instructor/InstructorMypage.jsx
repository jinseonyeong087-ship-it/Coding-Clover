import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Clock, CheckCircle, XCircle, Upload, Edit, User, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

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
      return { text: '승인', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
    case 'REJECTED':
      return { text: '반려', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' };
    default:
      return { text: '미신청', icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50' };
  }
};

function InstructorMypage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(5);
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

  // 강좌 목록 로드 함수
  const loadCourses = async () => {
    const loginId = getLoginId();
    if (!loginId) return;

    try {
      const response = await fetch('/instructor/course', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        console.error('강좌 목록을 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('강좌 목록 로드 실패:', err);
    }
  };

  // 승인된 강사인 경우 강좌 목록도 로드
  useEffect(() => {
    if (profile?.status === 'APPROVED') {
      loadCourses();
    }
  }, [profile]);

  // 필터링된 강좌 목록 계산
  const filteredCourses = courses.filter(course => {
    if (courseFilter === 'ALL') return true;
    return course.proposalStatus === courseFilter;
  });

  // 필터 변경 시 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [courseFilter]);

  // 페이징 계산
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // 필터 라벨 가져오기
  const getFilterLabel = (filter) => {
    switch (filter) {
      case 'ALL': return '전체';
      case 'APPROVED': return '승인';
      case 'PENDING': return '승인 대기';
      case 'REJECTED': return '반려';
      default: return '전체';
    }
  };

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
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      <Nav />
      {/* Background Decoration */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <main className="container mx-auto px-4 py-16 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-2">
              강사 마이페이지
            </h1>
            <p className="text-muted-foreground">
              프로필 정보를 관리하고 활동 내역을 확인하세요.
            </p>
          </div>

          {/* 승인 상태 표시 */}
          {hasProfile && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm backdrop-blur-sm ${statusInfo.bg.replace('50', '500/10')} border-${statusInfo.color.split('-')[1]}-200`}>
              <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
              <span className={`font-bold ${statusInfo.color}`}>{statusInfo.text}</span>
            </div>
          )}
        </div>

        {/* 승인되지 않은 경우 - 신청 폼 또는 대기 메시지 */}
        {!isApproved && (
          <Card className="max-w-4xl mx-auto bg-background/60 backdrop-blur-xl border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="w-5 h-5 text-primary" />
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
                    <div className="space-y-2">
                      <Label>이름</Label>
                      <div className="p-3 bg-muted/50 rounded-lg border border-border/50 text-foreground/80">{profile?.name}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>이메일</Label>
                      <div className="p-3 bg-muted/50 rounded-lg border border-border/50 text-foreground/80">{profile?.email}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">자기소개 <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="강사로서의 경험과 전문 분야를 소개해주세요. (최소 10자 이상)"
                      rows={4}
                      required
                      className={`bg-background/50 ${formData.bio.trim().length > 0 && formData.bio.trim().length < 10 ? 'border-destructive' : ''}`}
                    />
                    {formData.bio.trim().length > 0 && formData.bio.trim().length < 10 && (
                      <p className="text-sm text-destructive mt-1">자기소개는 최소 10자 이상 입력해주세요.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="careerYears">경력 연차 <span className="text-destructive">*</span></Label>
                    <Input
                      id="careerYears"
                      type="number"
                      value={formData.careerYears}
                      onChange={(e) => setFormData(prev => ({ ...prev, careerYears: e.target.value }))}
                      placeholder="숫자만 입력해 주세요 (0년 이상)"
                      min="0"
                      max="50"
                      required
                      className={`bg-background/50 ${formData.careerYears && (isNaN(formData.careerYears) || parseInt(formData.careerYears) < 0) ? 'border-destructive' : ''}`}
                    />
                    {formData.careerYears && (isNaN(formData.careerYears) || parseInt(formData.careerYears) < 0) && (
                      <p className="text-sm text-destructive mt-1">경력은 0년 이상의 숫자를 입력해주세요.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>이력서 첨부 <span className="text-destructive">*</span></Label>
                    <div className="space-y-3">
                      {/* 선택된 파일 표시 박스 */}
                      <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${formData.resumeFile || profile?.resumeFilePath
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-border/50 bg-muted/30 hover:border-primary/50'
                        }`}>
                        {formData.resumeFile ? (
                          <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-medium">
                            <FileText className="w-4 h-4" />
                            <span>{formData.resumeFile.name}</span>
                          </div>
                        ) : profile?.resumeFilePath ? (
                          <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-medium">
                            <FileText className="w-4 h-4" />
                            <span>기존 이력서 파일이 있습니다</span>
                          </div>
                        ) : (
                          <p className="text-sm text-destructive/80 font-medium">
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
                        className="w-full h-11 border-dashed"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        이력서 첨부하기 (PDF만 가능)
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        PDF 파일만 업로드 가능합니다. (최대 10MB)
                        {!profile?.resumeFilePath && !formData.resumeFile && (
                          <span className="text-destructive font-medium ml-1"> * 필수</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
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
                    <Button type="submit" disabled={isSubmitting} className="shadow-lg hover:shadow-primary/25">
                      {isSubmitting ? '처리 중...' : '신청서 제출'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">이름</Label>
                      <div className="text-lg font-medium">{profile.name}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">이메일</Label>
                      <div className="text-lg font-medium">{profile.email}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">자기소개</Label>
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">{profile.bio}</div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">경력 연차</Label>
                    <div className="text-lg font-medium">{profile.careerYears}년</div>
                  </div>

                  {profile.resumeFilePath && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">이력서</Label>
                      <div className="flex items-center gap-2 text-emerald-600 font-medium p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20 w-fit">
                        <CheckCircle className="w-4 h-4" />
                        파일이 업로드되었습니다.
                      </div>
                    </div>
                  )}

                  {profile.status === 'APPLIED' && (
                    <div className="flex justify-end pt-6 border-t border-border/50">
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
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
            <Card className="max-w-4xl mx-auto bg-background/60 backdrop-blur-xl border-border/50 shadow-xl mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> 강사 정보
                </CardTitle>
                <CardDescription>승인된 강사 프로필</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">이름</Label>
                    <div className="text-lg font-medium">{profile.name}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">이메일</Label>
                    <div className="text-lg font-medium">{profile.email}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">자기소개</Label>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">{profile.bio || '자기소개가 없습니다.'}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">경력 연차</Label>
                  <div className="text-lg font-medium">{profile.careerYears}년</div>
                </div>
              </CardContent>
            </Card>

            {/* 개설 강좌 목록 */}
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">개설 강좌 관리</h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 bg-background/50 backdrop-blur-sm">
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

              {currentCourses.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border/50">
                  <p>{courseFilter === 'ALL' ? '아직 개설된 강좌가 없습니다.' : `${getFilterLabel(courseFilter)} 상태의 강좌가 없습니다.`}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentCourses.map((course) => (
                      <Card
                        key={course.courseId}
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-background/60 backdrop-blur-xl border-border/50 hover:bg-background/80 group"
                        onClick={() => navigate(`/instructor/course/${course.courseId}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                              <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{course.description}</p>
                              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                <span className="bg-muted px-2 py-1 rounded">Lv. {course.level}</span>
                                <span className="bg-muted px-2 py-1 rounded">{course.price.toLocaleString()}원</span>
                                <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="ml-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${course.proposalStatus === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : course.proposalStatus === 'PENDING'
                                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                  : 'bg-red-500/10 text-red-600 border-red-500/20'
                                }`}>
                                {course.proposalStatus === 'APPROVED' && '승인'}
                                {course.proposalStatus === 'PENDING' && '심사 대기'}
                                {course.proposalStatus === 'REJECTED' && '반려'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* 페이징 */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 bg-background/50 backdrop-blur-sm"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        이전
                      </Button>

                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 ${currentPage !== page && "bg-background/50 backdrop-blur-sm"}`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 bg-background/50 backdrop-blur-sm"
                      >
                        다음
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </main>

      <Tail />
    </div>
  );
}

export default InstructorMypage;