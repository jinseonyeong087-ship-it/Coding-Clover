import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Save, ArrowLeft, FileCode, LayoutList } from "lucide-react";
import Editor from "@monaco-editor/react";
import axios from 'axios';

// 코딩테스트 생성 페이지
const CodingTestCreate = () => {
  const navigate = useNavigate();

  // [권한 확인] 어드민만 접근 가능하도록 설정
  const [userRole] = useState(() => {
    const user = JSON.parse(localStorage.getItem('users'));
    return user?.role || "STUDENT";
  });

  useEffect(() => {
    if (userRole !== "ADMIN") {
      alert("관리자 권한이 필요합니다.");
      navigate("/coding-test");
    }
  }, [userRole, navigate]);

  const [problem, setProblem] = useState({
    title: "",
    level: "초급",
    description: "",
    // 기본 자바 템플릿 제공
    baseCode: "public class Solution {\n    public int solution(int a, int b) {\n        return 0;\n    }\n}"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProblem(prev => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (value) => {
    setProblem(prev => ({ ...prev, baseCode: value }));
  };

  // [연동] 서버로 새 문제 데이터 전송
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problem.title || !problem.description) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const levelMapping = {
        "초급": "EASY",
        "중급": "MEDIUM",
        "고급": "HARD"
      };

      // 백엔드 @RequestMapping("/api/problems")와 매핑되는 POST 요청
      await axios.post('/api/problems', {
        title: problem.title,
        difficulty: levelMapping[problem.level],
        description: problem.description,
        baseCode: problem.baseCode
      });

      alert("새로운 문제가 등록되었습니다.");
      navigate("/coding-test"); // 등록 후 목록으로 이동
    } catch (error) {
      console.error("문제 등록 실패:", error);
      alert("서버 오류로 문제 등록에 실패했습니다.");
    }
  };

  if (userRole !== "ADMIN") return null;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Nav />
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <main className="flex-grow container mx-auto px-6 pt-12 pb-16 max-w-7xl relative z-0">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 border-b border-border/50 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              New Problem
            </h1>
          </div>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
          >
            <Save className="h-5 w-5" />
            문제 저장하기
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Input Form (5/12) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-background/60 backdrop-blur-xl p-8 rounded-2xl border border-border/50 shadow-sm space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                  <LayoutList className="h-3 w-3" /> Problem Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="문제 제목을 입력하세요"
                  className="w-full text-lg font-bold bg-transparent border-b-2 border-border/50 focus:border-primary outline-none py-2 transition-colors text-foreground placeholder:text-muted-foreground/50"
                  value={problem.title}
                  onChange={handleChange}
                />
              </div>

              {/* Difficulty Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Difficulty</label>
                <div className="flex gap-2">
                  {["초급", "중급", "고급"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setProblem(prev => ({ ...prev, level: lvl }))}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${problem.level === lvl
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-background/50 border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                        }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Description</label>
                <textarea
                  name="description"
                  placeholder="문제를 설명해주세요 (제약 사항, 입출력 예시 등)"
                  className="w-full h-96 bg-background/50 border border-input p-4 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50"
                  value={problem.description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Right: Editor Form (7/12) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-[#1e1e1e] p-1 rounded-2xl border border-border/50 shadow-lg flex-grow flex flex-col overflow-hidden">
              <div className="px-5 py-3 border-b border-white/10 flex justify-between items-center text-gray-400 font-bold text-[10px] uppercase tracking-widest bg-white/5">
                <div className="flex items-center gap-2"><FileCode className="h-3 w-3" /> Base Code Template</div>
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded">Java</span>
              </div>
              <div className="flex-grow relative">
                <Editor
                  height="600px"
                  defaultLanguage="java"
                  theme="vs-dark"
                  value={problem.baseCode}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineHeight: 22,
                    padding: { top: 20 },
                    scrollBeyondLastLine: false,
                    fontFamily: "'JetBrains Mono', 'D2Coding', monospace",
                  }}
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium px-2 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/50" />
              학생들이 문제를 처음 열었을 때 보여질 기본 코드 구조를 작성해주세요.
            </p>
          </div>
        </div>
      </main>

      <Tail />
    </div>
  );
};

export default CodingTestCreate;