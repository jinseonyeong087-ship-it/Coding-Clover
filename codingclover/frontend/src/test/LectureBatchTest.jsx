import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const LectureBatchTest = () => {
    const [pendingLectures, setPendingLectures] = useState([]); // 대기 중인 강의 목록
    const [selectedIds, setSelectedIds] = useState([]);        // 체크된 강의 ID들

    // 1. 승인 대기 중인 강의 목록 가져오기
    const fetchPendingLectures = async () => {
        try {
            const response = await axios.get('/admin/lectures/pending');
            setPendingLectures(response.data);
        } catch (error) {
            console.error("목록 로딩 실패:", error);
            alert("강의 목록을 가져오는데 실패했습니다.");
        }
    };

    useEffect(() => {
        fetchPendingLectures();
    }, []);

    // 2. 체크박스 선택/해제 로직
    const handleCheck = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // 3. 일괄 승인 요청
    const handleBatchApprove = async () => {
        if (selectedIds.length === 0) return alert("승인할 강의를 선택하세요.");

        try {
            const response = await axios.post('/admin/lectures/batch-approve', {
                lectureIds: selectedIds
            });
            alert(response.data);
            setSelectedIds([]); // 선택 초기화
            fetchPendingLectures(); // 목록 갱신
        } catch (error) {
            alert("승인 처리 중 오류 발생");
        }
    };

    // 4. 일괄 반려 요청
    const handleBatchReject = async () => {
        if (selectedIds.length === 0) return alert("반려할 강의를 선택하세요.");
        const reason = prompt("반려 사유를 입력하세요:"); // 간단한 입력창

        if (!reason) return alert("사유를 입력해야 반려가 가능합니다.");

        try {
            const response = await axios.post('/admin/lectures/batch-reject', {
                lectureIds: selectedIds,
                rejectReason: reason
            });
            alert(response.data);
            setSelectedIds([]);
            fetchPendingLectures();
        } catch (error) {
            alert("반려 처리 중 오류 발생");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <Nav />
            <div className="py-8" />
            <div className="container mx-auto px-4 py-16">
                <Card className="max-w-6xl mx-auto shadow-xl bg-white/80 backdrop-blur-xl border-white/60">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            관리자 강의 승인 테스트
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleBatchApprove}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                선택 일괄 승인
                            </Button>
                            <Button
                                onClick={handleBatchReject}
                                variant="destructive"
                            >
                                선택 일괄 반려
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-[50px] text-center">선택</TableHead>
                                        <TableHead className="text-center">강의 ID</TableHead>
                                        <TableHead>제목</TableHead>
                                        <TableHead className="text-center">강사</TableHead>
                                        <TableHead className="text-center">상태</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingLectures.length > 0 ? (
                                        pendingLectures.map(lecture => (
                                            <TableRow key={lecture.lectureId} className="hover:bg-slate-50/50">
                                                <TableCell className="text-center">
                                                    <Checkbox
                                                        checked={selectedIds.includes(lecture.lectureId)}
                                                        onCheckedChange={() => handleCheck(lecture.lectureId)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center font-medium">{lecture.lectureId}</TableCell>
                                                <TableCell>{lecture.title}</TableCell>
                                                <TableCell className="text-center">{lecture.createdByName}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                        {lecture.approvalStatus}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan="5" className="h-24 text-center text-slate-500">
                                                대기 중인 강의가 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Tail />
        </div>
    );
};

export default LectureBatchTest;