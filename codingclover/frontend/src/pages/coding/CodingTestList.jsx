import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Plus, Users, ChevronRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const CodingTestList = () => {
  const navigate = useNavigate();
  const [userRole] = useState(() => {
    const user = JSON.parse(localStorage.getItem('users'));
    return user?.role || "STUDENT";
  });

  const [problems, setProblems] = useState([]);
  const [currentTab, setCurrentTab] = useState("전체");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/problems');
        console.log("실제 백엔드 수신 데이터:", response.data);
        setProblems(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  // 탭 필터링 로직 수정 (difficulty 필드 사용)
  // 탭 필터링 로직 수정 (difficulty 필드 사용)
  const filteredProblems = problems.filter(p => {
    if (currentTab === "전체") return true;
    if (currentTab === "초급") return p.difficulty === "EASY";
    if (currentTab === "중급") return p.difficulty === "MEDIUM";
    if (currentTab === "고급") return p.difficulty === "HARD";
    return true;
  });

  const tabs = ["전체", "초급", "중급", "고급"];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Nav />
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <main className="flex-grow container mx-auto px-6 pt-12 pb-16 max-w-7xl relative z-0">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-border/50 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-4">
              Coding Challenges
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              실전 같은 코딩 테스트 문제로 알고리즘 역량을 키워보세요. <br className="hidden md:block" />
              다양한 난이도의 문제를 풀며 성장할 수 있습니다.
            </p>
          </div>

          {userRole === "ADMIN" && (
            <Button
              onClick={() => navigate("/coding-test/new")}
              className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/25 transition-all text-base"
            >
              <Plus className="mr-2 h-5 w-5" /> 새 문제 등록
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`px-5 py-2.5 text-sm font-bold rounded-full transition-all duration-300 relative overflow-hidden group ${currentTab === tab
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <span className="relative z-10">{tab}</span>
              {currentTab !== tab && <div className="absolute inset-0 bg-muted opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          ))}
        </div>

        {/* Problem Grid */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <div className="text-muted-foreground font-medium animate-pulse">문제를 불러오는 중입니다...</div>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="py-32 text-center text-gray-400 font-bold">등록된 문제가 없습니다.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-6 py-4 w-[15%] text-center">ID</th>
                  <th className="px-6 py-4 w-[30%] text-left">Problem Name</th>
                  <th className="px-6 py-4 w-[25%] text-center">Level</th>
                  <th className="px-6 py-4 w-[20%] text-center">Pass Rate</th>
                  {userRole === "ADMIN" && <th className="px-6 py-4 w-[10%] text-center">Submitters</th>}
                  <th className="px-6 py-4 w-[5%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProblems.map((problem) => (
                  <tr
                    key={`problem-${problem.problemId}`}
                    onClick={() => navigate(`/coding-test/${problem.problemId}`)}
                    className="group cursor-pointer hover:bg-indigo-50/20 transition-all origin-center"
                  >
                    <td className="px-6 py-5 text-center font-mono text-xs font-bold text-indigo-400 align-middle">
                      #{String(problem.problemId).padStart(3, '0')}
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div className="text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {problem.title}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center align-middle">
                      <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${problem.difficulty === "EASY" ? "bg-emerald-50 text-emerald-600" :
                        problem.difficulty === "MEDIUM" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                        }`}>
                        {problem.difficulty === 'EASY' ? '초급' : problem.difficulty === 'MEDIUM' ? '중급' : '고급'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center align-middle">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-bold text-gray-400">{problem.passRate || 0}%</span>
                        <div className="w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full" style={{ width: `${problem.passRate || 0}%` }} />
                        </div>
                      </div>
                    </td>
                    {/* 제출 인원 표시 (어드민) */}
                    {userRole === "ADMIN" && (
                      <td className="px-6 py-8 text-center text-gray-500 font-bold text-xs">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-3 w-3" />
                          {problem.submissionCount || 0}명
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-5 text-right align-middle">
                      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-400 transition-all transform group-hover:translate-x-1" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <Tail />
    </div>
  );
};

export default CodingTestList;