import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function InstructorLecture() {
    const { courseId } = useParams();
    const [myCourses, setMyCourses] = useState([]);
    const [isEditing, setIsEditing] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [lectures, setLectures] = useState({
        lectureId: '',
        title: '',
        orderNo: '',
        videoUrl: '',
        duration: '',
        uploadType: 'IMMEDIATE', // 기본값: 즉시 공개
        scheduledAt: ''
    });

    // 해당 강좌 가져오기 /instructor/course/{id}
    useEffect(() => {
        fetch(`/instructor/course/${courseId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    throw new Error('인증 필요: 강사로 로그인해주세요.');
                }
                if (res.status === 500) {
                    throw new Error('서버 에러: 해당 강좌가 존재하지 않거나 접근 권한이 없습니다.');
                }
                if (!res.ok) throw new Error(`에러 발생: ${res.status}`);
                return res.json();
            })
            .then((data) => setMyCourses(data))
            .catch((error) => console.error(error.message));
    }, [courseId]);

    // 강의 목록 가져오기 /instructor/lecture/{lectureId}
    useEffect(() => {
        fetch(`/instructor/course/${lectureId}/lecture`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(res => res.json())
            .then((data) => { setLectures(data) })
            .catch(err => console.error('강의 목록 조회 실패:', err));
    }, [lectureId]);

    // 새로운 강의 추가 = 첫번쨰 심사
    const handleAddLecture = async () => {
        await fetch(`/instructor/lecture/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                ...lectures,
                lectureId: lectures.lectureId
            })
        })
            .then(res => {
                if (!res.ok) throw new Error('강의 추가 실패');
                return res.json();
            })
            .then(data => {
                // setLectures([...lectures, data]);
                setLectures({ course: '', title: '', orderNo: '', videoUrl: '', duration: 0, instructor: '', uploadType: 'IMMEDIATE', scheduledAt: '' });
                setIsAdding(false);
            })
            .catch(err => console.error(err));
    };

    // 승인 상태 뱃지
    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">승인</span>;
            case 'REJECTED':
                return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">반려</span>;
            default:
                return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">대기</span>;
        }
    };

    // 재생시간 포맷 (초 -> 분:초)
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // input 수정 활성화 handleChange
    const handleChange = (event) => {
        const { name, value } = event.target;
        setLectures(prev => ({...prev, [name]:value}))
    }

    // 업로드 한 강의 수정
    const handleEdit = () => {
        setIsEditing(false)
    }

    // 첫번째 심사 요청 시

    // 반려 후 재심사 요청 REJECTED
    const handleResubmit = () => {
        setResubmit(false)

    }



    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">강의 목록</h2>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? '취소' : '강의 추가'}
                </Button>
            </div>

            {/* 강의 추가 폼 */}
            {isAdding && (
                <div className="mb-6 p-4 border rounded-md bg-slate-50 space-y-4">
                    <div>
                        <h2 className="block text-sm font-medium mb-1">강좌명</h2>
                        <Input
                            method='POST'
                            value={myCourses.title}
                            placeholder={myCourses.title}
                            readOnly
                        />
                        <div className="flex ">
                            {isEditing === true ? (<Button onClick={()=>{setIsEditing(true)}}>저장</Button>):(<Button onClick={handleEdit}>수정</Button>)}
                            {approvalStatus === 'REJECTED' ? (<Button onCLick={()=>{setResubmit(true)}}>재심사 요청</Button>):(<Button>재심사 요청</Button>)}
                            <Button>삭제</Button>
                        </div>
                        
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">강의 제목</label>
                        <Input
                            method='POST'
                            value={lectures.title}
                            onChange={(e) => lectures({ ...lectures, title: e.target.value })}
                            placeholder="강의 제목을 입력하세요"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">강의 순서</label>
                        <Input
                            method='POST'
                            type="number"
                            value={lectures.orderNo}
                            onChange={(e) => setLectures({ ...lectures, orderNo: parseInt(e.target.value) })}
                            min={1}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">영상 URL</label>
                        <Input
                            method='POST'
                            value={lectures.videoUrl}
                            onChange={(e) => setLectures({ ...lectures, videoUrl: e.target.value })}
                            placeholder="영상 URL을 입력하세요"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">재생 시간 (초)</label>
                        <Input
                            method='POST'
                            type="number"
                            value={lectures.duration}
                            onChange={(e) => setLectures({ ...lectures, duration: parseInt(e.target.value) })}
                            min={0}
                        />
                    </div>
                    <Button onClick={handleAddLecture}>추가하기</Button>
                </div>
            )}

            {/* 강의 목록 아코디언 */}
            {lectures.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {lectures.map((lecture) => (
                        <AccordionItem key={lecture.id} value={`lecture-${lecture.id}`}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-4">
                                    <span className="font-medium">{lecture.orderNo}강. {lecture.title}</span>
                                    {getStatusBadge(lecture.approvalStatus)}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 p-2">
                                    <p><span className="font-semibold">재생 시간:</span> {formatDuration(lecture.duration)}</p>
                                    <p><span className="font-semibold">영상 URL:</span> {lecture.videoUrl}</p>
                                    {lecture.approvalStatus === 'REJECTED' && lecture.rejectReason && (
                                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                                            <p className="text-red-700 text-sm">
                                                <span className="font-semibold">반려 사유:</span> {lecture.rejectReason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <p className="text-gray-500 text-center py-8">등록된 강의가 없습니다.</p>
            )}
        </div>
    );
}

export default InstructorLecture;
