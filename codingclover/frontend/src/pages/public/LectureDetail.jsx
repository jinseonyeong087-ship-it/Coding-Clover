import React from "react";

function LectureDetail({ selectedLecture }) {

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
        <div className="flex-1">
            {selectedLecture ? (
                <div className="flex flex-col gap-3 p-6">
                    <h3 className="font-semibold text-lg">
                        {selectedLecture.orderNo}강. {selectedLecture.title}
                    </h3>
                    {selectedLecture.duration && (
                        <p className="text-sm text-muted-foreground">
                            재생 시간: {formatDuration(selectedLecture.duration)}
                        </p>
                    )}
                    {selectedLecture.videoUrl ? (
                        <iframe
                            key={selectedLecture.lectureId}
                            width="100%"
                            height="500"
                            src={toEmbedUrl(selectedLecture.videoUrl)}
                            title="강의 영상"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    ) : (
                        <div className="bg-slate-100 rounded-md flex items-center justify-center h-64 text-muted-foreground">
                            영상이 준비 중입니다
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 text-muted-foreground">
                    좌측 목록에서 강의를 선택해주세요
                </div>
            )}
        </div>
    );
}

export default LectureDetail;
