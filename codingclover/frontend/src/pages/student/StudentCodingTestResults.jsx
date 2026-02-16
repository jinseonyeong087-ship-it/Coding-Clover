import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Code2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

const StudentCodingTestResults = () => {
    const navigate = useNavigate();
    const [codingTestHistory, setCodingTestHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchCodingTestHistory();
    }, []);

    const fetchCodingTestHistory = async () => {
        try {
            setLoading(true);

            // 사용자 정보 가져오기
            const storedUsers = localStorage.getItem("users");
            if (!storedUsers) {
                console.error('사용자 정보가 없습니다.');
                setCodingTestHistory([]);
                return;
            }

            const userData = JSON.parse(storedUsers);
            const userId = userData.userId;

            if (!userId) {
                console.error('사용자 ID가 없습니다.');
                setCodingTestHistory([]);
                return;
            }

            // submission 테이블에서 코딩테스트 내역 조회
            const response = await axios.get(`/api/submission/history?userId=${userId}`, { withCredentials: true });

            // submission 데이터를 코딩테스트 형태로 변환
            const formattedData = response.data.map(submission => ({
                resultId: submission.id,
                submissionId: submission.id, // submission ID 추가
                problemId: submission.problemId,
                title: submission.problemTitle,
                status: submission.status, // 원본 status 그대로 사용
                code: submission.code, // 사용자가 입력한 코드
                createdAt: submission.createdAt
            }));

            setCodingTestHistory(formattedData || []);
        } catch (err) {
            console.error('코딩 테스트 내역 조회 실패:', err);
            setCodingTestHistory([]);
        } finally {
            setLoading(false);
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(codingTestHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = codingTestHistory.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleViewProblem = (result) => {
        // 문제 페이지로 이동하면서 submission ID를 전달
        navigate(`/coding-test/${result.problemId}?submissionId=${result.submissionId}`);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'SOLVE':
            case 'PASS':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600 min-w-[60px] justify-center">합격</Badge>;
            case 'WRONG':
            case 'FAIL':
                return <Badge variant="destructive" className="min-w-[60px] justify-center">불합격</Badge>;
            case 'COMPILE_ERROR':
                return <Badge variant="destructive" className="min-w-[60px] justify-center">컴파일 오류</Badge>;
            case 'TIME_LIMIT':
                return <Badge variant="destructive" className="min-w-[60px] justify-center">시간초과</Badge>;
            default:
                return <Badge variant="destructive" className="min-w-[60px] justify-center">불합격</Badge>;
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
                            코딩테스트 내역
                        </h1>
                        <p className="text-lg text-gray-500">
                            응시한 코딩테스트 결과를 확인하고 코드를 다시 볼 수 있습니다.
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-6 py-12">
                <div className="max-w-6xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code2 className="w-5 h-5 text-blue-500" />
                                나의 코딩테스트 결과
                            </CardTitle>
                            <CardDescription>
                                총 {codingTestHistory.length}개의 제출 결과가 있습니다.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : codingTestHistory.length === 0 ? (
                                <div className="text-center py-20">
                                    <Code2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        응시한 코딩테스트가 없습니다.
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        코딩테스트에 도전해보세요!
                                    </p>
                                    <Button onClick={() => navigate('/coding-test')}>
                                        테스트 도전하기
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>테스트 제목</TableHead>
                                                <TableHead className="text-center">결과</TableHead>
                                                <TableHead className="text-center">응시일</TableHead>
                                                <TableHead className="text-right">문제 보기</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentItems.map((result) => (
                                                <TableRow key={result.resultId} className="hover:bg-gray-50/50">
                                                    <TableCell className="font-medium">
                                                        {result.title}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {getStatusBadge(result.status)}
                                                    </TableCell>
                                                    <TableCell className="text-center text-gray-500">
                                                        {new Date(result.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewProblem(result)}
                                                            className="text-gray-400 hover:text-primary"
                                                            title="내가 작성한 코드와 함께 문제 보기"
                                                        >
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {codingTestHistory.length > itemsPerPage && (
                                        <div className="flex justify-center items-center gap-4 mt-6 border-t pt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                이전
                                            </Button>
                                            <span className="text-sm text-muted-foreground">
                                                {currentPage} / {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
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
                </div>
            </main>
            <Tail />
        </div>
    );
};

export default StudentCodingTestResults;