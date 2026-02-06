import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import { Link, useParams } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function AdminCourseList() {

    const [course, setCourse] = useState([]);

    useEffect(() => {
        // 강좌 목록 조회
        fetch('/admin/course', {
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
                console.log("강좌 데이터 로드 성공", resData);
                if (Array.isArray(resData)) {
                    setCourse(resData);
                } else if (resData && typeof resData === 'object') {
                    const list = resData.content || resData.list || [resData];
                    setCourse(Array.isArray(list) ? list : [list]);
                }
            })
            .catch((error) => {
                console.error('강좌 데이터 로딩 실패', error);
            });
    }, [])

    // 생성 후 24시간 이내면 NEW 배지 표시
    const isNewCourse = (createdAt) => {
        if (!createdAt) return false;

        const created = new Date(createdAt);
        const now = new Date();

        // 24시간 기준
        return (now - created) <= 1000 * 60 * 60 * 24;
    };

    return (
        <>
            {/* Background Decoration */}
            <div className="fixed inset-0 z-[-1] bg-background">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="pt-24 pb-20 container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-2">
                            Course Management
                        </h1>
                        <p className="text-muted-foreground">
                            전체 강좌 목록을 관리하고 승인 상태를 변경할 수 있습니다.
                        </p>
                    </div>
                </div>

                <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-center w-[100px]">ID</TableHead>
                                <TableHead className="text-center">강좌명</TableHead>
                                <TableHead className="text-center w-[150px]">강사명</TableHead>
                                <TableHead className="text-center w-[100px]">난이도</TableHead>
                                <TableHead className="text-center w-[100px]">상태</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {course && course.length > 0 ? (
                                course.map((item, index) => {
                                    const uniqueKey = item.courseId || `course-idx-${index}`;
                                    return (
                                        <TableRow key={uniqueKey} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                                {item.courseId}
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    to={`/admin/course/${item.courseId}`}
                                                    className="font-medium hover:text-primary transition-colors flex items-center justify-center gap-2"
                                                >
                                                    {item.title}
                                                    {isNewCourse(item.createdAt) && (
                                                        <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm">N</span>
                                                    )}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-foreground/80">
                                                {item.instructorName}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.level === 1 ? (
                                                    <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">초급</Badge>
                                                ) : item.level === 2 ? (
                                                    <Badge variant="outline" className="text-primary border-primary/30">중급</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-purple-500 border-purple-500/30">고급</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.proposalStatus === 'PENDING' ? (
                                                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">승인 필요</Badge>
                                                ) : item.proposalStatus === 'APPROVED' ? (
                                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">승인 완료</Badge>
                                                ) : (
                                                    <Badge variant="outline">반려됨</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                                        등록된 강좌가 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
            <Tail />
        </>
    )

}

export default AdminCourseList;