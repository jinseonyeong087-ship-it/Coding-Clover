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
// Checkbox import removed
// AlertDialog imports removed
import axios from 'axios';


function AdminLectureList() {

    const [lectures, setLectures] = useState([]);

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
                </div>

                <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                {/* Checkbox column removed */}
                                {/* Checkbox column removed */}
                                <TableHead className="text-center w-[50px]">No.</TableHead>
                                <TableHead className="text-center">강좌명</TableHead>
                                <TableHead className="text-center">강의명</TableHead>
                                <TableHead className="text-center w-[120px]">강사명</TableHead>
                                <TableHead className="text-center w-[80px]">순서</TableHead>
                                <TableHead className="text-center w-[150px]">예약유무</TableHead>

                                <TableHead className="text-center w-[100px]">재생시간</TableHead>
                                <TableHead className="text-center w-[100px]">상태</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lectures && lectures.length > 0 ? (
                                // 최신순 정렬 (ID 기준 내림차순)
                                [...lectures].sort((a, b) => b.lectureId - a.lectureId).map((item, index) => {
                                    const uniqueKey = item.lectureId || `lecture-idx-${index}`;

                                    // 예약 시간 처리 로직
                                    let reservationDisplay = '-';
                                    if (item.scheduledAt) {
                                        const scheduledDate = new Date(item.scheduledAt);
                                        const now = new Date();
                                        if (scheduledDate > now) {
                                            const datePart = scheduledDate.toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: 'numeric',
                                                day: 'numeric'
                                            });
                                            const timePart = scheduledDate.toLocaleTimeString('ko-KR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            });
                                            reservationDisplay = (
                                                <div className="flex flex-col items-center leading-tight">
                                                    <span>{datePart}</span>
                                                    <span>{timePart}</span>
                                                </div>
                                            );
                                        }
                                    }

                                    return (
                                        <TableRow key={uniqueKey} className="h-16 hover:bg-muted/30 transition-colors">
                                            {/* Checkbox cell removed */}
                                            <TableCell className="text-center text-muted-foreground w-[50px]">
                                                {lectures.length - index}
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {item.courseTitle || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    to={`/admin/lectures/${item.lectureId}`}
                                                    className="font-medium hover:text-primary transition-colors flex items-center justify-center gap-2"
                                                >
                                                    {item.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.instructorName || '-'}
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-foreground/80">
                                                {item.orderNo != null ? item.orderNo : '-'}
                                            </TableCell>
                                            <TableCell className="text-center text-sm">
                                                {reservationDisplay}
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
                                    <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                                        등록된 강의가 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
            <Tail />
        </>
    );
}

export default AdminLectureList;
