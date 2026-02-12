import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import ChatBot from '../student/ChatBot';
import { Plus, Search, Code2, Trophy, Clock, CheckCircle2, ChevronRight, BarChart3, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// ... (imports)
// Select component removed to fix import error and align with Notice page design


import { toast } from "sonner";

const CodingTestList = () => {
  const navigate = useNavigate();
  const [userRole] = useState(() => {
    const user = JSON.parse(localStorage.getItem('users'));
    return user?.role || "STUDENT";
  });

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, SOLVED, UNSOLVED (Mock logic for now)

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/problems');
        setProblems(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        toast.error("문제 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  // Filter Logic
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "ALL" || problem.difficulty === difficultyFilter;

    // Status Logic (Mock: assuming 'status' field exists or we derive it)
    // const matchesStatus = statusFilter === "ALL" 
    //   || (statusFilter === "SOLVED" && problem.status === "PASS")
    //   || (statusFilter === "UNSOLVED" && problem.status !== "PASS");

    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'EASY': return "text-emerald-500 bg-emerald-50 border-emerald-100";
      case 'MEDIUM': return "text-amber-500 bg-amber-50 border-amber-100";
      case 'HARD': return "text-rose-500 bg-rose-50 border-rose-100";
      default: return "text-gray-500 bg-gray-50 border-gray-100";
    }
  };

  const getDifficultyLabel = (level) => {
    switch (level) {
      case 'EASY': return "Lev.1 초급";
      case 'MEDIUM': return "Lev.2 중급";
      case 'HARD': return "Lev.3 고급";
      default: return "Lev.0";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Nav />
      <div className="h-16"></div>

      {/* Header Section (Notice Style) */}
      <div className="border-b border-gray-200 bg-gray-50/50">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-2">
              코딩 테스트
            </h1>
            <p className="text-lg text-gray-500">
              다양한 난이도의 알고리즘 문제를 해결하며 실력을 키워보세요.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Search & Filter Bar (Notice Style) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="문제 제목 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 rounded-none border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary w-full"
              />
            </div>

            <div className="flex gap-2">
              {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(level => (
                <Button
                  key={level}
                  variant={difficultyFilter === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficultyFilter(level)}
                  className={`rounded-none h-10 px-4 font-bold ${difficultyFilter === level ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                  {level === 'ALL' ? '전체' : getDifficultyLabel(level).split(' ')[1]}
                </Button>
              ))}
            </div>

            {userRole === "ADMIN" && (
              <Button
                onClick={() => navigate("/coding-test/new")}
                className="h-10 rounded-none bg-primary hover:bg-primary/90 text-white font-bold px-6"
              >
                <Plus className="mr-2 h-4 w-4" /> 새 문제 등록
              </Button>
            )}
          </div>

          {/* Filter Bar End */}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProblems.map((problem) => (
                <Card
                  key={problem.problemId}
                  className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-100 cursor-pointer overflow-hidden bg-white rounded-2xl"
                  onClick={() => navigate(`/coding-test/${problem.problemId}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={`rounded-md px-2.5 py-1 font-bold border ${getDifficultyColor(problem.difficulty)}`}>
                        {getDifficultyLabel(problem.difficulty)}
                      </Badge>
                      {/* {problem.status === 'PASS' && (
                      <Badge className="bg-emerald-500 text-white border-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> 성공
                      </Badge>
                    )} */}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                      {problem.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 text-sm text-gray-500">
                      {/* Description Preview - removing markdown symbols mostly */}
                      {problem.description?.replace(/[#*`]/g, '') || "설명이 없습니다."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mt-2">
                      <div className="flex items-center gap-1">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Java</span>
                      </div>

                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-6">
                    <Button className="w-full bg-gray-50 text-gray-900 hover:bg-black hover:text-white font-bold h-11 rounded-xl transition-all group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20 border border-gray-100 group-hover:border-transparent">
                      문제 풀기 <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

        </div>
      </main>

      <ChatBot className="fixed bottom-10 right-10 z-[9999]" />
      <Tail />
    </div>
  );
};

export default CodingTestList;