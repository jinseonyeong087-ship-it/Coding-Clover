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
    const [lectures, setLectures] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newLecture, setNewLecture] = useState({
        courseId: '',
        title: '',
        orderNo: '',
        videoUrl: '',
        duration: '',
        uploadType: 'IMMEDIATE', // 기본값: 즉시 공개
        scheduledAt: ''
    });

    // 강의 목록 조회
    useEffect(() => {
        fetch(`/instructor/course/${courseId}/lectures`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(res => res.json())
            .then((data) => {setLectures(data)} )
            .catch(err => console.error('강의 목록 조회 실패:', err));
    }, [courseId]);

    // 강의 추가
    const handleAddLecture = () => {
        fetch(`/instructor/course/${courseId}/lecture`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                ...newLecture,
                courseId: courseId
            })
        })
            .then(res => {
                if (!res.ok) throw new Error('강의 추가 실패');
                return res.json();
            })
            .then(data => {
                setLectures([...lectures, data]);
                setNewLecture({ courseId: '', title: '', orderNo: '', videoUrl: '', duration: 0, uploadType: 'IMMEDIATE', scheduledAt: '' });
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
                        <p>{newLecture.courseId}</p>
                        
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">강의 제목</label>
                        <Input
                            value={newLecture.title}
                            onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                            placeholder="강의 제목을 입력하세요"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">강의 순서</label>
                        <Input
                            type="number"
                            value={newLecture.orderNo}
                            onChange={(e) => setNewLecture({ ...newLecture, orderNo: parseInt(e.target.value) })}
                            min={1}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">영상 URL</label>
                        <Input
                            value={newLecture.videoUrl}
                            onChange={(e) => setNewLecture({ ...newLecture, videoUrl: e.target.value })}
                            placeholder="영상 URL을 입력하세요"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">재생 시간 (초)</label>
                        <Input
                            type="number"
                            value={newLecture.duration}
                            onChange={(e) => setNewLecture({ ...newLecture, duration: parseInt(e.target.value) })}
                            min={0}
                        />
                    </div>
                    <Button onClick={handleAddLecture}>추가하기</Button>
                </div>
            )}


{/* // 강의 고유 식별자 (DB Primary Key, 자동 증가)
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long lectureId;

  // 이 강의가 소속된 강좌 (다대일 관계, 필수값)
  @ManyToOne
  @JoinColumn(name = "course_id", nullable = false)
  private Course course;

  // 강의 제목 (필수값)
  @Column(nullable = false)
  private String title;

  // 강의 순서 (1강, 2강... 등 순서를 나타내는 번호, 필수값)
  @Column(nullable = false)
  private int orderNo;

  // 강의 영상 URL (예: S3 링크, 유튜브 링크 등, 필수값)
  @Column(nullable = false)
  private String videoUrl;

  // 영상의 재생 시간 (초 단위, 필수값)
  @Column(nullable = false)
  private int duration;

  // 강의를 등록한 강사 정보 (필수값)
  @ManyToOne
  @JoinColumn(name = "created_by", nullable = false)
  private Users createdBy;

  // 강의 생성 일시 (업로드 날짜)
  private LocalDateTime createdAt;

  // 강의 승인 상태 (기본값: PENDING - 대기중)
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private LectureApprovalStatus approvalStatus = LectureApprovalStatus.PENDING;

  // 관리자가 반려했을 경우, 그 사유를 저장 (TEXT 타입으로 긴 내용 허용)
  @Column(columnDefinition = "TEXT")
  private String rejectReason;

  // 강의를 승인한 관리자 정보 (승인 시점에 기록)
  @ManyToOne
  @JoinColumn(name = "approved_by")
  private Users approvedBy;

  // 강의 승인 일시 (승인 시점에 기록)
  private LocalDateTime approvedAt;

  // 강의 업로드 타입 (즉시 공개 또는 예약 공개)
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private LectureUploadType uploadType = LectureUploadType.IMMEDIATE;

  // 예약 공개 시, 실제 공개될 일시
  private LocalDateTime scheduledAt; */}



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
