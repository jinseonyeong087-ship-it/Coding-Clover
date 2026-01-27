import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'
import StudentNav from '../../components/StudentNav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

function Enroll() {

  const { id } = useParams()

  const [course, setCourse] = useState([
    { title: '' },
    { createBy: '' },
    { level: '' },
    { description: '' },
  ])

  const [lecture, setLecture] = useState([
    { lectureId: '' },
    { courseId: '' },
    { title: '' },
    { orderNo: '' },
    { videoUrl: '' },
    { duration: '' },
  ])

  // 수강신청 시 필요한 데이터
  const [enroll, setEnroll] = useState([
    { enrollmentId: '' },
    { user: '' },
    { course: '' },
    { enrolledAt: '' },
    { status: '' },
    { initialLevel: '' },
    { currentLevel: '' },
  ])

  const [loading, setLoading] = useState(true);

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
      } else {
        const errorMessage = await response.text();
        alert(errorMessage);
      }
    } catch (error) {
      console.error('수강 신청 오류:', error);
    }
  }

  // res.json()이 아닌 res.text()를 사용
  // 성공 시: ResponseEntity.ok("수강 신청이 완료되었습니다.") → 문자열 반환
  // 실패 시: ResponseEntity.badRequest().body(e.getMessage()) → 에러 메시지 반환

  // 그래서 Promise가 뭔데
  // async = 해당 함수를 Promise를 반환하는 함수로 만든다
  // await = Promise가 처리될 때까지 기다린다
  // res = response, 서버가 돌려준 응답 객체, 프로미스 내장 객체일까?

  return (
    <>
      <StudentNav />

      <section className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">수강 신청</h1>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{course.title || '강좌명'}</CardTitle>
            <CardDescription>강사: {course.instructorName || '미정'}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium">강좌명</label>
              <Input value={course.title} className="col-span-3" readOnly />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium">강사명</label>
              <Input value={course.instructorName} className="col-span-3" readOnly />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium">난이도</label>
              <Input value={course.level} className="col-span-3" readOnly />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium">목차</label>
              <Input value={course.description} className="col-span-3" readOnly />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline">취소</Button>
            <Button onClick={handleSubmit}>수강 신청하기</Button>
          </CardFooter>
        </Card>
      </section>

      <Tail />
    </>
  );
}

export default Enroll;
