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
            <section className="container mx-auto px-16 py-24">
                <Table>
                    <TableCaption className="text-left text-foreground font-semibold text-lg caption-top px-4">신규강사</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-4 py-3 text-center">가입번호</TableHead>
                            <TableHead className="px-4 py-3 text-center">강사명</TableHead>
                            <TableHead className="px-4 py-3 text-center">승인상태</TableHead>
                        </TableRow>
                    </TableHeader>
                    {/* id, 강사명, 승인상태  */}
                    <TableBody>
                        {status && status.length > 0 ? (
                            status.map((users, index) => {
                                const uniqueKey = users.userId || `user-idx-${index}`;
                                return (
                                    <TableRow key={uniqueKey}>
                                        <TableCell className="px-4 py-3 text-center">{users.userId}</TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <Link to={`/admin/users/instructors/${users.userId}`} className="hover:underline">
                                                {users.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            {users.status === 'ACTIVE' ? (
                                                <Badge variant="secondary">승인 완료</Badge>
                                            ) : users.status === 'SUSPENDED' ? (
                                                <Badge variant="destructive">승인 필요</Badge>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-10">
                                    승인할 강사가 없습니다.
                                </TableCell>
                            </TableRow>)}
                    </TableBody>
                </Table>
            </section>

            <Tail />
        </>

    )
}

export default AdminInstructorList;