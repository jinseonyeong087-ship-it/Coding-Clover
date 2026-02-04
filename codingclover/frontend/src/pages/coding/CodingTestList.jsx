import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Search, Plus, Users, BarChart3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const CodingTestList = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('users'));
  const [userRole] = useState(user?.role || "STUDENT");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [problems, setProblems] = useState([
    { id: 1, title: "자바 정수 더하기", level: "초급", passRate: 75, totalSubmissions: 40, createdAt: "2026-02-01" },
    { id: 2, title: "배열 뒤집기", level: "초급", passRate: 42, totalSubmissions: 52, createdAt: "2026-02-02" },
    { id: 3, title: "스택을 이용한 큐 구현", level: "중급", passRate: 18, totalSubmissions: 105, createdAt: "2026-02-03" },
    { id: 4, title: "이진 탐색 트리 순회", level: "고급", passRate: 5, totalSubmissions: 24, createdAt: "2026-02-04" },
  ]);

  useEffect(() => {
  axios.get('/api/problems') // 백엔드의 ProblemController 주소
    .then(res => setProblems(res.data))
    .catch(err => console.error(err));
}, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Nav />
      
      <main className="flex-grow container mx-auto px-6 pt-20 pb-16 max-w-[1200px]">
        
        {/* 헤더 섹션 */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">코딩테스트 문항 관리</h1>
            <p className="text-gray-500 text-sm font-medium">문제를 클릭하여 상세 내용을 수정하거나 학생 기록을 확인하세요.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="문제 검색..." 
                className="pl-11 h-12 bg-white border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => navigate("/coding-test/new")} 
              className="h-12 px-6 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
              <Plus className="mr-2 h-5 w-5" /> 새 문제 등록
            </Button>
          </div>
        </div>

        {/* 테이블 리스트 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                <th className="px-8 py-5 w-[100px] text-center">ID</th>
                <th className="px-8 py-5">문제명</th>
                <th className="px-8 py-5 w-[200px] text-center">통과율</th>
                <th className="px-8 py-5 w-[150px] text-center">제출 인원</th>
                <th className="px-8 py-5 w-[60px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {problems
                .filter(p => p.title.includes(searchTerm))
                .map((problem) => (
                <tr 
                  key={problem.id} 
                  onClick={() => navigate(`/coding-test/${problem.id}`)}
                  className="group cursor-pointer hover:bg-indigo-50/30 transition-all"
                >
                  <td className="px-8 py-6 text-center font-mono text-xs text-gray-400">
                    {String(problem.id).padStart(3, '0')}
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {problem.title}
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          problem.level === "초급" ? "bg-green-100 text-green-700" : 
                          problem.level === "중급" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                        }`}>
                          {problem.level}
                        </span>
                        <span className="text-[10px] text-gray-300">등록: {problem.createdAt}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2 max-w-[140px] mx-auto">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span className="text-gray-300 tracking-tighter">Pass Rate</span>
                        <span className="text-indigo-600">{problem.passRate}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div 
                          className="bg-indigo-500 h-1 rounded-full" 
                          style={{ width: `${problem.passRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span>{problem.totalSubmissions}명</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <ChevronRight className="h-5 w-5 text-gray-200 group-hover:text-indigo-300 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {problems.filter(p => p.title.includes(searchTerm)).length === 0 && (
            <div className="py-24 text-center text-gray-400 font-bold">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </main>

      <Tail />
    </div>
  );
}

export default CodingTestList;