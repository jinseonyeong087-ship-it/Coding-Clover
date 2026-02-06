import React, { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import Tail from '../components/Tail';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";
import ChatBot from './student/ChatBot';

function Home() {

  const navigate = useNavigate();

  const [course, setCourse] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tabs] = useState([
    { id: 1, tablabel: "초급" },
    { id: 2, tablabel: "중급" },
    { id: 3, tablabel: "고급" }
  ]);

  const setNum = (level) => {
    switch (level) {
      case 1: return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">초급</span>;
      case 2: return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">중급</span>;;
      case 3: return <span className="px-2 py-1 text-xs bg-orange-100 text-red-800 rounded">고급</span>;
    }
  }

  useEffect(() => {
    fetch('/course', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      .then((res) => res.json())
      .then((json) => {
        setCourse(json);
        setLoading(false);
      }).catch((err) => console.error(err))
  }, []);

  return (
    <>
      <Nav />
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden pt-32 pb-40">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10 animate-float" />
        <div className="absolute top-40 left-10 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] -z-10 animate-float" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New Generation Learning Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-5 duration-700">
            코딩의 미래를 <br className="hidden md:block" />
            <span className="text-primary bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">지금 시작하세요</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            최고의 강사진과 함께하는 체계적인 커리큘럼. <br />
            당신의 커리어를 위한 가장 확실한 선택, Coding-Clover입니다.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-200">
            <Button size="lg" className="h-12 px-8 text-lg shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all" variant="default">
              <BookOpen className="mr-2 h-5 w-5" />
              수강신청하기
            </Button>
            <Button onClick={() => navigate('/course/level/1')} size="lg" variant="outline" className="h-12 px-8 text-lg border-primary/20 hover:bg-primary/5 hover:-translate-y-0.5 transition-all">
              <PlayCircle className="mr-2 h-5 w-5" />
              강좌 둘러보기
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section (New) */}
      <section className="border-y border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-foreground">100+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Active Courses</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-foreground">50+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Expert Instructors</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-foreground">10k+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Students</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-foreground">4.9</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">인기 강좌</h2>
            <p className="text-muted-foreground">여러분의 실력을 향상시켜줄 최고의 강의들을 만나보세요.</p>
          </div>
          <Tabs defaultValue={1} className="w-full md:w-auto">
            <TabsList className="grid w-full md:w-[400px] grid-cols-3">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.tablabel}
                </TabsTrigger>
              ))}
            </TabsList>
            {/* TabsContent need to be outside layout if we want them to switch cleanly, but originally they wrap the grid. keeping structure but styling better. */}
          </Tabs>
        </div>

        <Tabs defaultValue={1} value={undefined}>
          {/* Note: In original code, Tabs wrap the whole section, but here I split the header. 
              Ideally we should lift state or re-structure. 
              To avoid logic change, I will revert to wrapping Tabs but use better styles. 
          */}
        </Tabs>

        {/* Re-implementing correctly to match original logic but better style */}
        <Tabs defaultValue={1} className="w-full">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">분야별 강좌</h2>
              <p className="text-muted-foreground">나에게 딱 맞는 난이도의 강의를 찾아보세요.</p>
            </div>
            <TabsList className="h-11 p-1 bg-secondary/50 backdrop-blur-sm">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="h-9 px-6 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {tab.tablabel}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {course.filter((item) => item.level === tab.id).length > 0 ? (
                  course.filter((item) => item.level === tab.id)
                    .map((item) => (
                      <Card key={item.courseId} className="group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm hover:-translate-y-1">
                        <div className="aspect-video w-full bg-muted/50 relative overflow-hidden rounded-t-xl group-hover:bg-muted/80 transition-colors">
                          {/* Placeholder for course image */}
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                            <BookOpen size={48} />
                          </div>
                          <div className="absolute top-3 left-3">
                            {setNum(item.level)}
                          </div>
                        </div>
                        <CardHeader className="p-5">
                          <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">{item.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {item.instructorName.charAt(0)}
                            </div>
                            {item.instructorName}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2 h-10">{item.description}</p>
                        </CardContent>
                        <CardFooter className="p-5 pt-0">
                          <Link to={`/course/${item.courseId}`} className="w-full">
                            <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                              자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))
                ) : (
                  <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
                    <p>등록된 강좌가 없습니다.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
      <section className="container mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">전체 강좌 둘러보기</h2>
          <Button variant="ghost" className="text-primary hover:bg-primary/5">
            전체보기 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {course.map((item) => (
            <Card key={item.courseId} className="group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start mb-2">
                  {setNum(item.level)}
                </div>
                <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">{item.title}</CardTitle>
                <CardDescription className="text-xs">{item.instructorName}님의 강좌</CardDescription>
              </CardHeader>
              <CardContent className="p-5 py-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              </CardContent>
              <CardFooter className="p-5 pt-4">
                <Link to={`/course/${item.courseId}`} className="w-full">
                  <Button variant="secondary" className="w-full bg-secondary/80 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    수강신청하기 <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>))}
        </div>
      </section>

      <ChatBot className="fixed bottom-8 right-8" />
      <Tail />
    </>
  );
}

export default Home;
