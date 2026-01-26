import React, { useState, useEffect } from 'react';
import InstructorNav from '@/components/InstructorNav';
import Tail from '@/components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import InstructorMain from './InstructorMain'
import axios from 'axios';
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

function InstructorCourseCreate() {
  const [course, setCourse] = useState({ title: '', level: 1, description: '', price: 0 });
  const [errors, setErrors] = useState({});
  const [selectLevel, setSelectLevel] = useState(null);

  const levelMapping = [
    { id: 1, level: 1, name: "초급" },
    { id: 2, level: 2, name: "중급" },
    { id: 3, level: 3, name: "고급" }
  ]

  

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
        alert("개설 신청이 완료되었습니다.")
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
      <InstructorNav />

      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">

          <CardHeader><h1 className="text-3xl font-bold mb-8">강좌 개설</h1></CardHeader>

          <CardContent className="space-y-2">
            {errors.global && <p className="text-red-500 text-sm text-center mb-4">{errors.global}</p>}
            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-right font-medium">강좌명</label>
              <Input name="title" type="text" onChange={handleChange} value={course.title} className="col-span-3" method="post" />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-right font-medium">강사명</label>
              <Input name={created_by} type="text" onChange={handleChange} value={course.create_by} className="col-span-3" method="post" />
            </div> */}

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
              <Button variant="outline">임시 저장</Button>
              <Button onClick={handleClick} method="post">개설 신청</Button>
            </CardFooter>
          </CardContent>
        </Card>
      </section>

      <Tail />
    </>
  );
}

export default InstructorCourseCreate;