import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { ArrowRight, Sparkles } from "lucide-react";

function Level() {

  const { level } = useParams();
  const navigate = useNavigate();

  const [tabs] = useState([
    { id: "0", tablabel: "전체보기" },
    { id: "1", tablabel: "초급" },
    { id: "2", tablabel: "중급" },
    { id: "3", tablabel: "고급" }
  ]);

  const [course, setCourse] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = level === "0" ? '/course' : `/course/level/${level}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [level]);

  // [level]의 배열이 바꼈을 때 = 초급에서 중급강좌로 이동했을 때
  // useEffect(리액트 훅)이 다시 목록을 불러옴
  // 훅이란 리액트에서 제공하는 (동적 변화)=(값이 바뀔 때) 고대로 바꿔줌

  const handleTabChange = (value) => {
    navigate(`/course/level/${value}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        <Nav />
        <div className="container mx-auto px-4 py-16 pt-32">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
        <Tail />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Decorations - Neutralized */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-gray-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-slate-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        <Nav />
        <div className='py-8' />
        <section className="container mx-auto px-4 py-16">
          <Tabs value={level} onValueChange={handleTabChange}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium mb-4">
                <Sparkles className="w-3 h-3" />
                <span>학습 로드맵</span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                수준별 강좌 찾기
              </h1>
              <p className="text-slate-600 max-w-2xl mx-auto mb-8">
                나의 코딩 실력에 딱 맞는 강좌를 선택해서 학습 효율을 극대화하세요.
              </p>

              <TabsList className="bg-white/50 backdrop-blur-sm border border-white/40 p-1 rounded-full shadow-sm inline-flex">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={String(tab.id)}
                    className="data-[state=active]:bg-[#4a6fa5] data-[state=active]:text-white rounded-full px-8 py-2.5 transition-all text-slate-600 hover:text-slate-900 data-[state=active]:shadow-md"
                  >
                    {tab.tablabel}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-8">
                {course.length === 0 ? (
                  <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/60">
                    <p className="text-slate-500">등록된 강좌가 없습니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {course.map((item) =>
                      <Card key={item.courseId} className="group border-0 shadow-lg bg-white ring-1 ring-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        <div className="p-6 h-full flex flex-col">
                          <CardHeader className="p-0 mb-4">
                            {/* 등급 배지 - DB에 등급명이 없으므로 프론트에서 설정 */}
                            <div className="mb-3">
                              {(() => {
                                const lvl = tab.id === '0' ? String(item.level) : tab.id;
                                const labels = { '1': '초급', '2': '중급', '3': '고급' };
                                const colors = {
                                  '1': 'bg-emerald-100 text-emerald-700',
                                  '2': 'bg-blue-100 text-blue-700',
                                  '3': 'bg-slate-100 text-slate-700'
                                };
                                return (
                                  <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${colors[lvl] || 'bg-slate-100 text-slate-700'}`}>
                                    {labels[lvl] || '기타'}
                                  </span>
                                );
                              })()}
                            </div>
                            <CardTitle className="text-lg font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 text-slate-500 text-sm">
                              {item.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-0 mb-6 flex-grow">
                            <div className="flex items-center text-sm text-slate-500/80">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500 mr-2">
                                {item.instructorName[0]}
                              </div>
                              <span className="font-medium text-slate-600">{item.instructorName}</span>
                            </div>
                          </CardContent>
                          <CardFooter className="p-0 pt-4 mt-auto border-t border-slate-100">
                            <Link to={`/course/${item.courseId}`} className="w-full">
                              <Button className="w-full bg-[#4a6fa5] hover:bg-blue-600 text-white transition-colors">
                                강좌 보러가기 <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          </CardFooter>
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </section>
        <Tail />
      </div>
    </div>
  )
}

export default Level;