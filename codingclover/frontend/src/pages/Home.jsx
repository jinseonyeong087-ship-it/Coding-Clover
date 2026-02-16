import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import Nav from '@/components/Nav';
import Tail from '../components/Tail';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Code2, Terminal, Cpu, ChevronLeft, ChevronRight } from "lucide-react";
import codingCommunityAnim from '@/assets/lottie/book.json';
import codeEditorAnim from '@/assets/lottie/robot.json';
import growthPathAnim from '@/assets/lottie/working.json';

const heroSlides = [
  {
    title: <>Developers <br />Grow Together.</>,
    description: <>기초부터 실전까지, 개발자를 위한 모든 커리큘럼.<br /><span className="font-semibold text-primary">Coding-Clover</span>에서 당신의 코드를 실행하세요.</>,
    animation: codingCommunityAnim,
  },
  {
    title: <>Code, Learn,<br />Repeat.</>,
    description: <>실습 중심의 코딩 강좌로 빠르게 성장하세요.<br />직접 코드를 작성하고 <span className="font-semibold text-primary">실시간 피드백</span>을 받아보세요.</>,
    animation: growthPathAnim,
  },
  {
    title: <>Your Path to<br />Better Code.</>,
    description: <>초급부터 고급까지, 단계별 맞춤 커리큘럼.<br /><span className="font-semibold text-primary">AI 기반 학습</span>으로 효율적인 성장을 경험하세요.</>,
    animation: codeEditorAnim,
  },
];

function Home() {
  const [course, setCourse] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [, setLoading] = useState(true);
  const [isStudent, setIsStudent] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const tabs = [
    { id: 1, tablabel: "초급", desc: "코딩이 처음이신가요?" },
    { id: 2, tablabel: "중급", desc: "기초를 넘어 실무로" },
    { id: 3, tablabel: "고급", desc: "전문가로 거듭나기" }
  ];

  const getLevelBadge = (level) => {
    switch (level) {
      case 1: return <span className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200 uppercase tracking-wide">Level 1 · Beginner</span>;
      case 2: return <span className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-bold bg-blue-50 text-blue-800 border border-blue-100 uppercase tracking-wide">Level 2 · Intermediate</span>;
      case 3: return <span className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-bold bg-gray-50 text-gray-800 border border-gray-100 uppercase tracking-wide">Level 3 · Advanced</span>;
      default: return null;
    }
  };

  const checkUserRole = () => {
    try {
      const storedUsers = localStorage.getItem("users");
      if (!storedUsers) return false;
      const userData = JSON.parse(storedUsers);
      return userData.role === 'STUDENT';
    } catch {
      return false;
    }
  };

  const fetchRecommendedCourses = async () => {
    if (!isStudent) return;
    try {
      const response = await fetch('/api/student/recommended-courses', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendedCourses(data.slice(0, 4));
      }
    } catch (error) {
      console.error('추천 강좌 조회 실패:', error);
    }
  };

  useEffect(() => {
    const isStudentUser = checkUserRole();
    setIsStudent(isStudentUser);

    fetch('/course', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      .then((res) => res.json())
      .then((json) => {
        setCourse(json);
        setLoading(false);
      }).catch((err) => console.error(err));

    if (isStudentUser) {
      fetchRecommendedCourses();
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-primary/10 selection:text-primary">
      <Nav />

      {/* Hero Slider */}
      <section className="border-b border-gray-200 relative overflow-hidden">
        <div className="container mx-auto px-6 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div className="flex flex-col justify-between h-[320px] lg:h-[360px]">
              <div className="relative flex-1">
                {heroSlides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      index === currentSlide
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
                  >
                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                      {slide.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Slide Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                  className="p-2 border border-gray-300 hover:border-gray-900 text-gray-500 hover:text-gray-900 transition-colors"
                  aria-label="이전 슬라이드"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  {heroSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`슬라이드 ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                  className="p-2 border border-gray-300 hover:border-gray-900 text-gray-500 hover:text-gray-900 transition-colors"
                  aria-label="다음 슬라이드"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right - Lottie Animation */}
            <div className="hidden lg:flex items-center justify-center h-[360px] relative">
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
                    index === currentSlide
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  <Lottie
                    animationData={slide.animation}
                    loop
                    className="w-full max-w-md h-auto"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-20">

        {/* Recommended Section (Conditional) */}
        {isStudent && recommendedCourses.length > 0 && (
          <div className="mb-24">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">Recommended For You</h2>
                <p className="text-gray-500 mt-1">회원님의 실력 향상을 위한 맞춤 강좌입니다.</p>
              </div>
              <Link to="/student/mypage" className="text-sm font-semibold text-gray-500 hover:text-primary flex items-center gap-1 transition-colors">
                설정 변경 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedCourses.map((item) => (
                <Link to={`/course/${item.courseId}`} key={item.courseId} className="group block h-full">
                  <div className="h-full bg-white border border-gray-200 hover:border-primary transition-colors flex flex-col rounded-none">
                    <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Code2 className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-0 right-0 p-3">
                        {getLevelBadge(item.level)}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{item.description}</p>
                      <div className="text-xs font-medium text-gray-400 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span>{item.createdBy?.name || 'Instructor'}</span>
                        <span className="text-primary group-hover:underline">Start &rarr;</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tabbed Course Section */}
        <div className="min-h-[600px]">
          <Tabs defaultValue={1} className="w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-200 gap-6">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">Curriculum</h2>
                <p className="text-gray-500 mt-2 text-lg">당신의 수준에 맞는 최적의 로드맵을 선택하세요.</p>
              </div>
              <TabsList className="bg-transparent h-auto p-0 gap-6">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none text-lg font-medium text-gray-400 hover:text-gray-600 transition-colors bg-transparent data-[state=active]:bg-transparent"
                  >
                    {tab.tablabel}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                  {course.filter((item) => item.level === tab.id).length > 0 ? (
                    course.filter((item) => item.level === tab.id).map((item) => (
                      <Link to={`/course/${item.courseId}`} key={item.courseId} className="group flex flex-col h-full bg-white hover:-translate-y-1 transition-transform duration-200">
                        {/* Technical Card Style */}
                        <div className="border border-gray-200 group-hover:border-primary/50 transition-colors h-full flex flex-col">
                          <div className="aspect-[1.8/1] bg-gray-50 relative overflow-hidden border-b border-gray-100">
                            {item.thumbnailUrl ? (
                              <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Cpu className="w-10 h-10 text-gray-300" />
                              </div>
                            )}
                          </div>

                          <div className="p-6 flex flex-1 flex-col">
                            <div className="mb-3">
                              {getLevelBadge(item.level)}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1 leading-relaxed">
                              {item.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {item.instructorName || 'Unknown'}
                              </span>
                              <span className="text-sm font-bold text-gray-900 group-hover:text-primary flex items-center gap-1 transition-colors">
                                강의 보기 <ArrowRight className="w-4 h-4" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full py-32 text-center bg-gray-50 border border-dashed border-gray-200">
                      <div className="flex flex-col items-center">
                        <Terminal className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">등록된 강좌가 없습니다</h3>
                        <p className="text-gray-500 text-sm mt-1">새로운 강좌가 곧 업데이트될 예정입니다.</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      <Tail />
    </div>
  );
}

export default Home;
