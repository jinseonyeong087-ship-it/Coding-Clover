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

function LecturesUpload() {
  const [course, setCourse] = useState({title: '', level: 1, description: '', price: 0 });
  // const [course, setCourse] = useState([]);

  useEffect(() => { fetch('/instructor/course/new').then(res => res.json()).then(data => setCourse(data)) }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleClick = () => {
    console.log('제출버튼누름');
    axios.post('http://localhost:3333/instructor/course/new', {
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level
    })
      .then((response) => console.log('결과 : ', response.data))
      .catch((err) => { console.log('실패', err) });
  };

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
              <Input name="title" type="text" onChange={handleChange} value={course.title} className="col-span-3" method="post" />
            </div>

            {/* <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-right font-medium">강사명</label>
              <Input name={created_by} type="text" onChange={handleChange} value={course.create_by} className="col-span-3" method="post" />
            </div> */}

            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-right font-medium">난이도</label>
              <div className="flex justify-between gap-6">
                <div className="flex justify-between"><Checkbox id="terms-checkbox1" name="level" />
                  <Label htmlFor="terms-checkbox">초급</Label></div>
                <div className="flex justify-between"><Checkbox id="terms-checkbox2" name="level" />
                  <Label htmlFor="terms-checkbox">중급</Label></div>
                <div className="flex justify-between"><Checkbox id="terms-checkbox3" name="level" />
                  <Label htmlFor="terms-checkbox">고급</Label></div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-right font-medium">강좌 개요</label>
              <Input name="description" type="text" onChange={handleChange} value={course.description} className="col-span-3" method="post" />
            </div>

            <div className="grid grid-cols-4 items-center gap-6">
              <label className="text-right font-medium">강좌 이용료</label>
              <Input name="price" type="text" onChange={handleChange} value={course.price} className="col-span-3" method="post" />
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

export default LecturesUpload;