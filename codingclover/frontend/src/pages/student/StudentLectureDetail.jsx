import React from "react";
import { Play, Clock, Video, MonitorPlay } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Nav from "@/components/Nav";
import Tail from "@/components/Tail";

function StudentLectureDetail() {

    // YouTube URL → embed URL 변환
    const toEmbedUrl = (url) => {
        if (!url) return "";
        if (url.includes("/embed/")) return url;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|v\/))([a-zA-Z0-9_-]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    };

    // 재생 시간 포맷
    const formatDuration = (seconds) => {
        if (!seconds) return "";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}분 ${sec}초`;
    };

    return (
        <>
        <Nav />
        <div className="flex-1 h-full">
            {selectedLecture ? (
                <div className="flex flex-col gap-6 p-6 md:p-8 h-full">
                    <div className="border-b border-indigo-100/50 pb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                <Play className="w-3 h-3 fill-current" />
                                {selectedLecture.orderNo}강
                            </span>
                        </div>
                        <h3 className="font-bold text-2xl md:text-3xl text-slate-800 leading-tight">
                            {selectedLecture.title}
                        </h3>
                        {selectedLecture.duration && (
                            <div className="flex items-center gap-2 mt-4 text-slate-500 text-sm font-medium">
                                <Clock className="w-4 h-4 text-indigo-400" />
                                <span>재생 시간: <span className="text-slate-700">{formatDuration(selectedLecture.duration)}</span></span>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl overflow-hidden shadow-2xl shadow-indigo-200 ring-4 ring-white">
                        {selectedLecture.videoUrl ? (
                            <div className="relative pt-[56.25%] bg-black">
                                <iframe
                                    key={selectedLecture.lectureId}
                                    className="absolute top-0 left-0 w-full h-full"
                                    src={toEmbedUrl(selectedLecture.videoUrl)}
                                    title="강의 영상"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <div className="bg-slate-100/50 flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                                    <Video className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="font-medium">영상이 준비 중입니다</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                        <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                            <MonitorPlay className="w-5 h-5" />
                            학습 포인트
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            이 강의를 통해 학습할 수 있는 주요 내용입니다. 집중해서 수강해주세요.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full py-32 text-center">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Play className="w-10 h-10 text-indigo-300 ml-1" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">강의를 선택해주세요</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">
                        왼쪽 목록에서 수강하고 싶은 강의를 클릭하면 상세 내용과 영상을 확인할 수 있습니다.
                    </p>
                </div>
            )}
        </div>

        </>
    );
}

export default StudentLectureDetail;
