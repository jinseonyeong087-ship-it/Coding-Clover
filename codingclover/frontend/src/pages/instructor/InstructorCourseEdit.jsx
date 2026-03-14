
import React, { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useNavigate, useParams } from "react-router-dom"; // useParams 추가
import axios from 'axios';
import { BookOpen, CheckCircle2, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';

import ImageUpload from '@/components/common/ImageUpload';

function InstructorCourseEdit() {
  const { courseId } = useParams(); // URL에서 courseId 추출
  const [course, setCourse] = useState({ title: '', createdBy: '', level: 1, description: '', price: 0, thumbnailUrl: '' });
  const [errors, setErrors] = useState({});
  const [selectLevel, setSelectLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const levelMapping = [
    { id: 1, level: 1, name: "초급", description: "입문자를 위한 기초 과정" },
    { id: 2, level: 2, name: "중급", description: "실무 활용 및 심화 과정" },
    { id: 3, level: 3, name: "고급", description: "전문가를 위한 마스터 과정" }
  ];

  // 기존 강좌 정보 로드
  useEffect(() => {
    // 1. 강좌 상세 정보 가져오기
    fetch(`/instructor/course/${courseId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error("강좌 정보를 불러오는데 실패했습니다.");
        return res.json();
      })
      .then(data => {
        setCourse({
          title: data.title,
          createdBy: data.instructorName, // or data.createdBy.name if structure differs
          level: data.level,
          description: data.description,
          price: data.price,
          thumbnailUrl: data.thumbnailUrl || '',
          proposalStatus: data.proposalStatus,
          proposalRejectReason: data.proposalRejectReason
        });
        setSelectLevel(data.level);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert("강좌 정보를 불러올 수 없습니다.");
        navigate('/instructor/course');
      });
  }, [courseId, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCourse(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCheckboxChange = (level) => {
    setSelectLevel(selectLevel === level ? null : level);
  };

  const handleClick = () => {
    setErrors({});

    axios.put(`/instructor/course/${courseId}/edit`, {
      title: course.title,
      level: selectLevel,
      description: course.description,
      price: Number(course.price),
      thumbnailUrl: course.thumbnailUrl,
    }, { withCredentials: true })
      .then((response) => {
        alert("강좌 수정이 완료되었습니다.");
        navigate('/instructor/course'); // 목록으로 이동
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const errorData = err.response.data;
          if (typeof errorData === 'string') {
            setErrors({ global: errorData });
          } else {
            setErrors(errorData);
          }
        } else if (err.response?.status === 403) {
          alert("본인의 강좌만 수정할 수 있습니다.");
        } else if (err.response?.status === 401) {
          alert("세션이 만료되었습니다.");
        } else {
          console.error('실패', err);
          alert("수정 중 오류가 발생했습니다.");
        }
      });
  };

  // 재심사 요청 핸들러
  const handleResubmit = () => {
    if (!window.confirm("수정된 내용으로 재심사를 요청하시겠습니까?")) return;

    axios.post(`/instructor/course/${courseId}/resubmit`, {
      title: course.title,
      level: selectLevel,
      description: course.description,
      price: Number(course.price),
      thumbnailUrl: course.thumbnailUrl,
    }, { withCredentials: true })
      .then((response) => {
        alert("재심사 요청이 완료되었습니다.");
        navigate('/instructor/course');
      })
      .catch((err) => {
        console.error("재심사 요청 실패", err);
        alert("재심사 요청 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <Nav />

      <section className="relative container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-4">
              강좌 정보 수정
            </h1>
            <p className="text-slate-600 text-lg">
              강좌 내용을 최신 상태로 업데이트하세요.
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl ring-1 ring-white/50">
            {loading ? (
              <CardContent className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p>강좌 정보를 불러오는 중...</p>
              </CardContent>
            ) : (
              <div className="p-8">
                {errors.global && (
                  <div className="mb-8 p-4 bg-red-50/50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{errors.global}</p>
                  </div>
                )}

                {/* 반려 사유 표시 (REJECTED 상태일 때만) */}
                {course.proposalStatus === 'REJECTED' && (
                  <div className="mb-8 p-6 bg-orange-50/80 border border-orange-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5" />
                      <div>
                        <h3 className="text-lg font-semibold text-orange-800 mb-2">반려된 강좌입니다</h3>
                        <p className="text-orange-700 font-medium mb-1">반려 사유:</p>
                        <p className="text-slate-700 bg-white/50 p-3 rounded-lg border border-orange-100">
                          {course.proposalRejectReason || "사유가 명시되지 않았습니다."}
                        </p>
                        <p className="text-sm text-orange-600 mt-3">
                          내용을 수정한 후 하단의 '재신청' 버튼을 눌러 다시 심사를 요청해주세요.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-8">
                  {/* Basic Info Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-slate-800">기본 정보</h3>
                    </div>

                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-sm font-medium">강좌명</Label>
                        <Input
                          name="title"
                          value={course.title}
                          onChange={handleChange}
                          placeholder="매력적인 강좌 제목을 입력해주세요"
                          className="bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 py-6"
                        />
                        {errors.title && <p className="text-red-500 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-600 text-sm font-medium">썸네일 이미지</Label>
                        {/* 이미지 업로드 컴포넌트 재사용 */}
                        <ImageUpload
                          initialImage={course.thumbnailUrl}
                          onUploadSuccess={(urls) => {
                            setCourse(prev => ({
                              ...prev,
                              thumbnailUrl: urls ? urls.thumbnailUrl : ''
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Level Selection Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-slate-800">난이도 설정</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {levelMapping.map((grade) => (
                        <div
                          key={grade.id}
                          className={`
                                        relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md
                                        ${selectLevel === grade.level
                              ? 'border-indigo-600 bg-indigo-50/50'
                              : 'border-slate-100 bg-white hover:border-indigo-200'}
                                    `}
                          onClick={() => handleCheckboxChange(grade.level)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectLevel === grade.level}
                              onCheckedChange={() => handleCheckboxChange(grade.level)}
                              className="mt-1 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                            <div>
                              <Label className="text-base font-semibold text-slate-800 cursor-pointer">{grade.name}</Label>
                              <p className="text-xs text-slate-500 mt-1">{grade.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.level && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.level}</p>}
                  </div>

                  {/* Details Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-slate-800">상세 정보</h3>
                    </div>

                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-sm font-medium">강좌 개요</Label>
                        <Input
                          name="description"
                          value={course.description}
                          onChange={handleChange}
                          placeholder="수강생들에게 보여질 강좌 소개를 입력해주세요"
                          className="bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 py-6"
                        />
                        {errors.description && <p className="text-red-500 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.description}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-600 text-sm font-medium">수강료 (P)</Label>
                        <Input
                          name="price"
                          type="number"
                          value={course.price}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          className="bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 py-6 font-mono"
                        />
                        {errors.price && <p className="text-red-500 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.price}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/instructor/course')}
                    className="px-6 py-6 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    취소
                  </Button>

                  {/* 재신청 버튼 (REJECTED 상태일 때만 표시) */}
                  {course.proposalStatus === 'REJECTED' && (
                    <Button
                      onClick={handleResubmit}
                      className="px-8 py-6 bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5"
                    >
                      <span className="mr-2">재신청</span>
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    onClick={handleClick}
                    className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <span className="mr-2">수정 완료</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      <Tail />
    </div>
  );
}

export default InstructorCourseEdit;
