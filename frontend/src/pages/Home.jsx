import React from 'react';
import StudentNav from '../components/StudentNav';
import Tail from '../components/Tail';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react"
import Enroll from './student/Enroll';

function Home() {
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
            <Button size="lg" variant="secondary">
              <BookOpen className="mr-2 h-5 w-5" />
              수강신청하기
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              <PlayCircle className="mr-2 h-5 w-5" />
              강좌 둘러보기
            </Button>
          </div>
        </div>
      </section>

      {/* 인기 강좌 섹션 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6">인기 강좌</h2>
        <Tabs defaultValue="1" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="1">초급</TabsTrigger>
            <TabsTrigger value="2">중급</TabsTrigger>
            <TabsTrigger value="3">고급</TabsTrigger>
          </TabsList>

          <TabsContent value="1">
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
                    자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="2">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">중급 강좌</CardTitle>
                  <CardDescription>중급 · 기본기 필요</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    중급 컴포넌트 넣기
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="3">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">고급 강좌</CardTitle>
                  <CardDescription>고급 · 실무 경험 권장</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    고급 컴포넌트
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6">수강 신청하기</h2>
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
                  <Button  variant="outline" size="sm" className="w-full">
                  <Link to="/enroll">
                    수강신청하기 <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
      </section>

      <Tail />
    </>
  );
}

export default Home;
