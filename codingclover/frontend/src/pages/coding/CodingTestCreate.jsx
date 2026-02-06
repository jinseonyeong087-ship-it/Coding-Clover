import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import { Save, ArrowLeft, Code2, Terminal, Sparkles, BookOpen, Play } from "lucide-react";
import Editor from "@monaco-editor/react";
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { Toaster, toast } from 'sonner';

// 코딩테스트 생성 페이지 (Admin)
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
    expectedOutput: "",
    // 기본 자바 템플릿 (Simple Version)
    baseCode: `public class main {
    // 여기에 코드를 입력하세요.
}`
  });

  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProblem(prev => ({ ...prev, [name]: value }));
  };

  // 에디터 핸들러
  const handleEditorChange = (value) => {
    setProblem(prev => ({ ...prev, baseCode: value }));
  };

  // 코드 실행 (검증용)
  const handleRun = async () => {
    setIsRunning(true);
    setOutput("실행 중...");
    try {
      const res = await axios.post(`/api/problems/0/run`, { code: problem.baseCode });
      if (res.data.error) {
        setOutput(`에러 발생:\n${res.data.error}`);
      } else {
        setOutput(res.data.output || "출력값이 없습니다.");
      }
    } catch (e) {
      setOutput(`실행 실패: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // 문제 저장
  const handleSubmit = async () => {
    if (!problem.title || !problem.description) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const levelMapping = { "초급": "EASY", "중급": "MEDIUM", "고급": "HARD" };

      await axios.post('/api/problems', {
        title: problem.title,
        difficulty: levelMapping[problem.level],
        description: problem.description,
        baseCode: problem.baseCode,
        expectedOutput: problem.expectedOutput
      });

      toast.success("문제가 등록되었습니다.");
      setTimeout(() => navigate("/coding-test"), 1000);
    } catch (error) {
      console.error("문제 등록 실패:", error);
      toast.error("문제 등록 실패");
    }
  };

  if (userRole !== "ADMIN") return null;

  return (
    <div className="h-screen w-full flex flex-col bg-white font-sans text-gray-900">
      <Toaster position="top-right" richColors />
      <Nav />
      <div className="h-[70px] shrink-0"></div>

      <main className="flex-1 flex overflow-hidden p-4 md:p-6 gap-6">
        {/* Main Content Area */}
        <section className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
            <div className="flex items-center gap-4 flex-1">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </Button>
              <div className="flex flex-col">
                <input
                  type="text"
                  name="title"
                  placeholder="문제 제목 입력"
                  className="text-lg font-bold placeholder:text-gray-300 border-none focus:ring-0 p-0"
                  value={problem.title}
                  onChange={handleChange}
                />
              </div>
              <select
                value={problem.level}
                onChange={(e) => setProblem({ ...problem, level: e.target.value })}
                className="text-xs border rounded p-1 ml-2"
              >
                <option value="초급">초급</option>
                <option value="중급">중급</option>
                <option value="고급">고급</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRun}
                disabled={isRunning}
                className="bg-white hover:bg-gray-50 text-gray-700 h-9 px-4 font-medium rounded-lg border border-gray-300 shadow-sm"
              >
                <Play className="w-4 h-4 mr-2 fill-gray-700" /> 실행
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                className="bg-black hover:bg-gray-800 text-white gap-2 h-9 px-4 font-bold rounded-lg shadow-md transition-all active:scale-95"
              >
                <Save className="w-4 h-4" /> 저장
              </Button>
            </div>
          </div>

          {/* Split Layout */}
          <div className="flex-1 overflow-hidden">
            <PanelGroup direction="horizontal" id="main-group-v8">
              {/* Left Panel: Description & Expected Output (Vertical CSS Flex Split) */}
              <Panel defaultSize={40} minSize={20} id="left-panel-v8" collapsible={false} className="flex flex-col h-full">
                <div className="flex flex-col h-full w-full">
                  {/* Description (Top - Fixed 65%) */}
                  <div className="h-[65%] flex flex-col bg-white border-b border-gray-200">
                    <div className="px-6 py-3 bg-gray-50 flex items-center border-b border-gray-100 shrink-0">
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" /> 문제 설명
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col relative">
                      <textarea
                        name="description"
                        placeholder="문제를 설명해주세요 (제약 사항, 입출력 예시 등)"
                        className="absolute inset-0 w-full h-full border-none p-6 resize-none focus:ring-0 focus:outline-none text-sm leading-relaxed"
                        value={problem.description}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Expected Output (Bottom - Fixed 35%) */}
                  <div className="h-[35%] flex flex-col bg-gray-50/30">
                    <div className="px-6 py-3 bg-gray-50 flex items-center border-b border-gray-100 justify-between shrink-0">
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" /> 예상 실행 결과 (Expected Output)
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col relative">
                      <textarea
                        name="expectedOutput"
                        placeholder="정답 비교를 위한 예상 출력값을 입력하세요."
                        className="absolute inset-0 w-full h-full border-none p-6 resize-none focus:ring-0 focus:outline-none text-sm font-mono bg-transparent"
                        value={problem.expectedOutput}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="w-[1px] bg-gray-200 hover:bg-black transition-colors flex items-center justify-center z-10">
                <div className="w-1.5 h-16 bg-gray-200 rounded-full hover:bg-black transition-colors"></div>
              </PanelResizeHandle>

              {/* Right: Editor & Console */}
              <Panel defaultSize={60} minSize={30} id="right-panel-v8">
                <PanelGroup direction="vertical" id="right-inner-group-v8">
                  {/* Editor */}
                  <Panel defaultSize={65} minSize={20} className="flex flex-col">
                    <div className="h-10 flex items-center justify-between px-4 bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center gap-2 bg-white border border-gray-200 px-2.5 py-1 rounded-md">
                        <Code2 className="w-3.5 h-3.5 text-black" />
                        <span className="text-xs font-semibold text-gray-700">main.java</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">* Base Code Template</span>
                    </div>
                    <div className="flex-1">
                      <Editor
                        defaultLanguage="java"
                        value={problem.baseCode}
                        onChange={handleEditorChange}
                        theme="vs-light"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          fontFamily: "'JetBrains Mono', 'D2Coding', monospace",
                          lineNumbers: 'on',
                          automaticLayout: true,
                          padding: { top: 24, bottom: 24 },
                        }}
                      />
                    </div>
                  </Panel>

                  <PanelResizeHandle className="h-[1px] bg-gray-200" />

                  {/* Console */}
                  <Panel defaultSize={35} minSize={10} className="flex flex-col bg-gray-50">
                    <div className="h-10 border-b border-gray-200 bg-white flex items-center px-4">
                      <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5" /> 실행 결과
                      </span>
                    </div>
                    <ScrollArea className="flex-1 p-5">
                      {output ? (
                        <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-gray-200 shadow-sm">{output}</pre>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 opacity-60">
                          <Terminal className="w-8 h-8" />
                          <span className="text-xs font-medium">실행 버튼을 눌러 코드를 테스트해보세요.</span>
                        </div>
                      )}
                    </ScrollArea>
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CodingTestCreate;