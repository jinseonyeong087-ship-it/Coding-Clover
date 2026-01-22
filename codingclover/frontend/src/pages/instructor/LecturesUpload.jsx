import React, { useState } from 'react';
import InstructorNav from '@/components/InstructorNav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import InstructorMain from './InstructorMain';

function Enroll() {
  const [course, setCourse ] = useState([
    { title: '' },
    { create_by: '' },
    { level: '' },
    { description: '' },
    { thumbnail_url: ''}
  ])

  const handleChange = (event) => {
    console.log('입력 값:', event.target.value);
    // setCourse(save);
  };

  const handleClick = () => {
    console.log('제출버튼누름');
    // setCourse(post save on DB & <InstructorMain/>);
  };

  // 서버 데이터 사용 시
  // const [course, setCourse] = useState([]);

  // useEffect(()=>{ fetch('/instructor/course/new').then(res=>res.json()).then(data => setCourse(data))})

  return (
    <>
      <InstructorNav />

      <section className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">강좌 개설</h1>

        <Card className="max-w-4xl mx-auto">
          <CardHeader></CardHeader>

          <CardContent className="space-y-2">
            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-right font-medium">강좌명</label>
              <Input type="text" onChange={handleChange} value={course.title} className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-right font-medium">강사명</label>
              <Input type="text" onChange={handleChange} value={course.create_by} className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-right font-medium">난이도</label>
              <Input type="text" onChange={handleChange} value={course.level} className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-right font-medium">강좌 개요</label>
              <Input type="text" onChange={handleChange} value={course.description} className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-right font-medium">썸네일</label>
              <Input type="file" onChange={handleChange} value={course.thumbnail_url} placeholder="이미지 URL" className="col-span-3" />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline">임시 저장</Button>
            <Button onClick={handleClick}>개설 신청</Button>
          </CardFooter>
        </Card>
      </section>

      <Tail />
    </>
  );
}

export default Enroll;
