import React, { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import InstructorMain from './InstructorMain'
import axios from 'axios';
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom";
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

function CourseCreateRequest() {
  const DRAFT_KEY = 'courseDraft';
  const [course, setCourse] = useState({ title: '', createdBy: '', level: 1, description: '', price: 0 });
  const [errors, setErrors] = useState({});
  const [selectLevel, setSelectLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const navigate = useNavigate();

  const levelMapping = [
    { id: 1, level: 1, name: "초급" },
    { id: 2, level: 2, name: "중급" },
    { id: 3, level: 3, name: "고급" }
  ]

  // 사용자 정보 로드
  useEffect(() => {
    const storedUser = localStorage.getItem('users');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const loginId = userData.loginId;
        
        // 강사 프로필에서 이름 가져오기
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
          // 사용자 이름 자동 설정
          setCourse(prev => ({ ...prev, createdBy: userData.name || loginId }));
          setLoading(false);
        })
        .catch((err) => {
          console.error('사용자 정보 조회 오류:', err);
          // 프로필 조회 실패 시 localStorage의 이름 사용
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
      }));
      setSelectLevel(parsed.selectLevel ?? null);
    }
    setShowDraftDialog(false);
  };

  // 임시저장 데이터 삭제 (새로 작성)
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
      selectLevel,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    alert('임시 저장되었습니다.');
  };

  // 요고는 유저가 입력한 걸 State에 저장해주는 고얌
  // 입력하면 에러메세지 없애줌
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
    console.log('제출버튼누름');
    // 유저 정보 가져오기
    const storedUser = localStorage.getItem('users');
    const userData = storedUser ? JSON.parse(storedUser) : null;
    const instructorId = userData ? (userData.userId || userData.id) : null;

    axios.post('/instructor/course/new', {
      title: course.title,
      level: selectLevel,
      description: course.description,
      price: Number(course.price),
    }, { withCredentials: true })
      .then((response) => {
        console.log('결과 : ', response.data);
        localStorage.removeItem(DRAFT_KEY);
        alert("개설 신청이 완료되었습니다.");
        navigate('/instructor/dashboard')
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const errorData = err.response.data;
          // 서버에서 문자열로 반환하면 global 에러로 처리
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
    <>
      {/* 임시저장 데이터 불러오기 확인 다이얼로그 */}
      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>임시 저장된 데이터가 있습니다</AlertDialogTitle>
            <AlertDialogDescription>
              이전에 작성하던 강좌 정보가 있습니다. 불러오시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardDraft}>새로 작성</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoadDraft}>불러오기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Nav />

      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader><h1 className="text-3xl font-bold mb-8">강좌 개설</h1></CardHeader>

          {loading ? (
            <CardContent className="text-center py-8">
              <p>사용자 정보를 불러오는 중...</p>
            </CardContent>
          ) : (
            <CardContent className="space-y-2">
              {errors.global && <p className="text-red-500 text-sm text-center mb-4">{errors.global}</p>}
              <div className="grid grid-cols-4 items-center gap-6">
                <label className="text-right font-medium">강좌명</label>
                <Input name="title" type="text" onChange={handleChange} value={course.title} className="col-span-3" method="post" />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-4 items-center gap-6">
                <label className="text-right font-medium">강사명</label>
                <div className="col-span-3">
                  <Input 
                    value={course.createdBy} 
                    readOnly 
                    className="bg-gray-50 cursor-not-allowed" 
                    placeholder="강사명이 자동으로 입력됩니다"
                  />
                </div>
              </div>

            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-right font-medium">난이도</label>
              <div className="flex justify-between gap-6">
                {levelMapping.map((grade) => {
                  return (
                    <div className="flex justify-between items-center" key={grade.id}>
                      <>
                        <Checkbox checked={selectLevel === grade.level} name={grade.id} onCheckedChange={() => handleCheckboxChange(grade.level)} />
                        <Label>{grade.name}</Label>
                      </>
                    </div>
                  )
                })}
              </div>
              {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
            </div>

            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-right font-medium">강좌 개요</label>
              <Input name="description" type="text" onChange={handleChange} value={course.description} className="col-span-3" method="post" />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-right font-medium">강좌 이용료</label>
              <Input name="price" type="text" onChange={handleChange} value={course.price} className="col-span-3" method="post" />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <CardFooter className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleTempSave}>임시 저장</Button>
              <Button onClick={handleClick} method="post">개설 신청</Button>
            </CardFooter>
          </CardContent>
          )}
        </Card>
      </section>

      <Tail />
    </>
  );
}

export default CourseCreateRequest;