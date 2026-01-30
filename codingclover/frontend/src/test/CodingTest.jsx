
import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Play, Send, RotateCcw, CheckCircle2, XCircle, Code2, List as ListIcon, Loader2 } from 'lucide-react';

export default function CodingTest() {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [inputData, setInputData] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gradingResult, setGradingResult] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('input'); // input, output, result

  // 초기 로딩: 문제 목록 가져오기
  useEffect(() => {
    fetch('/api/problems')
      .then(res => res.json())
      .then(data => {
        setProblems(data);
        if (data.length > 0) {
          // 첫 번째 문제 기본 선택
          handleSelectProblem(data[0]);
        }
      })
      .catch(err => console.error("문제 목록 로딩 실패:", err));
  }, []);

  // 문제 선택 핸들러
  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);

    // 문제별 정답 코드 (Scanner 대신 변수 할당 방식)
    if (problem.problemId === 1) { // 두 수의 합
      setCode(`public class Main {
    public static void main(String[] args) {
        // 문제 (10 + 50) 정답 코드
        int a = 10;
        int b = 50;
        System.out.println(a + b);
    }
}`);
    } else if (problem.problemId === 2) { // 짝수 홀수 판별
      setCode(`public class Main {
    public static void main(String[] args) {
        // 테스트 케이스 1번: 2 -> even
        int n = 2;
        if (n % 2 == 0) {
            System.out.println("even");
        } else {
            System.out.println("odd");
        }
    }
}`);
    } else if (problem.problemId === 3) { // 1부터 N까지 합
      setCode(`public class Main {
    public static void main(String[] args) {
        // 테스트 케이스: 10 -> 55 
        int n = 10;
        int sum = 0;
        for (int i = 1; i <= n; i++) {
            sum += i;
        }
        System.out.println(sum);
    }
}`);
    } else {
      // 기본 템플릿
      setCode(`public class Main {
    public static void main(String[] args) {
        // 여기에 변수를 선언하고 로직을 작성하세요
        // 예: int a = 10;
        
    }
}`);
    }

    // 예제 입력값 세팅 - Scanner 미사용으로 불필요하지만 State 호환성 유지
    setInputData('');

    // 결과 초기화
    setOutput('');
    setError(null);
    setGradingResult(null);
    setActiveTab('output');
  };

  // 실행 핸들러
  const handleRun = async () => {
    if (!selectedProblem) return;
    setLoading(true);
    setOutput('');
    setError(null);
    setGradingResult(null);
    setActiveTab('output'); // 실행 시 '실행 결과' 탭으로 이동

    try {
      const response = await fetch(`/api/problems/${selectedProblem.problemId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input: inputData }),
      });
      const data = await response.json();
      if (data.error) setError(data.error);
      else setOutput(data.output);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    if (!selectedProblem) return;
    setLoading(true);
    setOutput('');
    setError(null);
    setGradingResult(null);
    setActiveTab('result'); // 제출 시 '채점 결과' 탭으로 이동

    try {
      const storedUser = localStorage.getItem('users');
      let userId = null;
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          userId = u.userId || u.id; // 기존 코드 호환
        } catch (e) {
          console.error("User parsing error", e);
        }
      }

      const response = await fetch(`/api/problems/${selectedProblem.problemId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, userId }),
      });
      const data = await response.json();
      setGradingResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 난이도 뱃지 색상
  const getDifficultyColor = (diff) => {
    switch (diff?.toUpperCase()) {
      case 'EASY': return 'bg-green-500 hover:bg-green-600'; // Tailwind/Shadcn 색상 매핑 필요, 일단 클래스로
      case 'MEDIUM': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'HARD': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* 1. 사이드바 (문제 목록) */}
      <div className={`border-r bg-card transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-80' : 'w-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ListIcon className="w-5 h-5" /> 문제 목록
          </h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {problems.map(problem => (
              <button
                key={problem.problemId}
                onClick={() => handleSelectProblem(problem)}
                className={`w-full text-left px-3 py-3 rounded-md text-sm transition-colors flex items-center justify-between
                  ${selectedProblem?.problemId === problem.problemId
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'hover:bg-muted text-muted-foreground'}`}
              >
                <div className="truncate flex-1 mr-2">{problem.title}</div>
                <Badge variant={selectedProblem?.problemId === problem.problemId ? "secondary" : "outline"} className="text-xs shrink-0">
                  {problem.difficulty}
                </Badge>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 2. 메인 영역 */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* 헤더 */}
        <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} title="문제 목록 토글">
              <ListIcon className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 font-semibold">
              <Code2 className="w-5 h-5 text-primary" />
              <span>Coding Clover Test</span>
              {selectedProblem && (
                <>
                  <Separator orientation="vertical" className="h-4 mx-2" />
                  <span className="text-sm text-foreground/80">{selectedProblem.title}</span>
                  <Badge className={`${getDifficultyColor(selectedProblem.difficulty)} text-white`}>
                    {selectedProblem.difficulty}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRun}
              disabled={loading || !selectedProblem}
              className="gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              실행
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={loading || !selectedProblem}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              제출
            </Button>
          </div>
        </header>

        {/* 컨텐츠 영역 (스플릿) */}
        <div className="flex-1 flex overflow-hidden">

          {/* 왼쪽: 문제 설명 (40%) */}
          <div className="w-[40%] border-r flex flex-col bg-card min-w-[300px]">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                📝 문제 설명
              </h3>
            </div>
            <ScrollArea className="flex-1 p-6">
              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                {selectedProblem ? selectedProblem.description : "문제를 선택해주세요."}
              </div>
            </ScrollArea>
          </div>

          {/* 오른쪽: 코드 에디터 및 콘솔 (60%) */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
            {/* 에디터 */}
            <div className="flex-1 relative">
              <Editor
                height="100%"
                defaultLanguage="java"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 }
                }}
              />
            </div>

            {/* 콘솔창 (하단 고정 높이) */}
            <div className="h-64 border-t bg-card flex flex-col shrink-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="flex items-center justify-between px-2 border-b bg-muted/40">
                  <TabsList className="bg-transparent h-10 p-0">
                    <TabsTrigger value="output" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4">
                      실행 결과
                    </TabsTrigger>
                    <TabsTrigger value="result" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4">
                      채점 결과
                    </TabsTrigger>
                  </TabsList>

                  {/* 초기화 버튼 등 도구 모음 */}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => { setOutput(''); setError(null); setGradingResult(null); }}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* 탭 내용 영역 */}
                <div className="flex-1 overflow-hidden relative bg-muted/10">
                  <ScrollArea className="h-full w-full">
                    {/* 입력값 탭 제거됨 */}


                    <TabsContent value="output" className="p-4 m-0 h-full border-none outline-none">
                      {!output && !error && (
                        <div className="text-muted-foreground text-sm flex h-full items-center justify-center">
                          '실행' 버튼을 눌러 코드를 테스트해보세요.
                        </div>
                      )}
                      {output && (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-green-600 dark:text-green-400">Standard Output:</div>
                          <pre className="font-mono text-sm bg-black/5 dark:bg-black/30 p-3 rounded border text-foreground whitespace-pre-wrap">{output}</pre>
                        </div>
                      )}
                      {error && (
                        <div className="space-y-2 mt-4">
                          <div className="text-xs font-bold text-red-600 dark:text-red-400">Error:</div>
                          <pre className="font-mono text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 whitespace-pre-wrap">{error}</pre>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="result" className="p-4 m-0 h-full border-none outline-none">
                      {!gradingResult && !error && (
                        <div className="text-muted-foreground text-sm flex h-full items-center justify-center">
                          '제출' 버튼을 눌러 정답을 확인하세요.
                        </div>
                      )}
                      {error && (
                        <div className="text-red-500 font-medium flex items-center gap-2">
                          <XCircle className="w-5 h-5" /> 제출 처리 중 오류가 발생했습니다: {error}
                        </div>
                      )}
                      {gradingResult && (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-lg border ${gradingResult.passed ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'}`}>
                            <div className="flex items-center gap-3">
                              {gradingResult.passed ? (
                                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                              )}
                              <div>
                                <h3 className={`text-lg font-bold ${gradingResult.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                  {gradingResult.passed ? '정답입니다! 🎉' : '오답입니다 😢'}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">{gradingResult.message}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <Card>
                              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">테스트 케이스</span>
                                <span className="text-2xl font-mono mt-1">
                                  {gradingResult.passedCases} <span className="text-muted-foreground text-sm">/ {gradingResult.totalCases}</span>
                                </span>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">실행 속도</span>
                                <span className="text-2xl font-mono mt-1">{gradingResult.executionTime} <span className="text-base text-muted-foreground">ms</span></span>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </ScrollArea>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
