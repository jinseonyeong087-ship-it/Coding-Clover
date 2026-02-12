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
        if (window.confirm("시험을 시작하시겠습니까?\n시험 도중 이탈하면 불이익이 있을 수 있습니다.")) {
            navigate(`/student/exam/taking/${examId}`);
        }
    };

    // Pagination Logic - Available Exams
    const totalAvailablePages = Math.ceil(availableExams.length / itemsPerPage);
    const availableStartIndex = (availablePage - 1) * itemsPerPage;
    const currentAvailableExams = availableExams.slice(availableStartIndex, availableStartIndex + itemsPerPage);

    const handleAvailablePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalAvailablePages) {
            setAvailablePage(newPage);
        }
    };

    // Pagination Logic - History
    const totalHistoryPages = Math.ceil(scoreHistory.length / itemsPerPage);
    const historyStartIndex = (historyPage - 1) * itemsPerPage;
    const currentScoreHistory = scoreHistory.slice(historyStartIndex, historyStartIndex + itemsPerPage);

    const handleHistoryPageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalHistoryPages) {
            setHistoryPage(newPage);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <StudentNav />
            <div className="container mx-auto py-10 max-w-5xl">
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">시험 응시 센터</h1>
                    <p className="text-muted-foreground">
                        수강 중인 강좌의 시험에 응시할 수 있습니다.
                    </p>
                </div>

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
                                                        <TableCell>{getLevelBadge(exam.level)}</TableCell>
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
                                        {availableExams.length > itemsPerPage && (
                                            <div className="flex justify-center items-center gap-4 mt-6 border-t pt-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAvailablePageChange(availablePage - 1)}
                                                    disabled={availablePage === 1}
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                    이전
                                                </Button>
                                                <span className="text-sm text-muted-foreground">
                                                    {availablePage} / {totalAvailablePages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAvailablePageChange(availablePage + 1)}
                                                    disabled={availablePage === totalAvailablePages}
                                                >
                                                    다음
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
                                                                <Badge className="bg-emerald-500 hover:bg-emerald-600">합격</Badge>
                                                            ) : (
                                                                <Badge variant="destructive">불합격</Badge>
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
                                        {scoreHistory.length > itemsPerPage && (
                                            <div className="flex justify-center items-center gap-4 mt-6 border-t pt-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleHistoryPageChange(historyPage - 1)}
                                                    disabled={historyPage === 1}
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                    이전
                                                </Button>
                                                <span className="text-sm text-muted-foreground">
                                                    {historyPage} / {totalHistoryPages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleHistoryPageChange(historyPage + 1)}
                                                    disabled={historyPage === totalHistoryPages}
                                                >
                                                    다음
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
        </div>
    );
};

export default StudentExamList;
