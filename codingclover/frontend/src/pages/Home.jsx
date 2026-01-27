import React, { useEffect, useState } from 'react';
import StudentNav from '../components/StudentNav';
import Tail from '../components/Tail';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";

function Home() {

  // const navigate = useNavigate();

  const [course, setCourse] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tabs] = useState([
    { id: 1, tablabel: "초급" },
    { id: 2, tablabel: "중급" },
    { id: 3, tablabel: "고급" }
  ]);

  useEffect(() => {
    fetch('/course', {method:'GET', Headers:{ 'Content-Type': 'application/json' }})
      .then((res) => res.json())
      .then((json) => {
        setCourse(json);
        setLoading(false);
      }).catch((err)=>console.error(err))
    }, []);

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
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* 탭 활성화 중복방지 */}
                {course.filter((item) => item.level === tab.id)
                  .map((item) =>
                    <Card key={item.courseId} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{item.createdAt}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="w-full">
                          <Link to={`/course/${item.courseId}`} variant="outline" size="sm" className="w-full flex items-center justify-center">
                            자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
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
          {course.map((item) => (
            <Card key={item.courseId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>레벨 {item.level}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <Link to={`/course/${item.courseId}`} className="w-full flex items-center justify-center">
                    수강신청하기 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <Tail />
    </>
  );
}

export default Home;
