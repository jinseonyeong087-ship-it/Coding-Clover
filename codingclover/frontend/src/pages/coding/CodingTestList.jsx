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
  const filteredProblems = problems.filter(p => {
    if (currentTab === "전체") return true;
    if (currentTab === "초급") return p.difficulty === "EASY";
    if (currentTab === "중급") return p.difficulty === "NORMAL";
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
            <div className="flex flex-col items-center justify-center py-32 bg-background/40 rounded-[2.5rem] border border-dashed border-border/50">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                <BarChart3 className="h-8 w-8 opacity-50" />
              </div>
              <p className="text-xl font-bold text-muted-foreground">등록된 문제가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProblems.map((problem) => (
                <div
                  key={`problem-${problem.problemId}`}
                  onClick={() => navigate(`/coding-test/${problem.problemId}`)}
                  className="group relative bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 p-6 cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-purple-500/0 group-hover:from-primary/5 group-hover:to-purple-500/5 transition-all duration-500" />

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Top Row: Difficulty & ID */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${problem.difficulty === "EASY" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                          problem.difficulty === "NORMAL" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        }`}>
                        {problem.difficulty}
                      </span>
                      <span className="font-mono text-xs font-bold text-muted-foreground/50">
                        #{String(problem.problemId).padStart(3, '0')}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {problem.title}
                    </h3>

                    <div className="flex-grow" />

                    {/* Bottom Info: Pass Rate & Users */}
                    <div className="pt-6 mt-2 border-t border-border/30 flex items-end justify-between">
                      <div className="space-y-1.5 w-full pr-4">
                        <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                          <span>정답률</span>
                          <span className="text-foreground">{problem.passRate || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000"
                            style={{ width: `${problem.passRate || 0}%` }}
                          />
                        </div>
                      </div>

                      {userRole === "ADMIN" && (
                        <div className="flex flex-col items-end gap-0.5 min-w-[60px]">
                          <span className="text-[10px] text-muted-foreground font-medium uppercase">Submitted</span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {problem.submissionCount || 0}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Decorative Icon Background */}
                  <Code2 className="absolute -bottom-4 -right-4 w-32 h-32 text-primary/5 rotate-[-10deg] pointer-events-none group-hover:text-primary/10 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Tail />
    </div>
  );
};

export default CodingTestList;