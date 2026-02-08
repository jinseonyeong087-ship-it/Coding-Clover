import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InstructorNav from '../../components/InstructorNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ExamResult = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
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

    return (
        <div className="min-h-screen bg-gray-50/50">
            <InstructorNav />
            <div className="container mx-auto py-10 max-w-5xl">
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
                                    {attempts.map((attempt, index) => (
                                        <TableRow key={attempt.attemptId}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{attempt.userName}</TableCell>
                                            <TableCell>{attempt.attemptNo}회차</TableCell>
                                            <TableCell>{attempt.score}점</TableCell>
                                            <TableCell>
                                                {attempt.passed ? (
                                                    <Badge className="bg-emerald-500 hover:bg-emerald-600">합격</Badge>
                                                ) : (
                                                    <Badge variant="destructive">불합격</Badge>
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
            </div>
        </div>
    );
};

export default ExamResult;
