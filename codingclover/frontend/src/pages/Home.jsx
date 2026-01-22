import React, { useState } from 'react';
import StudentNav from '../components/StudentNav';
import Tail from '../components/Tail';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";

function Home() {

  // const navigate = useNavigate();

  const [tabs] = useState([
    { id: 1, tablabel: "초급" },
    { id: 2, tablabel: "중급" },
    { id: 3, tablabel: "고급" }
  ]);

  const [course] = useState([
    { course_id: 1, title: "초급강좌", level: "1", description: "초보를위한어쩌구", created_at: "26.02.13" },
    { course_id: 2, title: "중급강좌", level: "2", description: "이거알면중타는감", created_at: "26.02.13" },
    { course_id: 3, title: "고급강좌", level: "3", description: "회사가서 써먹어라", created_at: "26.02.13" },
    { course_id: 4, title: "초급강좌", level: "1", description: "초보를위한어쩌구", created_at: "26.02.13" },
    { course_id: 5, title: "중급강좌", level: "2", description: "이거알면중타는감", created_at: "26.02.13" },
    { course_id: 6, title: "고급강좌", level: "3", description: "회사가서 써먹어라", created_at: "26.02.13" },
    { course_id: 7, title: "초급강좌", level: "1", description: "초보를위한어쩌구", created_at: "26.02.13" },
    { course_id: 8, title: "중급강좌", level: "2", description: "이거알면중타는감", created_at: "26.02.13" },
    { course_id: 9, title: "고급강좌", level: "3", description: "회사가서 써먹어라", created_at: "26.02.13" },
    { course_id: 10, title: "중급강좌", level: "2", description: "이거알면중타는감", created_at: "26.02.13" },
    { course_id: 11, title: "고급강좌", level: "3", description: "회사가서 써먹어라", created_at: "26.02.13" },
    { course_id: 12, title: "초급강좌", level: "1", description: "초보를위한어쩌구", created_at: "26.02.13" },
    { course_id: 13, title: "중급강좌", level: "2", description: "이거알면중타는감", created_at: "26.02.13" },
    { course_id: 14, title: "고급강좌", level: "3", description: "회사가서 써먹어라", created_at: "26.02.13" },
  ])

  // 서버 데이터 사용 시
  // const [course, setCourse] = useState([]);

  // useEffect(()=>{ fetch('/course').then(res=>res.json()).then(data => setCourse(data))})

  return (
    <>
      <StudentNav />

      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            코딩의 세계에 오신 것을 환영합니다
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            신규 가입 시 첫 강좌 무료!
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary" className="bg-white hover:bg-white hover:text-purple-600">
              <BookOpen className="mr-2 h-5 w-5" />
              수강신청하기
            </Button>
            <Button size="lg" variant="outline" className="border-white text-black hover:bg-white hover:text-purple-600">
              <PlayCircle className="mr-2 h-5 w-5" />
              강좌 둘러보기
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <Tabs defaultValue={1}>
          <div className='flex items-center gap-10'>
            <h2 className="text-2xl font-bold mb-6">강좌 목록</h2>
            <TabsList className="mb-6">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.tablabel}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <div className="grid coursesrid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {course.filter((item) => item.level === String(tab.id))
                  .map((item) =>
                    <Card key={item.course_id} className="hover:shadow-lg transition-shadow">
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
                  )
                }
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6">수강 신청하기</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">강좌명 불러오기</CardTitle>
              <CardDescription>고급 · 실무 경험 권장</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                고급 컴포넌트
              </p>
            </CardContent>
            <CardFooter>
              {/* <Button  variant="outline" size="sm" className="w-full"> */}
              <Link to="/enroll" className="w-full flex items-center justify-center">
                수강신청하기 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              {/* </Button> */}
            </CardFooter>
          </Card>
        </div>
      </section>

      <Tail />
    </>
  );
}

export default Home;
