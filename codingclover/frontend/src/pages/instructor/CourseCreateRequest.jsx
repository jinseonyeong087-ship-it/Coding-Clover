import React, { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BookOpen, CheckCircle2, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import ImageUpload from '@/components/common/ImageUpload';

function CourseCreateRequest() {
  const DRAFT_KEY = 'courseDraft';
  const [course, setCourse] = useState({ title: '', createdBy: '', level: 1, description: '', price: 0, thumbnailUrl: '' });
  const [errors, setErrors] = useState({});
  const [selectLevel, setSelectLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const navigate = useNavigate();

  const levelMapping = [
    { id: 1, level: 1, name: "초급", description: "입문자를 위한 기초 과정" },
    { id: 2, level: 2, name: "중급", description: "실무 활용 및 심화 과정" },
    { id: 3, level: 3, name: "고급", description: "전문가를 위한 마스터 과정" }
  ];

  // 사용자 정보 로드
  useEffect(() => {
    const storedUser = localStorage.getItem('users');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const loginId = userData.loginId;

        fetch('/api/instructor/mypage', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Login-Id': loginId
          },
          credentials: 'include'
        })
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error('프로필 조회 실패');
          })
          .then((data) => {
            setCourse(prev => ({ ...prev, createdBy: userData.name || loginId }));
            setLoading(false);
          })
          .catch((err) => {
            console.error('사용자 정보 조회 오류:', err);
            setCourse(prev => ({ ...prev, createdBy: userData.name || userData.loginId || '강사명 없음' }));
            setLoading(false);
          });
      } catch (error) {
        console.error('localStorage 파싱 오류:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // 페이지 진입 시 임시저장 데이터 존재 여부 확인
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      setShowDraftDialog(true);
    }
  }, []);

  // 임시저장 데이터 불러오기
  const handleLoadDraft = () => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      const parsed = JSON.parse(draft);
      setCourse(prev => ({
        ...prev,
        title: parsed.title || '',
        description: parsed.description || '',
        price: parsed.price || 0,
        thumbnailUrl: parsed.thumbnailUrl || '',
      }));
      setSelectLevel(parsed.selectLevel ?? null);
    }
    setShowDraftDialog(false);
  };

  // 임시저장 데이터 삭제
  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setShowDraftDialog(false);
  };

  // 임시저장
  const handleTempSave = () => {
    const draft = {
      title: course.title,
      description: course.description,
      price: course.price,
      thumbnailUrl: course.thumbnailUrl,
      selectLevel,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    alert('임시 저장되었습니다.');
  };

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

    axios.post('/instructor/course/new', {
      title: course.title,
      level: selectLevel,
      description: course.description,
      price: Number(course.price),
      thumbnailUrl: course.thumbnailUrl,
    }, { withCredentials: true })
      .then((response) => {
        localStorage.removeItem(DRAFT_KEY);
        alert("개설 신청이 완료되었습니다.");
        navigate('/instructor/dashboard')
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const errorData = err.response.data;
          if (typeof errorData === 'string') {
            setErrors({ global: errorData });
          } else {
            setErrors(errorData);
          }
        } else if (err.response?.status === 401) {
          alert("세션이 만료되었습니다.");
        } else {
          console.error('실패', err);
        }
      });
  };

  return (
    <div className="min-h-screen bg-white relative">
      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent className="bg-white border-border shadow-lg rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5 text-primary" />
              임시 저장된 데이터 발견
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              이전에 작성하던 강좌 정보가 있습니다. 불러오시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardDraft} className="border-gray-200 hover:bg-gray-50 rounded-none">새로 작성</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoadDraft} className="bg-primary hover:bg-primary/90 rounded-none">불러오기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Nav />

      <section className="relative container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              새로운 강좌 개설
            </h1>
            <p className="text-gray-500 text-lg">
              여러분의 지식을 공유하고 새로운 가치를 창출하세요.
            </p>
          </div>

          <Card className="border border-border shadow-none bg-white rounded-none">
            {loading ? (
              <CardContent className="flex flex-col items-center justify-center py-20 text-gray-500">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
                <p>사용자 정보를 불러오는 중...</p>
              </CardContent>
            ) : (
              <div className="p-8">
                {errors.global && (
                  <div className="mb-8 p-4 bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 rounded-none">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{errors.global}</p>
                  </div>
                )}

                <div className="space-y-8">
                  {/* Basic Info Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold text-gray-800">기본 정보</h3>
                    </div>

                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-700 text-sm font-bold">강좌명</Label>
                        <Input
                          name="title"
                          value={course.title}
                          onChange={handleChange}
                          placeholder="매력적인 강좌 제목을 입력해주세요"
                          className="bg-white border-gray-300 focus:border-primary focus:ring-0 rounded-none h-12"
                        />
                        {errors.title && <p className="text-red-500 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 text-sm font-bold">강사명</Label>
                        <Input
                          value={course.createdBy}
                          readOnly
                          className="bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed rounded-none h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 text-sm font-bold">썸네일 이미지</Label>
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
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold text-gray-800">난이도 설정</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {levelMapping.map((grade) => (
                        <div
                          key={grade.id}
                          className={`
                                        relative p-4 border transition-all cursor-pointer rounded-none
                                        ${selectLevel === grade.level
                              ? 'border-primary bg-blue-50/30'
                              : 'border-gray-200 bg-white hover:border-primary/50'}
                                    `}
                          onClick={() => handleCheckboxChange(grade.level)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectLevel === grade.level}
                              onCheckedChange={() => handleCheckboxChange(grade.level)}
                              className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-none"
                            />
                            <div>
                              <Label className="text-base font-bold text-gray-800 cursor-pointer">{grade.name}</Label>
                              <p className="text-xs text-gray-500 mt-1">{grade.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.level && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.level}</p>}
                  </div>

                  {/* Details Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold text-gray-800">상세 정보</h3>
                    </div>

                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-700 text-sm font-bold">강좌 개요</Label>
                        <Input
                          name="description"
                          value={course.description}
                          onChange={handleChange}
                          placeholder="수강생들에게 보여질 강좌 소개를 입력해주세요"
                          className="bg-white border-gray-300 focus:border-primary focus:ring-0 rounded-none h-12"
                        />
                        {errors.description && <p className="text-red-500 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.description}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 text-sm font-bold">수강료 (P)</Label>
                        <Input
                          name="price"
                          type="number"
                          value={course.price}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          className="bg-white border-gray-300 focus:border-primary focus:ring-0 rounded-none h-12 font-mono"
                        />
                        {errors.price && <p className="text-red-500 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.price}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={handleTempSave}
                    className="px-6 py-6 text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-primary transition-colors rounded-none"
                  >
                    임시 저장
                  </Button>
                  <Button
                    onClick={handleClick}
                    className="px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-none transition-all rounded-none"
                  >
                    <span className="mr-2">개설 신청하기</span>
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

export default CourseCreateRequest;