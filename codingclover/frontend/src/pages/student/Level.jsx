import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentNav from '@/components/StudentNav';
import Tail from '@/components/Tail';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { ArrowRight } from "lucide-react";

function Level() {

  const { level } = useParams();
  const navigate = useNavigate();

  const [tabs] = useState([
    { id: "1", tablabel: "초급" },
    { id: "2", tablabel: "중급" },
    { id: "3", tablabel: "고급" }
  ]);

  const [course, setCourse] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/course/level/${level}`)
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

  return (
    <>
      <StudentNav />
      <section className="container mx-auto px-4 py-16">
        <Tabs value={level} onValueChange={handleTabChange}>{/*Number 함수 사용해서 여기에 뿌리는 거구먼*/}
          <div className='flex items-center gap-10'>
            <h2 className="text-2xl font-bold mb-6">강좌 목록</h2>
            <TabsList className="mb-6">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={String(tab.id)}>
                  {tab.tablabel}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {course.map((item) =>
                  <Card key={item.courseId} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{item.instructorName}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full">
                        <Link to={`/course/${item.courseId}`} className="w-full flex items-center justify-center">
                          자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )}
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