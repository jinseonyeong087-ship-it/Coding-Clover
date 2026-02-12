import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, AlertCircle, Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";

const AdminExamList = () => {
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // ... (existing modal states) ...
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

    const handleDeleteClick = (exam) => {
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
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
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

    // Reset to page 1 when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">시험 관리</h1>
                    <p className="text-muted-foreground mt-2">
                        등록된 모든 시험을 조회하고 삭제할 수 있습니다.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>시험 목록 ({filteredExams.length})</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                placeholder="시험, 강좌, 강사 검색..."
                                className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60px]">ID</TableHead>
                                <TableHead>시험 제목</TableHead>
                                <TableHead>강좌명</TableHead>
                                <TableHead>출제 강사</TableHead>
                                <TableHead>난이도</TableHead>
                                <TableHead className="text-right">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        로딩 중...
                                    </TableCell>
                                </TableRow>
                            ) : currentExams.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        검색 결과가 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentExams.map((exam) => (
                                    <TableRow
                                        key={exam.examId}
                                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => handleViewClick(exam)}
                                    >
                                        <TableCell>{exam.examId}</TableCell>
                                        <TableCell className="font-medium">{exam.title}</TableCell>
                                        <TableCell>{exam.courseTitle}</TableCell>
                                        <TableCell>{exam.instructorName}</TableCell>
                                        <TableCell>
                                            <Badge variant={exam.level === 1 ? "secondary" : exam.level === 2 ? "default" : "destructive"}>
                                                {exam.level === 1 ? "초급" : exam.level === 2 ? "중급" : "고급"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => handleDeleteClick(exam)}
                                                    title="삭제"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    {filteredExams.length > itemsPerPage && (
                        <div className="flex justify-center items-center gap-4 mt-6">
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
                </CardContent>
            </Card>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent onClick={(e) => e.stopPropagation()}>
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
                                                <span className="font-bold text-indigo-600 shrink-0">Q{idx + 1}.</span>
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
        </div>
    );
};

export default AdminExamList;
