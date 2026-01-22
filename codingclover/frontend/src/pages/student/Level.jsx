import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentNav from '@/components/StudentNav';
import Tail from '@/components/Tail';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";

function Level() {

  const { level } = useParams();

  const navigate = useNavigate();

  const [tabs] = useState([
    { id: "1", tablabel: "초급" },
    { id: "2", tablabel: "중급" },
    { id: "3", tablabel: "고급" }
  ]);

  const [course, setCourse] = useState([
    { course_id: 1, title: "초급강좌", level: "1", description: "초보를위한어쩌구", created_at: "26.02.13" },
    { course_id: 2, title: "중급강좌", level: "2", description: "이거알면중타는감", created_at: "26.02.13" },
    { course_id: 3, title: "고급강좌", level: "3", description: "회사가서 써먹어라", created_at: "26.02.13" },
    { course_id: 4, title: "초급강좌", level: "1", description: "초보를위한어쩌구", created_at: "26.02.13" },
    { course_id: 5, title: "중급강좌", level: "2", description: "이거알면중타는감", created_at: "26.02.13" },
    { course_id: 6, title: "고급강좌", level: "3", description: "회사가서 써먹어라", created_at: "26.02.13" },
    { course_id: 7, title: "초급강좌", level: "1", description: "초보를위한어쩌구", created_at: "26.02.13" },
    { course_id: 8, title: "중급강좌", level: "2", description: "이거알면중타는감", created_at: "26.02.13" },
    { course_id: 9, title: "고급강좌", level: "3", description: "회사가서 써먹어라", created_at: "26.02.13" },
    { course_id: 5, title: "중급강좌", level: "2", description: "이거알면중타는감", created_at: "26.02.13" },
    { course_id: 6, title: "고급강좌", level: "3", description: "회사가서 써먹어라", created_at: "26.02.13" },
    { course_id: 7, title: "초급강좌", level: "1", description: "초보를위한어쩌구", created_at: "26.02.13" },
    { course_id: 8, title: "중급강좌", level: "2", description: "이거알면중타는감", created_at: "26.02.13" },
    { course_id: 9, title: "고급강좌", level: "3", description: "회사가서 써먹어라", created_at: "26.02.13" },
  ])

  const handleTabChange = (value) => {
    navigate(`/course/level/${value}`);  // 탭 클릭 시 URL 변경
  };



  // 서버 데이터 사용 시
  // const [course, setCourse] = useState([]);

  // useEffect(()=>{ fetch('/course').then(res=>res.json()).then(data => setCourse(data))})

  return (
    <>
      <StudentNav />
      <section className="container mx-auto px-4 py-16">
        <Tabs defaultValue={level} onValueChange={handleTabChange}>{/*Number 함수 사용해서 여기에 뿌리는 거구먼*/}
          <div className='flex items-center gap-10'>
            <h2 className="text-2xl font-bold mb-6">강좌 목록</h2>
            <TabsList className="mb-6">
              {tabs.map((tab) => (
                <TabsTrigger value={String(tab.id)}>
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
      <Tail />
    </>

  )
}

export default Level;