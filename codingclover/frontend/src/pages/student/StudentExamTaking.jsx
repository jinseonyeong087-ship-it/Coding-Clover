import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Clock, CheckCircle2, ChevronRight, ChevronLeft, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Tail from '@/components/Tail';

const StudentExamTaking = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: selectedOption (1-5) }
    const [timeLeft, setTimeLeft] = useState(null); // seconds
    const [isLoading, setIsLoading] = useState(true);

    // Prevent accidental navigation
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Fetch Exam Data
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const response = await axios.get(`/student/exam/detail/${examId}`);
                setExam(response.data);
                // Set initial time
                setTimeLeft(response.data.timeLimit * 60);
            } catch (error) {
                console.error("Error fetching exam:", error);
                toast.error("시험 정보를 불러오는데 실패했습니다.");
                navigate("/student/exam");
            } finally {
                setIsLoading(false);
            }
        };
        fetchExam();
    }, [examId, navigate]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            handleAutoSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleAutoSubmit = () => {
        toast.info("제한 시간이 종료되어 답안이 자동 제출됩니다.");
        handleSubmit();
    };

    const handleOptionSelect = (value) => {
        if (exam && exam.questions) {
            const currentQ = exam.questions[currentQuestionIndex];
            setAnswers(prev => ({
                ...prev,
                [currentQ.questionId]: parseInt(value)
            }));
        }
    };

    const handleSubmit = async () => {
        // Confirm if invoked manually and not all answered?
        // But for simplicity, just confirm action
        if (timeLeft > 0 && !window.confirm("정말 답안을 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.")) {
            return;
        }

        try {
            // Send map directly if backend expects Map
            // But JSON usually sends Object. Backend Map<Long, Integer> handles it? 
            // Yes, standard JSON object with numeric keys matches Map<String, Integer> in JS, 
            // but Spring needs to map it. 
            // Keys in JS object are strings. Spring's Jackson can convert String keys to Long.

            const payload = {
                answers: answers
            };

            const response = await axios.post(`/student/exam/${examId}/submit`, payload);

            toast.success("시험이 성공적으로 제출되었습니다.");
            // Show result or redirect
            // Assuming result is returned or we redirect to list
            // For now, redirect to list with potential query param or just list
            // Or better, show a result modal?
            // The response contains ExamResultDto.

            // Navigate to list but maybe show simple alert first with score
            const result = response.data;
            alert(`[결과 확인]\n점수: ${result.score}점\n합격 여부: ${result.passed ? '합격' : '불합격'}`);

            navigate("/student/exam");
        } catch (error) {
            console.error("Error submitting exam:", error);
            toast.error("답안 제출 중 오류가 발생했습니다.");
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (isLoading || !exam) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const currentQuestion = exam.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;
    const answeredCount = Object.keys(answers).length;
    const totalCount = exam.questions.length;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{exam.courseTitle} - {exam.title}</h1>
                    <span className="text-sm text-muted-foreground">총 {totalCount}문제 | 제한시간 {exam.timeLimit}분</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                        <Clock className="w-5 h-5" />
                        {formatTime(timeLeft)}
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => {
                        if (window.confirm("시험을 중단하고 나가시겠습니까? 현재까지 푼 내용은 저장되지 않습니다.")) {
                            navigate("/student/exam");
                        }
                    }}>
                        나가기
                    </Button>
                </div>
            </header>

            <main className="flex-1 container mx-auto p-4 max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Question Area */}
                <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-140px)]">
                    <CardHeader className="border-b bg-gray-50/50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">
                                문제 {currentQuestionIndex + 1}
                            </CardTitle>
                            {answers[currentQuestion.questionId] && (
                                <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> 답안 선택됨
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-6">
                        <div className="text-lg font-medium mb-8 leading-relaxed whitespace-pre-wrap">
                            {currentQuestion.questionText}
                        </div>

                        <RadioGroup
                            value={answers[currentQuestion.questionId]?.toString() || ""}
                            onValueChange={handleOptionSelect}
                            className="space-y-4"
                        >
                            {[1, 2, 3, 4, 5].map((optNum) => {
                                const optText = currentQuestion[`option${optNum}`];
                                if (!optText) return null; // Skip empty options if any
                                return (
                                    <div key={optNum} className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${answers[currentQuestion.questionId] === optNum ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200'}`}>
                                        <RadioGroupItem value={optNum.toString()} id={`opt-${optNum}`} className="mt-1" />
                                        <Label htmlFor={`opt-${optNum}`} className="text-base font-normal flex-1 cursor-pointer leading-relaxed">
                                            {optText}
                                        </Label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    </ScrollArea>
                    <CardFooter className="border-t bg-gray-50/50 p-4 flex justify-between">
                        <Button
                            variant="outline"
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            이전 문제
                        </Button>

                        {isLastQuestion ? (
                            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit}>
                                답안 제출하기
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            >
                                다음 문제
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Right Sidebar: Question Grid */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-base flex justify-between items-center">
                            답안 작성 현황
                            <span className="text-sm font-normal text-muted-foreground">
                                {answeredCount} / {totalCount}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 gap-2">
                            {exam.questions.map((q, idx) => {
                                const isAnswered = answers[q.questionId] !== undefined;
                                const isCurrent = currentQuestionIndex === idx;
                                return (
                                    <button
                                        key={q.questionId}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`
                                            h-10 w-10 text-sm font-medium rounded-md flex items-center justify-center transition-all
                                            ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                                            ${isAnswered
                                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}
                                        `}
                                    >
                                        {idx + 1}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                                <h4 className="text-sm font-semibold text-yellow-800 flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4" /> 주의사항
                                </h4>
                                <ul className="text-xs text-yellow-700 space-y-1 list-disc pl-4">
                                    <li>시험 도중 브라우저를 닫거나 이탈하면 답안이 저장되지 않을 수 있습니다.</li>
                                    <li>제한 시간이 종료되면 자동으로 제출됩니다.</li>
                                    <li>제출 후에는 수정이 불가능합니다.</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Tail />
        </div>
    );
};

export default StudentExamTaking;
