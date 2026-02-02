// 수강생 수강신청 & 강좌 & 강의 페이지
import React from "react";

function StudentCourseDetail() {

    const [enrollment, setEnrollment] = useState([]);

    const handleSubmit = async() => {
        const enrollData = [];
        await fetch(``, {method: 'POST', headers:{ 'Content-Type': 'application/json' }})
    }

    const getEnrollState = (state) => {

        switch (state) {
            case 'ENROLLED':
                return { text: '수강 중', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' };
            case 'COMPLETED':
                return { text: '수강 완료', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
            case 'CANCELLED':
                return { text: '수강 취소', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' };
            default:
                return { text: '수강 신청', icon: FileText, color: 'text-gray-600', style={{ backgroundColor: "#4a6fa5" }}};
    }}



return (
    <>
        <section className="container mx-auto px-16 py-16">
            <div className="flex max-w-2xl flex-col gap-4 text-sm">
                <div className="flex flex-col gap-1.5">
                    <div className="leading-none font-bold text-lg">강좌명</div>
                    <div className="text-xl">{course.title}</div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <span className="font-semibold">난이도:</span> {getLevelText(course.level)}
                    </div>
                    <div>
                        <span className="font-semibold">가격:</span> {course.price?.toLocaleString()}원
                    </div>
                    <div>
                        <span className="font-semibold">강사명:</span> {course.instructorName}
                    </div>
                </div>

                <div className="mt-2">
                    <div className="font-semibold mb-1">강좌 설명</div>
                    <div className="bg-slate-50 p-4 rounded-md border">
                        {course.description}
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-4" onClick={getEnrollState}>
                    {course.proposalStatus === 'PENDING' ? (
                        <Badge variant="destructive">수강 신청</Badge>
                    ) : course.proposalStatus === 'APPROVED' ? (
                        <Badge variant="secondary">수강 중</Badge>
                    ) : (
                        <Badge variant="outline">반려됨</Badge>
                    )}
                </div>

                {enrollment.proposalStatus === 'REJECTED' && enrollment.proposalRejectReason && (
                    <div className="mt-4">
                        <div className="font-semibold mb-1 text-red-600">반려 사유</div>
                        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
                            {enrollment.proposalRejectReason}
                        </div>
                    </div>
                )}

                <div className="flex gap-3 mt-6">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button disabled={enrollment.proposalStatus !== 'PENDING'}>
                                {enrollment.proposalStatus === 'ENROLLED' ? "수강 중" :
                                    enrollment.proposalStatus === 'REJECTED' ? "반려됨" : "강좌 승인"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>수강신청이 완료되었습니다.</AlertDialogTitle>
                                <AlertDialogDescription>
                                    신청 후 내 강의실에서 볼 수 있습니다.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                {/* <AlertDialogAction onClick={handleApprove}>네, 승인합니다</AlertDialogAction> */}
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button variant="ghost" onClick={() => navigate(-1)}>뒤로 가기</Button>
                </div>
            </div>
        </section>
    </>
)
}

export default StudentCourseDetail;