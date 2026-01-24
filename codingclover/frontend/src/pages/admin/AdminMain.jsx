import React, { useState } from 'react';
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

function AdminMain() {

    const [course, setCourse ] = useState({
        level: '123' ,
        title: '123' ,
        created_by: '123',
        proposal_status: ['PENDING', 'APPROVED', 'REJECTED'],
    })

    axios.get('admin/dashboard', {
        level: '123' ,
        title: '123' ,
        created_by: '123',
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
                                <TableHead>등급</TableHead>
                                <TableHead>강좌명</TableHead>
                                <TableHead>강사</TableHead>
                                <TableHead>승인상태</TableHead>
                            </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                                <TableCell>{course.level}</TableCell>
                                <TableCell>{course.title}</TableCell>
                                <TableCell>{course.created_by}</TableCell>
                                <TableCell>{course.proposal_status}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </section>
            <Tail />
        </>
    )
}

export default AdminMain;