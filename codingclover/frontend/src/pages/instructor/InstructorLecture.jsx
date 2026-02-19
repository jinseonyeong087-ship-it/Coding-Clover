import React, { useState, useEffect, useRef } from "react";
import Nav from "@/components/Nav";
import Tail from "@/components/Tail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LectureUpload from "@/components/LectureUpload";
import {
    BookOpen,
    Video,
    Plus,
    ChevronRight,
    Clock,
    PlayCircle,
    CheckCircle2,
    LayoutGrid,
    GripVertical,
    Save
} from "lucide-react";
import { toast } from "sonner";

function InstructorLecture() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [lectureList, setLectureList] = useState([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isReordering, setIsReordering] = useState(false);

    // Drag and Drop state
    const dragItem = useRef();
    const dragOverItem = useRef();

    // 승인된 강좌 목록 가져오기
    useEffect(() => {
        setLoading(true);
        fetch('/instructor/course', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((res) => {
                if (!res.ok) throw new Error('강좌 목록 조회 실패');
                return res.json();
            })
            .then((data) => {
                const approved = data.filter(c => c.proposalStatus === 'APPROVED');
                setCourses(approved);
                if (approved.length > 0) {
                    handleSelectCourse(approved[0]);
                }
            })
            .catch((err) => console.error(err.message))
            .finally(() => setLoading(false));
    }, []);

    // 강좌 선택 시 강의 목록 가져오기
    const handleSelectCourse = (course) => {
        setSelectedCourse(course);
        setIsReordering(false);
        fetch(`/instructor/course/${course.courseId}/lectures`, {
            method: 'GET',
            credentials: 'include'
        })
            .then((res) => {
                if (!res.ok) throw new Error('강의 목록 조회 실패');
                return res.json();
            })
            .then((data) => setLectureList(data))
            .catch((err) => {
                console.error(err.message);
                setLectureList([]);
            });
    };

    // 업로드 완료 후 목록 갱신
    const handleUploaded = () => {
        if (selectedCourse) {
            handleSelectCourse(selectedCourse);
        }
        setIsUploadOpen(false);
        toast.success("강의가 성공적으로 업로드되었습니다.");
    };

    // Drag and Drop Handlers
    const handleDragStart = (e, position) => {
        dragItem.current = position;
        e.dataTransfer.effectAllowed = "move";
        e.target.classList.add("opacity-50");
    };

    const handleDragEnter = (_e, position) => {
        dragOverItem.current = position;
    };

    const handleSort = () => {
        const newList = [...lectureList];
        const draggedItemContent = newList.splice(dragItem.current, 1)[0];
        newList.splice(dragOverItem.current, 0, draggedItemContent);

        // Update order numbers temporarily in state
        const updatedList = newList.map((item, index) => ({
            ...item,
            orderNo: index + 1
        }));

        dragItem.current = null;
        dragOverItem.current = null;
        setLectureList(updatedList);
        setIsReordering(true);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove("opacity-50");
    };

    // 순서 저장 API 호출
    const saveNewOrder = async () => {
        const orderData = {
            orders: lectureList.map((l, index) => ({
                lectureId: l.lectureId,
                orderNo: index + 1
            }))
        };

        try {
            const res = await fetch('/instructor/lecture/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(orderData)
            });

            if (!res.ok) throw new Error('순서 저장 실패');

            toast.success("강의 순서가 저장되었습니다.");
            setIsReordering(false);
        } catch (err) {
            toast.error(err.message || "순서 저장 중 오류가 발생했습니다.");
        }
    };

    const nextOrderNo = lectureList.length + 1;

    const getStatusBadge = (status) => {
        switch (status) {
            case "APPROVED":
                return <Badge className="bg-emerald-100 text-emerald-700 border-0">승인 완료</Badge>;
            case "REJECTED":
                return <Badge className="bg-red-100 text-red-700 border-0">반려됨</Badge>;
            default:
                return <Badge className="bg-amber-100 text-amber-700 border-0">승인 대기</Badge>;
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return "-";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}분 ${sec}초`;
    };

    const totalDuration = lectureList.reduce((acc, curr) => acc + (curr.duration || 0), 0);

    return (
        <>
            <Nav />
            <div className="min-h-screen bg-white pt-20 pb-20">
                <div className="container mx-auto px-4 max-w-7xl">

                    <main className="flex-1 min-w-0">
                        {/* Header Section */}
                        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">강의 관리 대시보드</h1>
                                <p className="text-gray-500">강좌별 강의 순서를 조정하고 신규 강의를 등록하세요.</p>
                            </div>
                            {isReordering && (
                                <Button
                                    onClick={saveNewOrder}
                                    className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 shadow-lg shadow-primary/10 animate-pulse"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    변경된 순서 저장하기
                                </Button>
                            )}
                        </div>

                        {loading ? (
                            <div className="h-[400px] flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : courses.length === 0 ? (
                            <Card className="p-12 text-center border-dashed bg-white rounded-3xl">
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <BookOpen className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">승인된 강좌가 없습니다.</h2>
                                    <p className="text-gray-500 mb-6 font-medium">강의를 추가하려면 먼저 강좌가 승인되어야 합니다.</p>
                                    <Button onClick={() => window.location.href = '/instructor/course/new'} className="rounded-xl px-8 h-12">강좌 개설 신청</Button>
                                </div>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Column: Course Selector */}
                                <div className="lg:col-span-4 lg:w-full">
                                    <Card className="bg-white border-gray-200 shadow-sm sticky top-24 rounded-2xl overflow-hidden">
                                        <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                <LayoutGrid className="w-4 h-4 text-purple-600" />
                                                내 강좌 목록
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <ScrollArea className="h-[calc(100vh-250px)]">
                                                <div className="p-2 space-y-1">
                                                    {courses.map((course) => (
                                                        <button
                                                            key={course.courseId}
                                                            onClick={() => handleSelectCourse(course)}
                                                            className={`w-full group flex items-center gap-3 p-3 text-left rounded-xl transition-all
                                                                ${selectedCourse?.courseId === course.courseId
                                                                    ? 'bg-primary/5 text-primary shadow-sm'
                                                                    : 'hover:bg-gray-50 text-gray-700'}`}
                                                        >
                                                            <div className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border
                                                                ${selectedCourse?.courseId === course.courseId ? 'border-purple-200' : 'border-gray-100'}`}>
                                                                <img
                                                                    src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"}
                                                                    className="w-full h-full object-cover"
                                                                    alt=""
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold truncate leading-tight">{course.title}</p>
                                                                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">관리 중인 강의 {lectureList.length}개</p>
                                                            </div>
                                                            {selectedCourse?.courseId === course.courseId && (
                                                                <ChevronRight className="w-4 h-4 text-purple-400" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column: Lecture Management */}
                                <div className="lg:col-span-8 space-y-6">
                                    {selectedCourse && (
                                        <>
                                            {/* Course Quick Stats */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-inter">
                                                <Card className="p-4 bg-white border-gray-200 shadow-sm rounded-2xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                                            <Video className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">전체 강의</p>
                                                            <p className="text-xl font-bold text-gray-900">{lectureList.length} <span className="text-xs font-normal text-gray-500">개</span></p>
                                                        </div>
                                                    </div>
                                                </Card>
                                                <Card className="p-4 bg-white border-gray-200 shadow-sm rounded-2xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                                            <Clock className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">총 재생시간</p>
                                                            <p className="text-xl font-bold text-gray-900">{Math.floor(totalDuration / 60)} <span className="text-xs font-normal text-gray-500">분</span></p>
                                                        </div>
                                                    </div>
                                                </Card>
                                                <Card className="p-4 bg-white border-gray-200 shadow-sm rounded-2xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">승인 완료</p>
                                                            <p className="text-xl font-bold text-gray-900">{lectureList.filter(l => l.approvalStatus === 'APPROVED').length} <span className="text-xs font-normal text-gray-500">개</span></p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>

                                            {/* Lecture List Control */}
                                            <Card className="bg-white border-gray-200 shadow-sm overflow-hidden min-h-[500px] rounded-3xl">
                                                <CardHeader className="flex flex-row items-center justify-between py-6 px-8 border-b border-gray-100 bg-white">
                                                    <div>
                                                        <CardTitle className="text-xl font-bold text-gray-900">{selectedCourse.title}</CardTitle>
                                                        <p className="text-xs font-medium text-gray-400 mt-1">드래그하여 강의 순서를 조정할 수 있습니다.</p>
                                                    </div>
                                                    <Button
                                                        onClick={() => setIsUploadOpen(true)}
                                                        className="h-11 px-6 font-bold shadow-lg shadow-blue-100 bg-[#4a6fa5] text-white hover:bg-[#3b5c8d] transition-all active:scale-95 rounded-xl border-0"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        새 강의 추가
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="p-0">
                                                    <div className="divide-y divide-gray-50">
                                                        {lectureList.length > 0 ? (
                                                            lectureList.map((lecture, index) => (
                                                                <div
                                                                    key={lecture.lectureId}
                                                                    draggable
                                                                    onDragStart={(e) => handleDragStart(e, index)}
                                                                    onDragEnter={(e) => handleDragEnter(e, index)}
                                                                    onDragEnd={handleDragEnd}
                                                                    onDragOver={(e) => e.preventDefault()}
                                                                    onDrop={handleSort}
                                                                    className="flex flex-col md:flex-row md:items-center gap-4 p-6 hover:bg-gray-50/50 transition-all group cursor-move select-none"
                                                                >
                                                                    <div className="flex items-center gap-4 flex-1">
                                                                        <GripVertical className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors shrink-0" />
                                                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0 group-hover:bg-white group-hover:border-purple-100 group-hover:text-purple-600 transition-all">
                                                                            {lecture.orderNo}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <h3 className="text-sm font-bold text-gray-900 truncate mb-1 group-hover:text-purple-800 transition-colors">{lecture.title}</h3>
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="text-[11px] font-medium text-gray-400 flex items-center">
                                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                                    {formatDuration(lecture.duration)}
                                                                                </div>
                                                                                <Separator orientation="vertical" className="h-2 bg-gray-200" />
                                                                                {getStatusBadge(lecture.approvalStatus)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold hover:bg-white border border-transparent hover:border-gray-200 rounded-lg">수정</Button>
                                                                        <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg">삭제</Button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                                                    <PlayCircle className="w-12 h-12 text-gray-200" />
                                                                </div>
                                                                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">등록된 강의가 없습니다</h3>
                                                                <p className="text-sm font-medium text-gray-400 max-w-[250px] mx-auto leading-relaxed">
                                                                    강좌를 채울 첫 번째 강의를 등록해보세요.<br />
                                                                    학습자들이 기다리고 있어요!
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Lecture Upload Dialog */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl rounded-3xl p-0">
                    <div className="p-10">
                        <DialogHeader className="mb-8">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                                    <Video className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-bold text-gray-900">새 강의 추가</DialogTitle>
                                    <DialogDescription className="text-gray-500 font-medium font-inter">
                                        [{selectedCourse?.title}] 강좌의 {nextOrderNo}번째 강의를 등록합니다.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <LectureUpload
                            courseId={selectedCourse?.courseId}
                            nextOrderNo={nextOrderNo}
                            onUploaded={handleUploaded}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <Tail />
        </>
    );
}

export default InstructorLecture;
