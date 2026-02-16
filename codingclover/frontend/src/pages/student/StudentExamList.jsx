import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import StudentNav from '../../components/StudentNav';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Tail from '@/components/Tail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Play, Loader2, History, Trophy, ChevronLeft, ChevronRight } from "lucide-react";

const StudentExamList = () => {
    const navigate = useNavigate();
    const { courseId } = useParams(); // courseId가 있으면 특정 강좌의 시험, 없으면 전체 시험
    const [searchParams] = useSearchParams();
    const [availableExams, setAvailableExams] = useState([]);
    const [scoreHistory, setScoreHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'history' ? 'history' : 'available');

    // Pagination State
    const [availablePage, setAvailablePage] = useState(1);
    const [historyPage, setHistoryPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // courseId가 있으면 특정 강좌의 시험, 없으면 전체 시험
            const examEndpoint = courseId ? `/student/exam/${courseId}` : "/student/exam";

            console.log("시험 조회 요청:", examEndpoint);
            console.log("Course ID:", courseId);

            const [examsRes, scoresRes] = await Promise.all([
                axios.get(examEndpoint),
                axios.get("/student/my-scores")
            ]);

            console.log("시험 응답 데이터:", examsRes.data);
            console.log("점수 응답 데이터:", scoresRes.data);

            setAvailableExams(examsRes.data);
            setScoreHistory(scoresRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            console.error("Error response:", error.response);
            // toast.error("데이터를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const getLevelBadge = (level) => {
        switch (level) {
            case 1: return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">초급</Badge>;
            case 2: return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">중급</Badge>;
            case 3: return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">고급</Badge>;
            default: return <Badge variant="secondary">기타</Badge>;
        }
    };

    const handleStartExam = (examId) => {
        if (window.confirm("시험을 시작하시겠습니까?\n시험 도중 이탈 시 응시내역은 저장되지 않습니다.")) {
            navigate(`/student/exam/taking/${examId}`);
        }
    };

    // Pagination Logic - Available Exams
    const sortedAvailableExams = [...availableExams].sort((a, b) => (b.examId || 0) - (a.examId || 0));
    const totalAvailablePages = Math.ceil(sortedAvailableExams.length / itemsPerPage);
    const availableStartIndex = (availablePage - 1) * itemsPerPage;
    const currentAvailableExams = sortedAvailableExams.slice(availableStartIndex, availableStartIndex + itemsPerPage);

    const handleAvailablePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalAvailablePages) {
            setAvailablePage(newPage);
        }
    };

    // Pagination Logic - History
    const sortedScoreHistory = [...scoreHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const totalHistoryPages = Math.ceil(sortedScoreHistory.length / itemsPerPage);
    const historyStartIndex = (historyPage - 1) * itemsPerPage;
    const currentScoreHistory = sortedScoreHistory.slice(historyStartIndex, historyStartIndex + itemsPerPage);

    const handleHistoryPageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalHistoryPages) {
            setHistoryPage(newPage);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <StudentNav />
            <div className="h-0"></div>
            {/* Header Section */}
            <div className="border-b border-gray-200 bg-gray-50/50">
                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-4xl">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-2">
                            시험 응시 센터
                        </h1>
                        <p className="text-lg text-gray-500">
                            수강 중인 강좌의 시험에 응시하고 결과를 확인할 수 있습니다.
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-6 py-12">
                <div className="max-w-5xl mx-auto">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="available">응시 가능한 시험</TabsTrigger>
                            <TabsTrigger value="history">나의 시험 결과</TabsTrigger>
                        </TabsList>

                        <TabsContent value="available">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Play className="w-5 h-5 text-primary" />
                                        응시 가능한 시험 목록
                                    </CardTitle>
                                    <CardDescription>
                                        현재 응시 가능한 시험은 총 {availableExams.length}개입니다.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        </div>
                                    ) : availableExams.length === 0 ? (
                                        <div className="text-center py-20 text-muted-foreground">
                                            현재 응시 가능한 시험이 없습니다.
                                        </div>
                                    ) : (
                                        <>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>강좌명</TableHead>
                                                        <TableHead>시험 제목</TableHead>
                                                        <TableHead>난이도</TableHead>
                                                        <TableHead>제한시간</TableHead>
                                                        <TableHead>합격기준</TableHead>
                                                        <TableHead className="text-right">응시</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {currentAvailableExams.map((exam) => (
                                                        <TableRow key={exam.examId}>
                                                            <TableCell className="text-muted-foreground">{exam.courseTitle}</TableCell>
                                                            <TableCell className="font-semibold">{exam.title}</TableCell>
                                                            <TableCell>{getLevelBadge(exam.courseLevel || exam.level)}</TableCell>
                                                            <TableCell>{exam.timeLimit}분</TableCell>
                                                            <TableCell>{exam.passScore}점</TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleStartExam(exam.examId)}
                                                                    className="bg-primary hover:bg-primary/90"
                                                                >
                                                                    시험 시작
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>

                                            {/* Available Exams Pagination */}
                                            {totalAvailablePages >= 1 && (
                                                <div className="flex justify-center items-center gap-2 mt-8 border-t pt-8">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAvailablePageChange(availablePage - 1)}
                                                        disabled={availablePage === 1}
                                                        className="h-9 px-3 rounded-none border-gray-300"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </Button>

                                                    {Array.from({ length: totalAvailablePages }, (_, i) => i + 1).map(page => (
                                                        <Button
                                                            key={page}
                                                            variant={availablePage === page ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => handleAvailablePageChange(page)}
                                                            className={`h-9 w-9 rounded-none border ${availablePage === page ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                                                        >
                                                            {page}
                                                        </Button>
                                                    ))}

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAvailablePageChange(availablePage + 1)}
                                                        disabled={availablePage === totalAvailablePages}
                                                        className="h-9 px-3 rounded-none border-gray-300"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                        나의 시험 결과
                                    </CardTitle>
                                    <CardDescription>
                                        최근 응시한 시험 결과입니다.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        </div>
                                    ) : scoreHistory.length === 0 ? (
                                        <div className="text-center py-20 text-muted-foreground">
                                            아직 응시한 시험 기록이 없습니다.
                                        </div>
                                    ) : (
                                        <>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>강좌명</TableHead>
                                                        <TableHead>시험 제목</TableHead>
                                                        <TableHead>응시 차수</TableHead>
                                                        <TableHead>점수</TableHead>
                                                        <TableHead>결과</TableHead>
                                                        <TableHead className="text-right">응시 일시</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {currentScoreHistory.map((history) => (
                                                        <TableRow key={history.historyId}>
                                                            <TableCell className="text-muted-foreground text-sm">{history.courseTitle || '강좌 정보 없음'}</TableCell>
                                                            <TableCell className="font-medium">{history.examTitle}</TableCell>
                                                            <TableCell>{history.attemptNo}회차</TableCell>
                                                            <TableCell>{history.score}점</TableCell>
                                                            <TableCell>
                                                                {history.passed ? (
                                                                    <Badge className="bg-emerald-500 hover:bg-emerald-600 min-w-[60px] justify-center">합격</Badge>
                                                                ) : (
                                                                    <Badge variant="destructive" className="min-w-[60px] justify-center">불합격</Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right text-muted-foreground text-sm">
                                                                {new Date(history.createdAt).toLocaleString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>

                                            {/* History Pagination */}
                                            {totalHistoryPages >= 1 && (
                                                <div className="flex justify-center items-center gap-2 mt-8 border-t pt-8">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleHistoryPageChange(historyPage - 1)}
                                                        disabled={historyPage === 1}
                                                        className="h-9 px-3 rounded-none border-gray-300"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </Button>

                                                    {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map(page => (
                                                        <Button
                                                            key={page}
                                                            variant={historyPage === page ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => handleHistoryPageChange(page)}
                                                            className={`h-9 w-9 rounded-none border ${historyPage === page ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                                                        >
                                                            {page}
                                                        </Button>
                                                    ))}

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleHistoryPageChange(historyPage + 1)}
                                                        disabled={historyPage === totalHistoryPages}
                                                        className="h-9 px-3 rounded-none border-gray-300"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Tail />
        </div>
    );
};

export default StudentExamList;
