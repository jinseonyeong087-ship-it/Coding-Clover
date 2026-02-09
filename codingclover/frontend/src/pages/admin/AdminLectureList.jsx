import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import { Link } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from 'axios';

function AdminLectureList() {

    const [lectures, setLectures] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [batchRejectReason, setBatchRejectReason] = useState("");
    const [isBatchRejectDialogOpen, setIsBatchRejectDialogOpen] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");
    const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);

    const fetchLectures = () => {
        fetch('/admin/lectures', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((resData) => {
                console.log("강의 데이터 로드 성공", resData);
                if (Array.isArray(resData)) {
                    setLectures(resData);
                } else if (resData && typeof resData === 'object') {
                    const list = resData.content || resData.list || [resData];
                    setLectures(Array.isArray(list) ? list : [list]);
                }
            })
            .catch((error) => {
                console.error('강의 데이터 로딩 실패', error);
            });
    };

    useEffect(() => {
        fetchLectures();
    }, []);

    // 체크박스 선택/해제
    const handleCheck = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // 전체 선택/해제
    const handleSelectAll = () => {
        if (selectedIds.length === lectures.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(lectures.map(item => item.lectureId));
        }
    };

    // 선택된 강의 중 일괄 처리 가능한 항목 검증 (승인 대기 + URL 있음)
    const validateSelected = () => {
        const selected = lectures.filter(l => selectedIds.includes(l.lectureId));
        const invalid = selected.filter(l => l.approvalStatus !== 'PENDING' || !l.videoUrl);
        return { selected, invalid };
    };

    // 일괄 승인
    const handleBatchApprove = async () => {
        if (selectedIds.length === 0) return;
        const { invalid } = validateSelected();
        if (invalid.length > 0) {
            const reasons = [];
            const notPending = invalid.filter(l => l.approvalStatus !== 'PENDING');
            const noUrl = invalid.filter(l => !l.videoUrl);
            if (notPending.length > 0) reasons.push(`승인 대기 상태가 아닌 강의 ${notPending.length}건`);
            if (noUrl.length > 0) reasons.push(`URL이 없는 강의 ${noUrl.length}건`);
            setWarningMessage(`일괄 승인할 수 없는 강의가 포함되어 있습니다.\n(${reasons.join(', ')})\n\n승인 대기 상태이며 URL이 있는 강의만 일괄 승인이 가능합니다.`);
            setIsWarningDialogOpen(true);
            return;
        }
        try {
            const response = await axios.post('/admin/lectures/batch-approve', {
                lectureIds: selectedIds
            });
            alert(response.data);
            setSelectedIds([]);
            fetchLectures();
        } catch (error) {
            alert("승인 처리 중 오류 발생");
        }
    };

    // 일괄 반려 다이얼로그 열기 전 검증 (승인 대기 + URL 없는 강의만 반려 가능)
    const openBatchRejectDialog = () => {
        if (selectedIds.length === 0) return;
        const selected = lectures.filter(l => selectedIds.includes(l.lectureId));
        const invalid = selected.filter(l => l.approvalStatus !== 'PENDING' || l.videoUrl);
        if (invalid.length > 0) {
            const reasons = [];
            const notPending = invalid.filter(l => l.approvalStatus !== 'PENDING');
            const hasUrl = invalid.filter(l => l.videoUrl);
            if (notPending.length > 0) reasons.push(`승인 대기 상태가 아닌 강의 ${notPending.length}건`);
            if (hasUrl.length > 0) reasons.push(`URL이 있는 강의 ${hasUrl.length}건`);
            setWarningMessage(`일괄 반려할 수 없는 강의가 포함되어 있습니다.\n(${reasons.join(', ')})\n\n승인 대기 상태이며 URL이 없는 강의만 일괄 반려가 가능합니다.`);
            setIsWarningDialogOpen(true);
            return;
        }
        setIsBatchRejectDialogOpen(true);
    };

    // 일괄 반려
    const handleBatchReject = async () => {
        if (!batchRejectReason.trim()) {
            alert("반려 사유를 입력해주세요.");
            return;
        }
        try {
            const response = await axios.post('/admin/lectures/batch-reject', {
                lectureIds: selectedIds,
                rejectReason: batchRejectReason
            });
            alert(response.data);
            setSelectedIds([]);
            setBatchRejectReason("");
            setIsBatchRejectDialogOpen(false);
            fetchLectures();
        } catch (error) {
            alert("반려 처리 중 오류 발생");
        }
    };

    const getApprovalBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">승인 대기</Badge>;
            case 'APPROVED':
                return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">승인 완료</Badge>;
            case 'REJECTED':
                return <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">반려됨</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getUrlBadge = (videoUrl) => {
        return videoUrl
            ? <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">있음</Badge>
            : <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">없음</Badge>;
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '-';
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}분 ${sec > 0 ? sec + '초' : ''}`.trim();
    };

    return (
        <>
            <Nav />
            {/* Background Decoration */}
            <div className="fixed inset-0 z-[-1] bg-background">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="pt-24 pb-20 container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-2">
                            Lecture Management
                        </h1>
                        <p className="text-muted-foreground">
                            전체 강의 목록을 관리하고 승인 상태를 변경할 수 있습니다.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedIds.length > 0 && (
                            <span className="text-sm text-muted-foreground mr-2">
                                {selectedIds.length}건 선택
                            </span>
                        )}
                        <Button
                            onClick={handleBatchApprove}
                            disabled={selectedIds.length === 0}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            일괄 승인
                        </Button>
                        <Button
                            onClick={openBatchRejectDialog}
                            disabled={selectedIds.length === 0}
                            variant="destructive"
                        >
                            일괄 반려
                        </Button>
                    </div>
                </div>

                <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-center w-[50px]">
                                    <Checkbox
                                        checked={lectures.length > 0 && selectedIds.length === lectures.length}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-center w-[80px]">ID</TableHead>
                                <TableHead className="text-center">강의명</TableHead>
                                <TableHead className="text-center w-[80px]">강좌 ID</TableHead>
                                <TableHead className="text-center w-[80px]">순서</TableHead>
                                <TableHead className="text-center w-[80px]">예약유무</TableHead>
                                <TableHead className="text-center w-[100px]">URL</TableHead>
                                <TableHead className="text-center w-[100px]">재생시간</TableHead>
                                <TableHead className="text-center w-[100px]">상태</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lectures && lectures.length > 0 ? (
                                lectures.map((item, index) => {
                                    const uniqueKey = item.lectureId || `lecture-idx-${index}`;
                                    return (
                                        <TableRow key={uniqueKey} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-center">
                                                <Checkbox
                                                    checked={selectedIds.includes(item.lectureId)}
                                                    onCheckedChange={() => handleCheck(item.lectureId)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                                {item.lectureId}
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    to={`/admin/lectures/${item.lectureId}`}
                                                    className="font-medium hover:text-primary transition-colors flex items-center justify-center gap-2"
                                                >
                                                    {item.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                                {item.courseId || '-'}
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-foreground/80">
                                                {item.orderNo != null ? item.orderNo : '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.reservationDate ? new Date(item.reservationDate).toLocaleString('ko-KR') : '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getUrlBadge(item.videoUrl)}
                                            </TableCell>
                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                {formatDuration(item.duration)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getApprovalBadge(item.approvalStatus)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-16 text-muted-foreground">
                                        등록된 강의가 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* 일괄 반려 다이얼로그 */}
            <AlertDialog open={isBatchRejectDialogOpen} onOpenChange={setIsBatchRejectDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>일괄 반려</AlertDialogTitle>
                        <AlertDialogDescription>
                            선택한 {selectedIds.length}건의 강의를 반려합니다. 반려 사유를 입력해주세요.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        placeholder="반려 사유를 입력하세요."
                        value={batchRejectReason}
                        onChange={(e) => setBatchRejectReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBatchRejectReason("")}>
                            취소
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBatchReject}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            반려
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 경고 다이얼로그 */}
            <AlertDialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>처리 불가</AlertDialogTitle>
                        <AlertDialogDescription className="whitespace-pre-line">
                            {warningMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setIsWarningDialogOpen(false)}>
                            확인
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Tail />
        </>
    );
}

export default AdminLectureList;
