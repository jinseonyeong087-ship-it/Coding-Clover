import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
import AdminSidebar from "@/components/AdminSidebar";
import Tail from "@/components/Tail";
import { Link, useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, User, BookOpen, AlertCircle, Search, LayoutGrid, Activity, Zap, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function AdminExamList() {
    const [exams, setExams] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [levelFilter, setLevelFilter] = useState(null); // null = All, 1, 2, 3
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/admin/exams', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then((resData) => {
                console.log("시험 데이터 로드 성공", resData);
                setExams(resData);
            })
            .catch((error) => console.error('시험 데이터 로딩 실패', error));
    }, []);

    // Filtering Logic
    const filteredExams = exams.filter(exam => {
        const matchesLevel = levelFilter === null || exam.level === levelFilter;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            exam.title.toLowerCase().includes(searchLower) ||
            exam.courseTitle.toLowerCase().includes(searchLower) ||
            exam.instructorName.toLowerCase().includes(searchLower);

        return matchesLevel && matchesSearch;
    });

    // Pagination Logic
    const sortedExams = [...filteredExams].sort((a, b) => b.examId - a.examId);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedExams.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedExams.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <>
            <Nav />
            <div className="min-h-screen bg-white pt-20 pb-20">
                <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-8">
                    <AdminSidebar />
                    <main className="flex-1 min-w-0">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                <ClipboardList className="h-8 w-8 text-primary" />
                                시험 관리
                            </h1>
                            <p className="text-gray-500">
                                관리자는 모든 강좌의 시험을 조회하고 수정 요청 또는 삭제할 수 있습니다.
                            </p>
                        </div>

                        {/* Quick Filter Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <Card
                                className={`p-4 bg-white border-border rounded-none shadow-none flex items-center gap-4 cursor-pointer transition-all hover:bg-slate-50 ${levelFilter === null ? 'ring-2 ring-primary border-primary' : ''}`}
                                onClick={() => { setLevelFilter(null); setCurrentPage(1); }}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                                    <LayoutGrid className="h-5 w-5 text-slate-600" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-lg font-bold text-gray-900 leading-none">{exams.length}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">전체 시험</div>
                                </div>
                            </Card>
                            <Card
                                className={`p-4 bg-white border-border rounded-none shadow-none flex items-center gap-4 cursor-pointer transition-all hover:bg-emerald-50 ${levelFilter === 1 ? 'ring-2 ring-emerald-500 border-emerald-500' : ''}`}
                                onClick={() => { setLevelFilter(1); setCurrentPage(1); }}
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <Activity className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-lg font-bold text-gray-900 leading-none">{exams.filter(e => e.level === 1).length}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">초급</div>
                                </div>
                            </Card>
                            <Card
                                className={`p-4 bg-white border-border rounded-none shadow-none flex items-center gap-4 cursor-pointer transition-all hover:bg-blue-50 ${levelFilter === 2 ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                                onClick={() => { setLevelFilter(2); setCurrentPage(1); }}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-lg font-bold text-gray-900 leading-none">{exams.filter(e => e.level === 2).length}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">중급</div>
                                </div>
                            </Card>
                            <Card
                                className={`p-4 bg-white border-border rounded-none shadow-none flex items-center gap-4 cursor-pointer transition-all hover:bg-rose-50 ${levelFilter === 3 ? 'ring-2 ring-rose-500 border-rose-500' : ''}`}
                                onClick={() => { setLevelFilter(3); setCurrentPage(1); }}
                            >
                                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                                    <Trophy className="h-5 w-5 text-rose-600" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-lg font-bold text-gray-900 leading-none">{exams.filter(e => e.level === 3).length}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">고급</div>
                                </div>
                            </Card>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="시험 제목, 강좌명 또는 강사명으로 검색..."
                                className="pl-10 h-12 rounded-none border-border shadow-none focus-visible:ring-primary"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <Card className="rounded-none border-border shadow-none overflow-hidden bg-white">
                            <Table>
                                <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-center w-[80px] text-gray-600 font-bold">ID</TableHead>
                                        <TableHead className="text-gray-600 font-bold">강좌명</TableHead>
                                        <TableHead className="text-gray-600 font-bold">시험 제목</TableHead>
                                        <TableHead className="text-center w-[120px] text-gray-600 font-bold">강사명</TableHead>
                                        <TableHead className="text-center w-[100px] text-gray-600 font-bold">난이도</TableHead>
                                        <TableHead className="text-center w-[100px] text-gray-600 font-bold">합격기준</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((item) => (
                                            <TableRow key={item.examId} className="hover:bg-gray-50/50 transition-colors h-16 cursor-pointer" onClick={() => navigate(`/admin/exam/${item.examId}`)}>
                                                <TableCell className="text-center font-mono text-xs text-gray-400">
                                                    {item.examId}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            {item.reuploaded && (
                                                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold px-1.5 py-0">재업로드</Badge>
                                                            )}
                                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                <BookOpen className="h-3 w-3" />
                                                                {item.courseTitle}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-gray-900">
                                                    {item.title}
                                                </TableCell>
                                                <TableCell className="text-center text-gray-600">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {item.instructorName}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {item.level === 1 ? <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">초급</Badge> :
                                                        item.level === 2 ? <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">중급</Badge> :
                                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">고급</Badge>}
                                                </TableCell>
                                                <TableCell className="text-center text-gray-500 text-sm">
                                                    {item.passScore}점
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-20 text-gray-400">
                                                등록된 시험이 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>

                        {/* Pagination */}
                        {totalPages >= 1 && (
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
                    </main>
                </div>
            </div>
            <Tail />
        </>
    );
}

export default AdminExamList;
