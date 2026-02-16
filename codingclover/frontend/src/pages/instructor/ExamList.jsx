import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InstructorNav from '../../components/InstructorNav';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Edit, FileText, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Tail from '@/components/Tail';

const ExamList = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchExams = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/instructor/exam");
            setExams(response.data);
        } catch (error) {
            console.error("Error fetching exams:", error);
            toast.error("시험 목록을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);



    const handleDelete = async (examId) => {
        if (!window.confirm("정말 이 시험을 삭제하시겠습니까?")) return;

        try {
            await axios.delete(`/instructor/exam/${examId}`);
            toast.success("시험이 삭제되었습니다.");
            const updatedExams = exams.filter(e => e.examId !== examId);
            setExams(updatedExams);

            // Adjust page if current page becomes empty
            const newTotalPages = Math.ceil(updatedExams.length / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
        } catch (error) {
            console.error("Error deleting exam:", error);
            toast.error("시험 삭제 중 오류가 발생했습니다.");
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

    // Pagination Logic
    const sortedExams = [...exams].sort((a, b) => b.examId - a.examId);
    const totalPages = Math.ceil(sortedExams.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentExams = sortedExams.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <InstructorNav />
            <div className="container mx-auto py-10 max-w-6xl flex-1">
                {/* ... (Header) ... */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">시험 결과 / 관리</h1>
                        <p className="text-gray-500 mt-2">
                            등록된 시험 목록을 조회하고 수정/삭제, 또는 응시 결과를 확인할 수 있습니다.
                        </p>
                    </div>
                    <Button onClick={() => navigate("/instructor/exam/new")} className="gap-2 rounded-none bg-primary hover:bg-primary/90 text-white">
                        <Plus className="w-4 h-4" />
                        새 시험 등록
                    </Button>
                </div>

                <Card className="rounded-none border border-border shadow-none">
                    <CardHeader className="pb-2 border-b border-border bg-white">
                        <CardTitle className="text-gray-900">등록된 시험 목록</CardTitle>
                        <CardDescription>총 {exams.length}개의 시험이 등록되어 있습니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : exams.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                등록된 시험이 없습니다.
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[60px]">ID</TableHead>
                                            <TableHead>강좌명</TableHead>
                                            <TableHead>시험 제목</TableHead>
                                            <TableHead className="w-[100px]">난이도</TableHead>
                                            <TableHead className="w-[100px]">제한시간</TableHead>
                                            <TableHead className="w-[100px]">합격점수</TableHead>
                                            <TableHead className="text-right">관리</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentExams.map((exam) => (
                                            <TableRow key={exam.examId}>
                                                <TableCell className="font-medium">{exam.examId}</TableCell>
                                                <TableCell className="text-muted-foreground">{exam.courseTitle}</TableCell>
                                                <TableCell>
                                                    <span className="font-semibold block">{exam.title}</span>
                                                    <span className="text-xs text-muted-foreground">문항 수: {exam.questions ? exam.questions.length : 0}개</span>
                                                </TableCell>
                                                <TableCell>{getLevelBadge(exam.level)}</TableCell>
                                                <TableCell>{exam.timeLimit}분</TableCell>
                                                <TableCell>{exam.passScore}점</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/instructor/exam/${exam.examId}`)}
                                                    >
                                                        상세/수정
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/instructor/exam/${exam.examId}/results`)}
                                                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                                    >
                                                        결과 보기
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                        onClick={() => handleDelete(exam.examId)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination Controls */}
                                {totalPages >= 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-8 border-t pt-8">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="h-9 px-3 rounded-none border-gray-300"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(page)}
                                                className={`h-9 w-9 rounded-none border ${currentPage === page ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                                            >
                                                {page}
                                            </Button>
                                        ))}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="h-9 px-3 rounded-none border-gray-300"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Tail />
        </div>
    );
};

export default ExamList;
