import React, { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import Tail from '@/components/Tail';
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import axios from 'axios';

function AdminMain() {

    const [course, setCourse] = useState({
        course_id: '',
        level: '',
        title: '',
        created_by: '',
        proposal_status: '',
    })

    useEffect(() => {
        fetch('http://localhost:3333/admin/dashboard')
            .then(res => res.json())
            .then(data => setCourse())
            .catch(err => console.log('에러:', err))
    }, []);

    const [proposal, setProposal] = useState({ proposal_status: ['PENDING', 'APPROVED', 'REJECTED'] })

    axios.get('/admin/dashboard', {
        course_id: '',
        level: '',
        title: '',
        created_by: '',
        proposal_status: ['PENDING', 'APPROVED', 'REJECTED'],
    }.then((response) => {
        console.log("개설 신청 리스트를 가져왔습니다");
    })
        .then((err) => {
            console.log('실패', err);
            if (err.response ? status === 401 : null) {
                alert("로그인 정보가 없습니다.")
            } else if (err.response ? status === 500 : null) {
                alert("서버가 응답하지 않습니다.")
            }

        }))

    axios.post('/admin/dashboard', {
        proposal_status: ['PENDING', 'APPROVED', 'REJECTED'],
    })



    // 강좌 승인 백엔파일을 찾아라

    return (
        <>
            <AdminNav />
            <section className="container mx-auto px-4 py-16">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>생성번호</TableHead>
                            <TableHead>등급</TableHead>
                            <TableHead>강좌명</TableHead>
                            <TableHead>강사</TableHead>
                            <TableHead>승인상태</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{course.course_id}</TableCell>
                            <TableCell>{course.level}</TableCell>
                            <TableCell>{course.title}</TableCell>
                            <TableCell>{course.created_by}</TableCell>
                            <TableCell>
                                <DropdownMenu>{course.proposal_status}</DropdownMenu>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </section>
            <Tail />
        </>
    )
}

export default AdminMain;