import React from 'react';
import StudentNav from '../../components/StudentNav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

function Enroll() {
  let course = {
    title: 'React 기초 강좌',
    create_by: '홍길동',
    level: '초급',
    description: '리액트의 기초부터 배우는 강좌입니다.',
    thumbnail_url: ''
  }

  return (
    <>
      <StudentNav />

      <section className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">수강 신청</h1>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{course.title || '강좌명'}</CardTitle>
            <CardDescription>강사: {course.create_by || '미정'}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium">강좌명</label>
              <Input value={course.title} className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium">강사명</label>
              <Input value={course.create_by} className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium">난이도</label>
              <Input value={course.level} className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium">목차</label>
              <Input value={course.description} className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium">썸네일</label>
              <Input value={course.thumbnail_url} placeholder="이미지 URL" className="col-span-3" />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline">임시 저장</Button>
            <Button>개설 신청</Button>
          </CardFooter>
        </Card>
      </section>

      <Tail />
    </>
  );
}

export default Enroll;
