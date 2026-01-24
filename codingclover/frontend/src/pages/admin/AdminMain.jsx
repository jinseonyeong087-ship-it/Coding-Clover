import React, { useState, useEffect } from "react";
import AdminNav from "@/components/AdminNav";
import Tail from "@/components/Tail";
import { Link, Route } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import axios from "axios";


function AdminMain() {

    /**id, 난이도, 강좌명, 강사명, 승인상태 */
    const [course, setCourse] = useState([]);

    useEffect(() => {
        axios.get('/admin/dashboard')
            .then((response) => {
                const realData = response.data.list || response.data.courses || response.data;
                setCourse(Array.isArray(realData) ? realData : [realData]);
                console.log("실제 데이터:", realData);
            })
            .catch((err) => {
                console.log('실패', err);
                if (err.response?.status === 401) {
                    alert("로그인 정보가 없습니다.")
                } else if (err.response?.status === 500) {
                    alert("서버가 응답하지 않습니다.")
                }

            })
    }, []);


    // 'PENDING'=보류, 'APPROVED'=생존, 'REJECTED'=탈락

    // 강좌 승인 백엔파일을 찾아라

    return (
        <>
            <AdminNav />
            <section className="container mx-auto px-4 py-16">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>생성번호</TableHead>
                            <TableHead>강좌명</TableHead>
                            <TableHead>난이도</TableHead>
                            <TableHead>승인상태</TableHead>
                        </TableRow>
                    </TableHeader>
                    {/* id, 난이도, 강좌명, 강사명, 승인상태  */}
                    <TableBody>
                        {course.map((item, index) => {
                            const rowKey = item.courseId ? item.course_id : `course-${index}`;
                            return (
                                <TableRow key={item.courseId}>
                                    <TableCell>{item.courseId}</TableCell>
                                    <TableCell>
                                        <Link to={`/admin/course/${item.courseId}`}>{item.title}</Link>
                                    </TableCell>
                                    <TableCell>{item.level}</TableCell>
                                    <TableCell>
                                        {item.proposalStatus === 'PENDING' ? (
                                            <Badge variant="destructive">승인 필요</Badge>
                                        ) : (
                                            <Badge variant="secondary">승인 완료</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </section>
            <Tail />
        </>
    )
}

export default AdminMain;