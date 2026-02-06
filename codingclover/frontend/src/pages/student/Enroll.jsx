import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'
import Nav from '@/components/Nav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

function Enroll() {

  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false); // 수강신청 완료 여부
  const [showPointModal, setShowPointModal] = useState(false); // 포인트 부족 모달

  const [course, setCourse] = useState({
    title: '',
    instructorName: '',
    level: '',
    description: '',
    price: 0
  })

  useEffect(() => {
    fetch(`/course/${id}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      .then((res) => res.json())
      .then((json) => {
        setCourse(json);
        setLoading(false);
      }).catch((error) => console.error(error))
  }, [id]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/student/enrollment/${id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const message = await response.text();
        alert(message);
        setIsEnrolled(true); // 수강신청 성공
      } else {
        const errorMessage = await response.text();
        console.log('에러 메시지:', errorMessage);

        // 포인트 부족 에러인지 확인
        if (errorMessage.includes('포인트가 부족') || errorMessage.includes('포인트') ||
          errorMessage.includes('잔액') || errorMessage.includes('부족')) {
          setShowPointModal(true);
        } else {
          alert(errorMessage);
        }
      }
    } catch (error) {
      console.error('수강 신청 오류:', error);
      alert('수강 신청 중 오류가 발생했습니다.');
    }
  }

  // res.json()이 아닌 res.text()를 사용
  // 성공 시: ResponseEntity.ok("수강 신청이 완료되었습니다.") → 문자열 반환
  // 실패 시: ResponseEntity.badRequest().body(e.getMessage()) → 에러 메시지 반환

  // 그래서 Promise가 뭔데
  // async = 해당 함수를 Promise를 반환하는 함수로 만든다
  // await = Promise가 처리될 때까지 기다린다
  // res = response, 서버가 돌려준 응답 객체, 프로미스 내장 객체일까?

  const getLevelText = (level) => {
    switch (level) {
      case 1: return "초급";
      case 2: return "중급";
      case 3: return "고급";
      default: return level;
    }
  };

  return (
    <>
      <Nav />
      {/* Background Decoration */}
      <div className="fixed inset-0 z-[-1] bg-background">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="min-h-screen pt-24 pb-20 container mx-auto px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-4">
              수강 신청 확인
            </h1>
            <p className="text-muted-foreground">
              선택하신 강좌의 상세 내용을 확인하고 수강 신청을 완료해주세요.
            </p>
          </div>

          <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden relative group">
            {/* Decorative Top Border */}
            <div className="h-2 w-full bg-gradient-to-r from-primary to-purple-600" />

            <CardHeader className="p-8 border-b border-border/50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold mb-2">{course.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{course.instructorName}</span> 강사님
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs px-3 py-1">{getLevelText(course.level)}</Badge>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">강좌명</span>
                  <span className="font-bold text-right">{course.title}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">난이도</span>
                  <span className="font-bold text-right">{getLevelText(course.level)}</span>
                </div>
                <div className="py-2">
                  <span className="text-muted-foreground font-medium block mb-2">강좌 소개</span>
                  <p className="text-sm text-foreground/80 leading-relaxed bg-muted/30 p-4 rounded-lg">
                    {course.description || "강좌 설명이 없습니다."}
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-xl flex items-center justify-between mt-6">
                <span className="font-bold text-lg">결제 금액</span>
                <span className="text-3xl font-extrabold text-primary">{course.price?.toLocaleString()}원</span>
              </div>
            </CardContent>

            <CardFooter className="p-8 bg-muted/20 border-t border-border/50 flex flex-col md:flex-row gap-4 justify-between items-center">
              <Button variant="ghost" onClick={() => navigate(-1)} className="w-full md:w-auto hover:bg-muted/50">
                취소하기
              </Button>
              {!isEnrolled ? (
                <Button onClick={handleSubmit} size="lg" className="w-full md:w-auto font-bold shadow-lg hover:shadow-primary/25 min-w-[200px]">
                  수강 신청하기
                </Button>
              ) : (
                <Button variant="outline" className="w-full md:w-auto cursor-default border-green-500 text-green-500 hover:text-green-500 hover:bg-green-50" disabled>
                  신청 완료됨
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* 포인트 부족 모달 */}
      <AlertDialog open={showPointModal} onOpenChange={setShowPointModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">포인트 부족</AlertDialogTitle>
            <AlertDialogDescription>
              보유 포인트가 부족하여 수강 신청을 진행할 수 없습니다.
              <br />
              포인트 충전 페이지로 이동하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/payment')} className="bg-primary text-primary-foreground">
              충전하러 가기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tail />
    </>
  );
}

export default Enroll;
