import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';
import InstructorNav from '../../components/InstructorNav';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, Trash2, Save, Bot } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import Tail from '@/components/Tail';

const ExamCreate = () => {
    const navigate = useNavigate();
    const { examId } = useParams();
    const token = localStorage.getItem("accessToken");

    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");

    // Exam basic info
    const [title, setTitle] = useState("");
    const [timeLimit, setTimeLimit] = useState(60);
    const [level, setLevel] = useState(1);
    const [passScore, setPassScore] = useState(60);
    const [isLoading, setIsLoading] = useState(false);

    // AI Generation
    const [courseLectures, setCourseLectures] = useState([]);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [questionCount, setQuestionCount] = useState(3);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Questions list
    const [questions, setQuestions] = useState([
        { id: 1, questionText: "", option1: "", option2: "", option3: "", option4: "", option5: "", correctAnswer: 1 }
    ]);

    // Fetch courses on mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Using relative path for proxy
                const response = await axios.get("/instructor/course");
                const coursesData = response.data;

                // Check exam existence for each course
                const coursesWithExamStatus = await Promise.all(
                    coursesData.map(async (course) => {
                        try {
                            const examResponse = await axios.get(`/instructor/course/${course.courseId}/exam`);
                            return {
                                ...course,
                                hasExam: examResponse.data && examResponse.data.length > 0
                            };
                        } catch (error) {
                            // If error occurs, assume no exam exists
                            return {
                                ...course,
                                hasExam: false
                            };
                        }
                    })
                );

                setCourses(coursesWithExamStatus);
            } catch (error) {
                console.error("Error fetching courses:", error);
                toast.error("강좌 목록을 불러오는데 실패했습니다.");
            }
        };
        fetchCourses();
    }, []);

    // Fetch lectures when course is selected for AI modal
    useEffect(() => {
        if (selectedCourseId) {
            const fetchLectures = async () => {
                try {
                    const response = await axios.get(`/instructor/course/${selectedCourseId}/lectures`);
                    // Use only valid lectures that have a videoUrl
                    setCourseLectures(response.data.filter(l => l.videoUrl));
                } catch (error) {
                    console.error("Error fetching lectures for AI:", error);
                }
            };
            fetchLectures();
        } else {
            setCourseLectures([]);
        }
    }, [selectedCourseId]);

    // Check for duplicate exam when course is selected
    const handleCourseChange = async (courseId) => {
        setSelectedCourseId(courseId);
        if (!courseId) return;

        try {
            const response = await axios.get(`/instructor/course/${courseId}/exam`);

            if (response.data && response.data.length > 0) {
                if (window.confirm("이미 이 강좌에 등록된 시험이 있습니다.\n해당 시험 수정 페이지로 이동하시겠습니까? (현재 작성 내용은 저장되지 않습니다)")) {
                    // Navigate to edit page (using the first exam found)
                    navigate(`/instructor/exam/${response.data[0].examId}`); // Detail/Edit page
                } else {
                    // Reset selection if they want to stay
                    setSelectedCourseId("");
                }
            }
        } catch (error) {
            console.error("Error checking existing exams:", error);
        }
    };

    // Add new question
    const addQuestion = () => {
        if (questions.length >= 20) {
            toast.error("문제는 최대 20개까지만 등록 가능합니다.");
            return;
        }
        setQuestions([
            ...questions,
            {
                id: Date.now(),
                questionText: "",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                option5: "",
                correctAnswer: 1
            }
        ]);
        toast.info("새 문제가 추가되었습니다.");
        // Scroll to bottom logic could be added here
    };

    // Remove question
    const removeQuestion = (id) => {
        if (questions.length <= 1) {
            toast.error("최소 1개의 문제는 있어야 합니다.");
            return;
        }
        setQuestions(questions.filter(q => q.id !== id));
    };

    // Update question field
    const updateQuestion = (id, field, value) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    // Handle AI Quiz Generation from Youtube URL
    const handleAiGenerate = async () => {
        if (!youtubeUrl.trim()) {
            toast.error("유튜브 URL을 선택해주세요.");
            return;
        }

        try {
            setIsAiLoading(true);
            toast.info("오디오 다운로드 및 AI 분석 중입니다 (최대 1~2분 이상 소요될 수 있습니다)...");

            // Send youtubeUrl directly to the backend bypassing browser CORS limitations
            const response = await axios.post("/instructor/exam/ai-generate", {
                script: "", // 백엔드에서 null 방지
                youtubeUrl: youtubeUrl,
                questionCount: questionCount
            });

            if (response.data && response.data.questions && response.data.questions.length > 0) {
                // map to existing state format
                const newQuestions = response.data.questions.map((aiQ, index) => ({
                    id: Date.now() + index, // unique id
                    questionText: aiQ.questionText || "",
                    option1: aiQ.option1 || "",
                    option2: aiQ.option2 || "",
                    option3: aiQ.option3 || "",
                    option4: aiQ.option4 || "",
                    option5: aiQ.option5 || "",
                    correctAnswer: aiQ.correctAnswer || 1
                }));

                // Add nicely
                if (questions.length === 1 && !questions[0].questionText.trim()) {
                    // if it is the default empty question, replace it
                    setQuestions(newQuestions);
                } else {
                    setQuestions(prev => {
                        const next = [...prev, ...newQuestions];
                        if (next.length > 20) {
                            toast.warning("20개를 초과한 문제는 제외되었습니다.");
                            return next.slice(0, 20);
                        }
                        return next;
                    });
                }

                toast.success("AI가 문제를 성공적으로 생성했습니다!");
                setIsAiModalOpen(false);
                setYoutubeUrl(""); // Reset
            } else {
                toast.error("문제 데이터를 받아오지 못했습니다.");
            }
        } catch (error) {
            console.error("Error generating AI quiz:", error);
            const errMsg = error.response?.data?.message || error.response?.data || error.message || "오류가 발생했습니다.";
            toast.error("AI 문제 생성 실패: " + errMsg);
        } finally {
            setIsAiLoading(false);
        }
    };

    // Fetch exam data if in edit mode
    useEffect(() => {
        if (examId) {
            const fetchExam = async () => {
                try {
                    const response = await axios.get(`/instructor/exam/${examId}`);
                    const exam = response.data;

                    // Populate state
                    setTitle(exam.title);
                    setTimeLimit(exam.timeLimit);
                    setLevel(exam.level);
                    setPassScore(exam.passScore);
                    setSelectedCourseId(exam.courseId); // Ensure this matches the select value type

                    // Populate questions
                    if (exam.questions && exam.questions.length > 0) {
                        setQuestions(exam.questions.map(q => ({
                            id: q.questionId || Date.now() + Math.random(),
                            questionText: q.questionText || "",
                            option1: q.option1 || "",
                            option2: q.option2 || "",
                            option3: q.option3 || "",
                            option4: q.option4 || "",
                            option5: q.option5 || "",
                            correctAnswer: q.correctAnswer || 1
                        })));
                    }
                } catch (error) {
                    console.error("Error fetching exam details:", error);
                    toast.error("시험 정보를 불러오는데 실패했습니다.");
                }
            };
            fetchExam();
        }
    }, [examId]);


    // Submit exam
    const handleSubmit = async () => {
        if (!selectedCourseId) {
            toast.error("강좌를 선택해주세요.");
            return;
        }
        if (!title.trim()) {
            toast.error("시험 제목을 입력해주세요.");
            return;
        }

        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.questionText.trim() || !q.option1.trim() || !q.option2.trim() ||
                !q.option3.trim() || !q.option4.trim() || !q.option5.trim()) {
                toast.error(`${i + 1}번 문제의 모든 내용을 입력해주세요.`);
                return;
            }
        }

        const payload = {
            courseId: parseInt(selectedCourseId),
            title,
            timeLimit: parseInt(timeLimit),
            level: parseInt(level),
            passScore: parseInt(passScore),
            questions: questions.map(q => ({
                questionText: q.questionText,
                option1: q.option1,
                option2: q.option2,
                option3: q.option3,
                option4: q.option4,
                option5: q.option5,
                correctAnswer: parseInt(q.correctAnswer)
            }))
        };

        try {
            setIsLoading(true);
            if (examId) {
                await axios.put(`/instructor/exam/${examId}`, payload);
                toast.success("시험이 성공적으로 수정되었습니다.");
            } else {
                await axios.post("/instructor/exam/new", payload);
                toast.success("시험이 성공적으로 등록되었습니다.");
            }
            navigate("/instructor/exam/list"); // Redirect to list
        } catch (error) {
            console.error("Error creating/updating exam:", error);
            // Default message
            let msg = "시험 저장 중 오류가 발생했습니다.";

            // detailed message from backend
            if (error.response) {
                const { data, status } = error.response;

                if (typeof data === 'string') {
                    // if formatted as simple string
                    msg = data;
                } else if (data && data.message) {
                    // if JSON object with message field
                    msg = data.message;
                }

                // Add status code for clarity if needed, or keep it simple
                // msg = `[${status}] ${msg}`; 
            }
            toast.error(msg); // Show the specific error message to the user
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <InstructorNav />
            <div className="container mx-auto py-10 max-w-5xl flex-1">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">시험 문제 출제</h1>
                        <p className="text-muted-foreground mt-2">
                            강좌별 시험을 생성하고 5지선다 문제를 등록합니다. (최대 20문제)
                        </p>
                    </div>
                    <Button onClick={handleSubmit} size="lg" className="gap-2" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="animate-spin text-xl">⏳</span> 저장 중...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                시험 등록 완료
                            </>
                        )}
                    </Button>
                </div>

                <div className="grid gap-8">
                    {/* Basic Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>기본 정보</CardTitle>
                            <CardDescription>시험의 기본 설정을 입력해주세요.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="course">강좌 선택</Label>
                                    <select
                                        id="course"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={selectedCourseId}
                                        onChange={(e) => handleCourseChange(e.target.value)}
                                    >
                                        <option value="">강좌를 선택하세요</option>
                                        {courses.map(course => (
                                            <option
                                                key={course.courseId}
                                                value={course.courseId}
                                            >
                                                {course.hasExam ? `[시험등록됨] ${course.title}` : course.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">시험 제목</Label>
                                    <Input
                                        id="title"
                                        placeholder="예: 자바 기초 테스트"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6 col-span-2">
                                    <div className="space-y-2">
                                        <Label>제한 시간 (분)</Label>
                                        <Input
                                            type="number"
                                            value={timeLimit || ""}
                                            onChange={(e) => setTimeLimit(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>합격 기준 점수</Label>
                                        <Input
                                            type="number"
                                            value={passScore || ""}
                                            onChange={(e) => setPassScore(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Questions List */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold flex items-center gap-2">문제 목록 ({questions.length} / 20)</h2>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="gap-2 border-primary text-primary hover:bg-primary/10"
                                    onClick={() => {
                                        if (!selectedCourseId) {
                                            toast.error("AI 출제를 위해 먼저 강좌를 선택해주세요.");
                                            return;
                                        }
                                        setIsAiModalOpen(true);
                                    }}
                                    disabled={questions.length >= 20}
                                >
                                    <Bot className="w-4 h-4" />
                                    AI 자동 출제
                                </Button>
                                <Button variant="outline" onClick={addQuestion} disabled={questions.length >= 20} className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    문제 추가
                                </Button>
                            </div>
                        </div>

                        {questions.map((q, index) => (
                            <Card key={q.id} className="relative transition-all hover:shadow-md">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                                {index + 1}
                                            </span>
                                            문제 #{index + 1}
                                        </CardTitle>
                                        {questions.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                onClick={() => removeQuestion(q.id)}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label>질문 내용</Label>
                                        <Textarea
                                            placeholder="문제를 입력하세요..."
                                            value={q.questionText}
                                            onChange={(e) => updateQuestion(q.id, 'questionText', e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                    </div>

                                    <Separator />

                                    <div className="grid gap-4">
                                        <Label>보기 및 정답 선택</Label>
                                        <RadioGroup
                                            value={q.correctAnswer.toString()}
                                            onValueChange={(val) => updateQuestion(q.id, 'correctAnswer', parseInt(val))}
                                            className="space-y-3"
                                        >
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <div key={num} className="flex items-center gap-3">
                                                    <div className="flex items-center h-10">
                                                        <RadioGroupItem value={num.toString()} id={`q${q.id}-opt${num}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Input
                                                            placeholder={`보기 ${num}`}
                                                            value={q[`option${num}`] || ""}
                                                            onChange={(e) => updateQuestion(q.id, `option${num}`, e.target.value)}
                                                            className={q.correctAnswer === num ? "border-primary ring-1 ring-primary" : ""}
                                                        />
                                                    </div>
                                                    {q.correctAnswer === num && (
                                                        <span className="text-xs font-semibold text-primary shrink-0 w-10">정답</span>
                                                    )}
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-center pt-8 pb-20">
                        <Button onClick={handleSubmit} size="lg" className="w-full max-w-md gap-2 text-lg h-12" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="animate-spin text-xl">⏳</span> 저장 중...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    시험 등록 완료
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* AI Modal */}
            <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                            <Bot className="w-6 h-6 text-primary" />
                            AI 시험 문제 자동 출제 (현재 강좌 기반)
                        </DialogTitle>
                        <DialogDescription className="text-base mt-2">
                            문제를 출제할 <strong>강의</strong>를 선택해주세요.<br />
                            선택된 강의의 영상 음성을 자동으로 분석한 자막(자동생성) 데이터를 읽어와서 출제합니다.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="lecture-select">출제 대상 강의 선택 (유튜브 연동)</Label>
                            {courseLectures.length > 0 ? (
                                <select
                                    id="lecture-select"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                >
                                    <option value="">강의를 선택하세요</option>
                                    {courseLectures.map(lecture => (
                                        <option key={lecture.lectureId} value={lecture.videoUrl}>
                                            {lecture.orderNo}강 - {lecture.title}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-3 text-sm text-amber-600 bg-amber-50 rounded-md border border-amber-200">
                                    해당 강좌에 등록된 (유튜브 링크가 포함된) 강의가 없습니다. 먼저 강의를 등록해주세요.
                                </div>
                            )}
                        </div>

                        {youtubeUrl && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>선택된 유튜브 영상 URL</Label>
                                    <Input
                                        value={youtubeUrl}
                                        disabled
                                        className="bg-muted text-muted-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="question-count">출제할 문제 개수 (1~10)</Label>
                                    <select
                                        id="question-count"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                            <option key={num} value={num}>{num}개 출제</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <p className="text-sm text-muted-foreground mt-2">
                            * 주의: 영상 전체 음성을 다운로드하여 STT 변환 과정을 거치므로 <b>최대 1~2분 정도 소요</b>될 수 있습니다.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAiModalOpen(false)}>취소</Button>
                        <Button onClick={handleAiGenerate} disabled={isAiLoading || !youtubeUrl.trim()} className="gap-2">
                            {isAiLoading ? (
                                <>
                                    <span className="animate-spin">⏳</span> AI가 고민하는 중...
                                </>
                            ) : (
                                "자동 생성하기"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Tail />
        </div>
    );
};

export default ExamCreate;
