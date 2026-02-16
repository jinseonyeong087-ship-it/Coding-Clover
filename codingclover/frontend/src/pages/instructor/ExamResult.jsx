import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InstructorNav from '../../components/InstructorNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import Tail from '@/components/Tail';
import { toast } from "sonner";

const ExamResult = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [examTitle, setExamTitle] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch exam details for title
                const examResponse = await axios.get(`/instructor/exam/${examId}`);
                setExamTitle(examResponse.data.title);

                // Fetch attempts
                const attemptsResponse = await axios.get(`/instructor/exam/${examId}/attempts`);
                setAttempts(attemptsResponse.data);
            } catch (error) {
                console.error("Error fetching results:", error);
                toast.error("시험 결과를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [examId]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Sorting and Pagination Logic
    const sortedAttempts = [...attempts].sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentAttempts = sortedAttempts.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(sortedAttempts.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <InstructorNav />
            <div className="container mx-auto py-10 max-w-5xl flex-1">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/instructor/exam/list')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">시험 결과 조회</h1>
                        <p className="text-muted-foreground">
                            {examTitle} 시험의 수강생 응시 이력입니다.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>응시 목록</CardTitle>
                        <CardDescription>총 {attempts.length}명의 응시 기록이 있습니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : attempts.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                아직 응시한 학생이 없습니다.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>번호</TableHead>
                                        <TableHead>수강생 이름</TableHead>
                                        <TableHead>응시 차수</TableHead>
                                        <TableHead>점수</TableHead>
                                        <TableHead>결과</TableHead>
                                        <TableHead>응시 일시</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentAttempts.map((attempt, index) => (
                                        <TableRow key={attempt.attemptId} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="text-gray-400 font-mono text-xs">
                                                {sortedAttempts.length - (startIndex + index)}
                                            </TableCell>
                                            <TableCell className="font-medium">{attempt.userName}</TableCell>
                                            <TableCell>{attempt.attemptNo}회차</TableCell>
                                            <TableCell>{attempt.score}점</TableCell>
                                            <TableCell>
                                                {attempt.passed ? (
                                                    <Badge className="bg-emerald-500 hover:bg-emerald-600 min-w-[60px] justify-center">합격</Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="min-w-[60px] justify-center">불합격</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatDate(attempt.attemptedAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-8">
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
            </div>
            <Tail />
        </div>
    );
};

export default ExamResult;
