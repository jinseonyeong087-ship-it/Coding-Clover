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
  // 탭 필터링 로직 수정 (difficulty 필드 사용)
  const filteredProblems = problems.filter(p => {
    if (currentTab === "전체") return true;
    if (currentTab === "초급") return p.difficulty === "EASY";
    if (currentTab === "중급") return p.difficulty === "MEDIUM";
    if (currentTab === "고급") return p.difficulty === "HARD";
    return true;
  });

  // 페이지네이션 로직
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProblems.slice(indexOfFirstItem, indexOfLastItem);

  // 탭 변경 시 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [currentTab]);

  const tabs = ["전체", "초급", "중급", "고급"];

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <Nav />
      <main className="flex-grow container mx-auto px-6 pt-28 pb-16 max-w-[1200px]">
        <div className="flex flex-col md:flex-row justify-between items-end mb-2 gap-6">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent inline-block pb-1">Coding Test</h1>
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

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden mb-8">
          {loading ? (
            <div className="py-32 text-center text-gray-400 font-bold animate-pulse">LOADING...</div>
          ) : filteredProblems.length === 0 ? (
            <div className="py-32 text-center text-gray-400 font-bold">등록된 문제가 없습니다.</div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <th className="px-6 py-4 w-[15%] text-center">ID</th>
                    <th className="px-6 py-4 w-[50%] text-left">Problem Name</th>
                    <th className="px-6 py-4 w-[25%] text-center">Level</th>
                    <th className="px-6 py-4 w-[10%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentItems.map((problem) => (
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
                      <td className="px-6 py-5 text-right align-middle">
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-400 transition-all transform group-hover:translate-x-1" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredProblems.length > 0 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-bold text-gray-500 disabled:opacity-30 hover:text-indigo-600 transition-colors"
            >
              PREV
            </button>
            {Array.from({ length: Math.ceil(filteredProblems.length / itemsPerPage) }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`w-8 h-8 rounded-full text-sm font-bold transition-all ${currentPage === number
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "text-gray-400 hover:bg-gray-100"
                  }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProblems.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filteredProblems.length / itemsPerPage)}
              className="px-4 py-2 text-sm font-bold text-gray-500 disabled:opacity-30 hover:text-indigo-600 transition-colors"
            >
              NEXT
            </button>
          </div>
        )}
        <div className="h-10" />

      </main>
      <Tail />
    </div>
  );
};

export default CodingTestList;