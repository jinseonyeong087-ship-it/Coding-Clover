import React, { useState, useEffect, useParams } from 'react';
import StudentNav from '@/components/StudentNav';
import Tail from '@/components/Tail';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";

function Level() {

  const [course, setCourse] = useState([
    { id: 1, title:"초급강좌", label:"초급", description: "초보를위한어쩌구", created_at:"26.02.13" }, 
    { id: 2, title:"중급강좌", label:"중급", description: "이거알면중타는감", created_at:"26.02.13" }, 
    { id: 3, title:"고급강좌", label:"고급", description: "회사가서 써먹어라", created_at:"26.02.13" }
  ])

  

  // 서버 데이터 사용 시
  // const [course, setCourse] = useState([]);

  // useEffect(()=>{ fetch('/course').then(res=>res.json()).then(data => setCourse(data))})

  return (
    <>
      <StudentNav />
      <section className="container mx-auto px-4 py-16">
        <Tabs defaultValue={0}>
          <div className='flex items-center gap-10'>
            <h2 className="text-2xl font-bold mb-6">강좌 목록</h2>
            {course.map((item)=>(
                <TabsList className="mb-6">
                    <TabsTrigger key={item.id} value={item.id}>
                      {item.label}
                    </TabsTrigger>
                </TabsList>
            ))}
          </div>
          {course.map((item)=>{
            return(
              <TabsContent key={item.id} value={item.id}>
                <div className="grid coursesrid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{item.created_at}</p>
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
              </TabsContent>
            )
          })}
              
        </Tabs >
      </section>
      <Tail />
    </>

  )
}

export default Level;