import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Nav from "@/components/Nav";
import AdminSidebar from "@/components/AdminSidebar";
import Tail from "@/components/Tail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Search, Plus, ListChecks, FileCheck, AlertCircle } from "lucide-react";

const AdminExamList = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/admin/exams");
            setExams(response.data);
        } catch (error) {
            console.error("Error fetching exams:", error);
            toast.error("시험 목록을 불러오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (examId) => {
        const exam = exams.find(e => e.examId === examId);
        setExamToDelete(exam);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!examToDelete) return;

        try {
            await axios.delete(`/admin/exam/${examToDelete.examId}`);
            toast.success("시험이 삭제되었습니다.");
            setExams(exams.filter(e => e.examId !== examToDelete.examId));
        } catch (error) {
            console.error("Error deleting exam:", error);
            toast.error("시험 삭제에 실패했습니다.");
        } finally {
            setDeleteModalOpen(false);
            setExamToDelete(null);
        }
    };

    const handleViewClick = (exam) => {
        setSelectedExam(exam);
        setDetailModalOpen(true);
    };

    // Filter exams
    const filteredExams = exams.filter(exam =>
        exam.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        exam.courseTitle.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (exam.instructorName && exam.instructorName.toLowerCase().includes(searchKeyword.toLowerCase()))
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentExams = filteredExams.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchKeyword]);

    return (
        <>
            <Nav />
            <div className="min-h-screen bg-gray-50 pt-20 pb-20">
                <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-8">

                    <AdminSidebar />

                    <main className="flex-1 min-w-0">
                        {/* 헤더 */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                시험 관리
                            </h1>
                            <p className="text-gray-500">
                                등록된 시험 목록을 확인하고 관리합니다.
                            </p>
                        </div>

                        {/* 통계 카드 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <ListChecks className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{exams.length}</div>
                                    <div className="text-xs text-gray-500 font-medium">전체 시험</div>
                                </div>
                            </Card>
                            <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <FileCheck className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {exams.filter(e => e.type === 'FINAL').length}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">기말 고사</div>
                                </div>
                            </Card>
                            <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {exams.filter(e => e.type === 'MIDTERM').length}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">중간 고사</div>
                                </div>
                            </Card>
                        </div>

                        {/* 필터 및 검색 */}
                        <Card className="p-6 bg-white border-gray-200 shadow-sm mb-8">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="시험 제목 또는 강좌명 검색..."
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        className="pl-9 bg-white border-gray-200 focus:ring-primary h-11"
                                    />
                                </div>
                                <Button className="h-11 px-6 shadow-sm font-bold bg-slate-900 hover:bg-slate-800 text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    시험 생성
                                </Button>
                            </div>
                        </Card>

                        {/* 테이블 */}
                        <Card className="bg-white border-gray-200 shadow-sm overflow-hidden mb-8">
                            <Table>
                                <TableHeader className="bg-gray-50 border-b border-gray-100">
                                    <TableRow>
                                        <TableHead className="text-center w-[100px] text-gray-600 font-bold">번호</TableHead>
                                        <TableHead className="text-center text-gray-600 font-bold">시험명</TableHead>
                                        <TableHead className="text-center text-gray-600 font-bold">강좌명</TableHead>
                                        <TableHead className="text-center w-[120px] text-gray-600 font-bold">유형</TableHead>
                                        <TableHead className="text-center w-[150px] text-gray-600 font-bold">생성일</TableHead>
                                        <TableHead className="text-center w-[120px] text-gray-600 font-bold">관리</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-20">
                                                <div className="flex justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : currentExams.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-20 text-gray-400">
                                                검색 결과가 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentExams.map((exam) => (
                                            <TableRow key={exam.examId} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="text-center font-mono text-xs text-gray-400">
                                                    {exam.examId}
                                                </TableCell>
                                                <TableCell className="text-center font-bold text-gray-900">
                                                    {exam.title}
                                                </TableCell>
                                                <TableCell className="text-center font-medium text-gray-600">
                                                    {exam.courseTitle}
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    <Badge variant="outline" className="border-gray-200 text-gray-600">
                                                        {exam.type === 'FINAL' ? '기말고사' : exam.type === 'MIDTERM' ? '중간고사' : '연습문제'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center text-sm text-gray-500">
                                                    {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '') : '-'}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-3 rounded-lg text-xs font-bold border-gray-200 text-gray-600"
                                                            onClick={(e) => { e.stopPropagation(); handleViewClick(exam); }}
                                                        >
                                                            상세
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-3 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-50"
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(exam.examId); }}
                                                        >
                                                            삭제
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="bg-white border-gray-200 text-gray-600 h-10 w-10"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`h-10 w-10 ${currentPage === pageNum ? "" : "bg-white border-gray-200 text-gray-600"}`}
                                        >
                                            {pageNum}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="bg-white border-gray-200 text-gray-600 h-10 w-10"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <Tail />

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            시험 삭제 확인
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            정말로 <strong>{examToDelete?.title}</strong> 시험을 삭제하시겠습니까?
                            <br />
                            <span className="text-red-500 mt-2 block text-xs">
                                ※ 이 시험에 연동된 모든 학생의 응시 기록과 성적 데이터가 함께 영구적으로 삭제됩니다.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>취소</Button>
                        <Button variant="destructive" onClick={confirmDelete}>삭제하기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Detail View Modal */}
            <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>시험 상세 정보</DialogTitle>
                    </DialogHeader>
                    {selectedExam && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                                <div>
                                    <span className="font-semibold text-slate-500 block mb-1">시험 제목</span>
                                    <p className="font-medium text-lg">{selectedExam.title}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-slate-500 block mb-1">강좌명</span>
                                    <p>{selectedExam.courseTitle}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-slate-500 block mb-1">출제 강사</span>
                                    <p>{selectedExam.instructorName}</p>
                                </div>
                                <div className="flex gap-4">
                                    <div>
                                        <span className="font-semibold text-slate-500 block mb-1">합격 기준</span>
                                        <p>{selectedExam.passScore}점</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-500 block mb-1">제한 시간</span>
                                        <p>{selectedExam.timeLimit}분</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-500 block mb-1">총 문제</span>
                                        <p>{selectedExam.questions?.length || 0}문제</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-3 text-lg">문제 목록</h4>
                                <div className="space-y-6">
                                    {selectedExam.questions?.map((q, idx) => (
                                        <div key={idx} className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                                            <div className="flex gap-2 mb-3">
                                                <span className="font-bold text-primary shrink-0">Q{idx + 1}.</span>
                                                <p className="font-medium text-slate-900 whitespace-pre-wrap">{q.questionText}</p>
                                            </div>

                                            <div className="ml-6 space-y-2 text-sm text-slate-700">
                                                {[1, 2, 3, 4, 5].map(num => (
                                                    <div key={num} className={`flex items-start gap-2 p-2 rounded ${q.correctAnswer === num ? 'bg-green-50 text-green-700 font-medium border border-green-100' : ''}`}>
                                                        <span className="w-5 h-5 flex items-center justify-center rounded-full border border-slate-300 text-xs shrink-0 bg-white">
                                                            {num}
                                                        </span>
                                                        <span>{q[`option${num}`]}</span>
                                                        {q.correctAnswer === num && <span className="ml-auto text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">정답</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setDetailModalOpen(false)}>닫기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AdminExamList;
