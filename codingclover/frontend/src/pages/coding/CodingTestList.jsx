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
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <Nav />
      <main className="flex-grow container mx-auto px-6 pt-32 pb-16 max-w-[1200px]">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">
            Coding Test Management
          </h1>
          {userRole === "ADMIN" && (
            <Button onClick={() => navigate("/coding-test/new")} className="h-12 px-6 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all">
              <Plus className="mr-2 h-5 w-5" /> 새 문제 등록
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-8 border-b border-gray-100 pb-1">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setCurrentTab(tab)} className={`px-6 py-3 text-sm font-black transition-all relative ${currentTab === tab ? "text-indigo-600" : "text-gray-400 hover:text-gray-900"}`}>
              {tab}
              {currentTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="py-32 text-center text-gray-400 font-bold animate-pulse">LOADING...</div>
          ) : filteredProblems.length === 0 ? (
            <div className="py-32 text-center text-gray-400 font-bold">등록된 문제가 없습니다.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-10 py-5 w-[100px] text-center">ID</th>
                  <th className="px-6 py-5">Problem Name</th>
                  <th className="px-6 py-5 w-[150px] text-center">Level</th>
                  <th className="px-6 py-5 w-[180px] text-center">Pass Rate</th>
                  <th className="px-6 py-5 w-[80px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProblems.map((problem) => (
                  <tr
                    key={`problem-${problem.problemId}`}
                    onClick={() => navigate(`/coding-test/${problem.problemId}`)}
                    className="group cursor-pointer hover:bg-indigo-50/20 transition-all"
                  >
                    <td className="px-10 py-8 text-center font-mono text-xs font-bold text-indigo-400">
                      #{String(problem.problemId).padStart(3, '0')}
                    </td>
                    <td className="px-6 py-8">
                      <div className="text-lg font-black text-gray-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                        {problem.title}
                      </div>
                    </td>
                    <td className="px-6 py-8 text-center">
                      <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${problem.difficulty === "EASY" ? "bg-emerald-50 text-emerald-600" :
                          problem.difficulty === "NORMAL" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                        }`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-7 text-right">
                      <ChevronRight className="h-6 w-6 text-gray-200 group-hover:text-indigo-400" />
                    </td>
                    {/* 통과율 표시 영역 */}
                    <td className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-black text-indigo-600">{problem.passRate || 0}%</span>
                        <div className="w-24 bg-gray-100 h-1 rounded-full overflow-hidden">
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
                    <td className="px-6 py-8 text-right">
                      <ChevronRight className="h-6 w-6 text-gray-200 group-hover:text-indigo-300 transition-all transform group-hover:translate-x-1" />
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