import React, { useState } from 'react';
import StudentNav from '@/components/StudentNav';
import Tail from '@/components/Tail';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";

function setGrade() {
  if (grade === 0) {
    return <div>초급 페이지 컴포</div>
  } else if (grade === 1) {
    return <div>중급 페이지 컴포</div>
  } else if (grade === 2) {
    return <div>고급 페이지 컴포</div>
  }
}

function Basic() {

  // let [grade, setGrade] = useState(0)



  return (
    <>
      <StudentNav />
      <section className="container mx-auto px-4 py-16">
        <Tabs>
          <div className='flex items-center gap-10'>
            <h2 className="text-2xl font-bold mb-6">초급</h2>

            <TabsList className="mb-6">
              <TabsTrigger value="1">초급</TabsTrigger>
              <TabsTrigger value="2">중급</TabsTrigger>
              <TabsTrigger value="3">고급</TabsTrigger>
            </TabsList>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* TODO: map함수로 서버에서 데이터 받아오기 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">강좌명 (서버-디비)</CardTitle>
                <CardDescription>초급 · 입문자 추천</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  강좌명 앞에 정의해주고 서버에서 디비받아오기
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <Link to="/student/courses/courseId/lectures" variant="outline" size="sm" className="w-full flex items-center justify-center">
                    자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  {/* 링크 수정 필요함 */}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Tabs >
      </section>
      <Tail />
    </>

  )
}

export default Basic;