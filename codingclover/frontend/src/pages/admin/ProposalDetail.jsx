import React, { useState, useEffect, useForm } from "react";
import { Separator } from "@/components/ui/separator"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import axios from "axios";

function ProposalDetail() {

    const [course, setCourse] = useState([
        { course_id: '' },
        { level: '' },
        { title: '' },
        { created_by: '' },
        { description: '' },
        { proposal_status: '' },
    ])

    useEffect(() => {
        axios.get('/admin/dashboard', {
            course_id: course.course_id,
            level: course.level,
            title: course.title,
            created_by: course.created_by,
            description: course.description,
            proposal_status: course.proposal_status,
        }, { 
            headers: { 'Content-Type': 'application/json' }, 
        })
            .then((response) => {
            response => console.log(response.json())
            console.log("개설 신청 리스트를 가져왔습니다");
        })
            .catch((err) => {
                console.log('실패', err);
                if (err.response?.status === 401) {
                    console.log("로그인 정보가 없습니다.")
                } else if (err.response?.status === 500) {
                    console.log("서버가 응답하지 않습니다.")
                }

            })
    }, []);

    const { proposal, handleSubmit } = useForm();

    useEffect(() => {
        axios.post('/admin/dashboard', {
            proposal_status: course.proposal_status,
        }.then((response) => {
            response => console.log(response.json())
            console.log("강좌 상태 변경됨");
        })
            .then((err) => {
                console.log('실패', err);
                if (err.response === 401) {
                    alert("로그인 정보가 없습니다.")
                } else if (err.response === 500) {
                    alert("서버가 응답하지 않습니다.")
                }

            }))
            .then()
            .then(data => setCourse())
    }, []);

    const onSubmit = (data) => {
        console.log(data); // 폼 데이터 유효성 검사 통과 후 디비에 저장하고 adminmain으로 돌아가기
        setCourse(prev => ({ ...prev, proposal_status: 'APPROVED' }))
    };

    const onError = (errors) => {
        console.log(errors); // 유효성 검사 실패 시 호출
    };

    return (
        <>
            <div className="flex max-w-sm flex-col gap-4 text-sm">
                <div className="flex flex-col gap-1.5">
                    <div className="leading-none font-medium">강좌명</div>
                    <div className="text-muted-foreground">
                        {course.title}
                    </div>
                </div>
                <Separator />
                <div>
                    {course.description}
                </div>

                <div>
                    {course.level}
                </div>

                <div>
                    {course.proposal_status}
                </div>

            </div>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline">강좌 승인</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle><p>강좌 개설을 승인하시겠습니까?</p></AlertDialogTitle>
                        {/* <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account from our servers.
          </AlertDialogDescription> */}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>아니오</AlertDialogCancel>
                        <AlertDialogAction onSubmit={handleSubmit(onSubmit, onError)}>네</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )


}

export default ProposalDetail;