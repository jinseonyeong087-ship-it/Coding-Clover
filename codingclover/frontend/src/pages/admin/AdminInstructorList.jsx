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
import { BookOpen } from "lucide-react";

function AdminInstructorList() {

    const [course, setCourse] = useState([]);
    const [status, setStatus] = useState([]);
    const [lecture, setLecture] = useState([]);

    useEffect(() => {
        fetch('/admin/users/instructors', {
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
            .then((data) => {
                console.log("강사 데이터 로드 성공", data);
                setStatus(data);
            })
            .catch((error) => {
                console.error('강사 데이터 로딩 실패', error);
            });
    }, [])



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
                            Instructor Management
                        </h1>
                        <p className="text-muted-foreground">
                            강사 목록을 관리하고 승인 상태를 변경할 수 있습니다.
                        </p>
                    </div>
                </div>

                <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-center w-[100px]">가입번호</TableHead>
                                <TableHead className="text-center">강사명</TableHead>
                                <TableHead className="text-center w-[150px]">승인상태</TableHead>
                                <TableHead className="text-center w-[150px]">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {status && status.length > 0 ? (
                                status.map((users, index) => {
                                    const uniqueKey = users.userId || `user-idx-${index}`;
                                    return (
                                        <TableRow key={uniqueKey} className="h-16 hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-center font-medium text-foreground/80">{users.userId}</TableCell>
                                            <TableCell className="text-center font-medium">
                                                <Link to={`/admin/users/instructors/${users.userId}`} className="hover:text-primary transition-colors">
                                                    {users.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {users.status === 'ACTIVE' ? (
                                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">승인 완료</Badge>
                                                ) : users.status === 'SUSPENDED' ? (
                                                    <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">승인 필요</Badge>
                                                ) : (
                                                    <Badge variant="outline">{users.status}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Link to={`/admin/users/instructors/${users.userId}/courses`}>
                                                    <Button variant="outline" size="sm" className="h-8 border-primary/20 hover:bg-primary/5 hover:text-primary">
                                                        <BookOpen className="w-4 h-4 mr-1.5" />
                                                        강좌 목록
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                                        승인할 강사가 없습니다.
                                    </TableCell>
                                </TableRow>)}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <Tail />
        </>

    )
}

export default AdminInstructorList;