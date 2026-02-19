import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import { Save, ArrowLeft, Code2, Terminal, Sparkles, BookOpen, Play, Bot, Loader2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
// PanelGroup, PanelResizeHandle이 아닌 Group, Separator로 import (버전 호환성)
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
      navigate("/problems");
    }
  }, [userRole, navigate]);

  const [problem, setProblem] = useState({
    title: "",
    level: "초급",
    description: "",
    expectedOutput: "",
    // 기본 자바 템플릿 (Simple Version)
    baseCode: `public class main {
    public static void main(String[] args) {
        // 여기에 코드를 입력하세요.
        System.out.println("Hello World");
    }
}`
  });

  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // AI 생성 관련 상태
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState({
    topic: "",
    difficulty: "초급", // 초급, 중급, 고급
    requirements: ""
  });
  const [isAiGenerating, setIsAiGenerating] = useState(false);

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
    if (isSaving) return;
    if (!problem.title || !problem.description) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setIsSaving(true);
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
      setTimeout(() => navigate("/problems"), 1000);
    } catch (error) {
      console.error("문제 등록 실패:", error);
      toast.error("문제 등록 실패");
      setIsSaving(false);
    }
  };

  // AI 문제 생성 요청
  const handleAiGenerate = async () => {
    if (!aiPrompt.topic) {
      toast.error("문제 주제를 입력해주세요 (예: 반복문, 배열 등)");
      return;
    }

    setIsAiGenerating(true);

    try {
      // 프롬프트 구성
      const systemPrompt = `
      당신은 알고리즘 문제 출제 전문가입니다. 다음 조건에 맞춰 Java 코딩 테스트 문제를 하나 만들어주세요.
      중요: 'baseCode'에는 문제의 정답 풀이가 포함된 **완성된 코드**를 작성해야 합니다.
      반드시 아래 JSON 형식으로만 응답해야 합니다.

      [조건]
      - 주제: ${aiPrompt.topic}
      - 난이도: ${aiPrompt.difficulty}
      - 추가 요구사항: ${aiPrompt.requirements || "없음"}
      - **코드 작성 규칙**:
        1. Scanner나 BufferedReader 같은 입력 클래스를 사용하지 마십시오.
        2. 테스트에 필요한 입력값은 main 메서드 내부에 변수로 직접 선언(하드코딩)하십시오.
        3. 문제 해결 로직은 별도의 solution 메서드(또는 main 내부)에 **완전히 구현**되어야 합니다.
        4. 코드는 즉시 실행 가능해야 하며, 실행 시 정답(expectedOutput)과 동일한 결과가 출력되어야 합니다.
        5. 클래스명은 반드시 "main" (소문자)이어야 합니다.

      [JSON 응답 형식 (엄격 준수)]
      {
        "title": "문제 제목",
        "description": "문제 설명 (마크다운). 입력/출력 형식 및 예시 포함.",
        "baseCode": "public class main {\\n    public static void main(String[] args) {\\n        // 테스트 케이스 입력값 하드코딩\\n        int[] arr = {1, 2, 3, 4, 5};\\n        int k = 2;\\n\\n        // 풀이 로직 실행\\n        solution(arr, k);\\n    }\\n\\n    // 정답 풀이 메서드\\n    public static void solution(int[] arr, int k) {\\n        // 여기에 정답 로직을 구현하세요 (실제 정답 코드 작성)\\n    }\\n}",
        "expectedOutput": "예상되는 정답 출력값 (예: 4 5 1 2 3)"
      }
      `;

      // 챗봇 API 호출
      const response = await axios.get('/ask', {
        params: { message: systemPrompt } // 백엔드 ChatController의 파라미터 이름이 message임
      });

      const aiResponseText = response.data.message; // ChatDto의 필드 확인 결과 message임

      // JSON 파싱 시도
      try {
        // 응답에 마크다운 코드블럭(```json ... ```)이 포함될 경우 제거
        const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("JSON 형식을 찾을 수 없습니다.");
        }

        const parsedData = JSON.parse(jsonMatch[0]);

        setProblem({
          title: parsedData.title,
          level: aiPrompt.difficulty,
          description: parsedData.description,
          baseCode: parsedData.baseCode || problem.baseCode, // 없으면 기본값 유지
          expectedOutput: parsedData.expectedOutput || ""
        });

        toast.success("AI가 문제를 생성했습니다! 내용을 확인해주세요.");
        setIsAiModalOpen(false);

      } catch (parseError) {
        console.error("JSON 파싱 실패:", parseError, aiResponseText);
        toast.error("AI 응답을 처리하는 데 실패했습니다. 다시 시도해주세요.");
      }

    } catch (error) {
      console.error("AI 생성 실패:", error);
      toast.error("AI 서버 연결에 실패했습니다.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  if (userRole !== "ADMIN") return null;

  return (
    <div className="min-h-screen w-full flex flex-col bg-white font-sans text-gray-900">
      <Nav />
      {/* 70px Spacer for fixed Nav - 정확한 높이 계산 필요 */}
      <div className="h-[80px] shrink-0"></div>

      <main className="h-[calc(100vh-80px)] flex overflow-hidden p-4 md:p-6 gap-6 shrink-0">
        {/* Main Content Area */}
        <section className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
          {/* Toolbar */}
          <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
            <div className="flex items-center gap-4 flex-1">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </Button>
              <div className="flex flex-col flex-1 max-w-md">
                <input
                  type="text"
                  name="title"
                  placeholder="문제 제목 입력"
                  className="text-lg font-bold placeholder:text-gray-300 border-none focus:ring-0 p-0 w-full"
                  value={problem.title}
                  onChange={handleChange}
                />
              </div>
              <select
                value={problem.level}
                onChange={(e) => setProblem({ ...problem, level: e.target.value })}
                className="text-xs border rounded p-1 ml-2 bg-white"
              >
                <option value="초급">초급</option>
                <option value="중급">중급</option>
                <option value="고급">고급</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAiModalOpen(true)}
                className="hidden md:flex bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100 hover:text-violet-700 font-bold h-9 px-4 rounded-lg shadow-sm transition-all"
              >
                <Bot className="w-4 h-4 mr-2" />
                AI 자동 생성
              </Button>
              <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block" />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRun}
                disabled={isRunning}
                className="bg-white hover:bg-gray-50 text-gray-700 h-9 px-4 font-medium rounded-lg border border-gray-300 shadow-sm transition-all"
              >
                {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2 fill-gray-700" />}
                실행
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-black hover:bg-gray-800 text-white gap-2 h-9 px-4 font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? "제출 중..." : "문제 제출"}
              </Button>
            </div>
          </div>

          {/* Split Layout */}
          <div className="flex-1 overflow-hidden relative">
            <PanelGroup direction="horizontal" id="main-group-v8">
              {/* Left Panel: Description & Expected Output */}
              <Panel defaultSize={40} minSize={20} id="left-panel-v8" collapsible={false} className="flex flex-col h-full bg-white">
                <div className="flex flex-col h-full w-full">
                  {/* Description (Top - 65%) */}
                  <div className="h-[65%] flex flex-col border-b border-gray-200">
                    <div className="px-6 py-3 bg-gray-50/50 flex items-center border-b border-gray-100 shrink-0 justify-between">
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" /> 문제 설명
                      </span>
                    </div>
                    <div className="flex-1 relative">
                      <textarea
                        name="description"
                        placeholder="문제를 설명해주세요 (제약 사항, 입출력 예시 등)"
                        className="absolute inset-0 w-full h-full border-none p-6 resize-none focus:ring-0 focus:outline-none text-sm leading-relaxed text-gray-700"
                        value={problem.description}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Expected Output (Bottom - 35%) */}
                  <div className="h-[35%] flex flex-col bg-gray-50/30">
                    <div className="px-6 py-3 bg-gray-50/50 flex items-center border-b border-gray-100 shrink-0">
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" /> 예상 실행 결과 (Expected Output)
                      </span>
                    </div>
                    <div className="flex-1 relative">
                      <textarea
                        name="expectedOutput"
                        placeholder="정답 비교를 위한 예상 출력값을 입력하세요."
                        className="absolute inset-0 w-full h-full border-none p-6 resize-none focus:ring-0 focus:outline-none text-sm font-mono bg-transparent text-gray-700"
                        value={problem.expectedOutput}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="w-[1px] bg-gray-200 hover:bg-violet-500 transition-colors flex items-center justify-center z-10 group cursor-col-resize">
                <div className="w-1 h-8 bg-gray-300 rounded-full group-hover:bg-violet-500 transition-colors"></div>
              </PanelResizeHandle>

              {/* Right: Editor & Console */}
              <Panel defaultSize={60} minSize={30} id="right-panel-v8">
                <PanelGroup direction="vertical" id="right-inner-group-v8">
                  {/* Editor */}
                  <Panel defaultSize={65} minSize={20} className="flex flex-col">
                    <div className="h-10 flex items-center justify-between px-4 bg-gray-50 border-b border-gray-100 shrink-0">
                      <div className="flex items-center gap-2 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">
                        <Code2 className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-semibold text-gray-700">main.java</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">* Base Code Template</span>
                    </div>
                    <div className="flex-1 relative">
                      {/* Monaco Editor Container */}
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
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </div>
                  </Panel>

                  <PanelResizeHandle className="h-[1px] bg-gray-200 hover:bg-violet-500 transition-colors cursor-row-resize" />

                  {/* Console */}
                  <Panel defaultSize={35} minSize={10} className="flex flex-col bg-gray-50">
                    <div className="h-10 border-b border-gray-200 bg-white flex items-center px-4 shrink-0">
                      <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5" /> 실행 결과
                      </span>
                    </div>
                    <ScrollArea className="flex-1 p-0">
                      {output ? (
                        <div className="p-4">
                          <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-gray-200 shadow-sm">{output}</pre>
                        </div>
                      ) : (
                        <div className="h-full min-h-[100px] flex flex-col items-center justify-center text-gray-400 gap-3 opacity-60 p-8">
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

      {/* AI 생성 모달 */}
      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Bot className="w-6 h-6 text-violet-600" />
              AI 문제 생성기
            </DialogTitle>
            <DialogDescription>
              원하는 주제를 입력하면 AI가 자동으로 코딩 테스트 문제를 만들어줍니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="topic" className="font-bold">문제 주제 (필수)</Label>
              <Input
                id="topic"
                placeholder="예: 배열 회전하기, 스택 구현, 문자열 뒤집기"
                value={aiPrompt.topic}
                onChange={(e) => setAiPrompt({ ...aiPrompt, topic: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="difficulty" className="font-bold">난이도</Label>
                <select
                  id="difficulty"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={aiPrompt.difficulty}
                  onChange={(e) => setAiPrompt({ ...aiPrompt, difficulty: e.target.value })}
                >
                  <option value="초급">초급 (Easy)</option>
                  <option value="중급">중급 (Medium)</option>
                  <option value="고급">고급 (Hard)</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="requirements" className="font-bold">추가 요구사항 (선택)</Label>
              <Textarea
                id="requirements"
                placeholder="예: 시간 복잡도 O(N)으로 해결해야 함. 재귀 함수 사용 금지."
                value={aiPrompt.requirements}
                onChange={(e) => setAiPrompt({ ...aiPrompt, requirements: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAiModalOpen(false)}>취소</Button>
            <Button
              onClick={handleAiGenerate}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold gap-2"
              disabled={isAiGenerating}
            >
              {isAiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  문제 생성 시작
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodingTestCreate;