import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Search, Plus, BookOpen, Trash2, Edit, Trophy } from "lucide-react";

// shadcn/ui 컴포넌트가 설치되어 있다면 사용, 없다면 일반 버튼으로 대체 가능
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const CodingTestList = () => {
  const navigate = useNavigate();
  
  // 권한 상태 (실제 서비스에서는 localStorage나 Context에서 가져옴)
  const [userRole, setUserRole] = useState("ADMIN"); 
  const [searchTerm, setSearchTerm] = useState("");
  
  // 테스트용 가짜 데이터
  const [problems, setProblems] = useState([
    { id: 1, title: "자바 정수 더하기", level: "초급", passRate: 75, author: "관리자", solved: true },
    { id: 2, title: "배열 뒤집기", level: "초급", passRate: 42, author: "관리자", solved: false },
    { id: 3, title: "스택을 이용한 큐 구현", level: "중급", passRate: 18, author: "관리자", solved: false },
    { id: 4, title: "이진 탐색 트리 순회", level: "고급", passRate: 5, author: "관리자", solved: false },
  ]);

  // 강사 권한 접근 차단 로직
  useEffect(() => {
    if (userRole === "INSTRUCTOR") {
      alert("접근 권한이 없습니다.");
      navigate("/");
    }
  }, [userRole, navigate]);

  const handleDelete = (id) => {
    if (window.confirm("정말로 이 문제를 삭제하시겠습니까?")) {
      setProblems(problems.filter(p => p.id !== id));
      alert("삭제되었습니다.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Nav />
      
      <main className="flex-grow container mx-auto px-6 pt-32 pb-16 max-w-[1200px]">
        {/* 헤더 섹션: 타이틀 및 검색 */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-indigo-600">
              <Trophy className="h-6 w-6" />
              <span className="text-sm font-black uppercase tracking-widest">Coding Challenge</span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">코딩테스트 연습</h1>
            <p className="text-gray-500 font-medium">다양한 문제를 풀며 알고리즘 실력을 향상시켜 보세요.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="문제 제목으로 검색..." 
                className="pl-11 h-12 bg-white border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {userRole === "ADMIN" && (
              <Button onClick={() => navigate("/coding-test/new")} className="h-12 px-6 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
                <Plus className="mr-2 h-5 w-5" /> 문제 등록
              </Button>
            )}
          </div>
        </div>

        {/* 문제 목록 테이블 스타일 리스트 */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                  <th className="px-8 py-5 w-[80px] text-center">번호</th>
                  <th className="px-8 py-5">문제 정보</th>
                  <th className="px-8 py-5 w-[200px] text-center">통과율</th>
                  <th className="px-8 py-5 w-[180px] text-right">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {problems
                  .filter(p => p.title.includes(searchTerm))
                  .map((problem) => (
                  <tr key={problem.id} className="group hover:bg-indigo-50/20 transition-colors">
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-bold text-gray-400 group-hover:text-indigo-600 transition-colors">#{problem.id}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <Link to={`/coding-test/${problem.id}`} className="text-lg font-bold text-gray-800 hover:text-indigo-600 transition-colors">
                            {problem.title}
                          </Link>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            problem.level === "초급" ? "bg-green-100 text-green-700" : 
                            problem.level === "중급" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                          }`}>
                            {problem.level}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                          <span>작성자: {problem.author}</span>
                          {problem.solved && <span className="text-green-500 flex items-center gap-1 font-bold">● 완료</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2 max-w-[140px] mx-auto">
                        <div className="flex justify-between text-[10px] font-black uppercase">
                          <span className="text-gray-300">Success</span>
                          <span className="text-indigo-600">{problem.passRate}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${problem.passRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {userRole === "ADMIN" && (
                          <>
                            <button onClick={() => navigate(`/coding-test/edit/${problem.id}`)} className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(problem.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors mr-2">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <Button 
                          onClick={() => navigate(`/coding-test/${problem.id}`)}
                          className="px-5 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-black rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm active:scale-95"
                        >
                          <BookOpen className="mr-2 h-3.5 w-3.5" /> 도전하기
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 검색 결과가 없을 때 */}
          {problems.filter(p => p.title.includes(searchTerm)).length === 0 && (
            <div className="py-20 text-center space-y-3">
              <p className="text-gray-400 font-medium">검색 결과와 일치하는 문제가 없습니다.</p>
              <Button variant="link" onClick={() => setSearchTerm("")} className="text-indigo-600 font-bold">검색 초기화</Button>
            </div>
          )}
        </div>
      </main>

      <Tail />
    </div>
  );
}

export default CodingTestList;