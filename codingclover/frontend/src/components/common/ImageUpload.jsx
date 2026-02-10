import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/Button";

const ImageUpload = ({ onUploadSuccess, initialImage }) => {
  const [preview, setPreview] = useState(initialImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 10MB 제한 체크 (백엔드 설정과 맞춤)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      // axios 인스턴스 설정에 따라 url 조정 필요 (여기서는 상대 경로 사용)
      const response = await axios.post('/api/upload/image', formData, {
        withCredentials: true,
      });

      const { originalUrl, thumbnailUrl } = response.data;

      // 썸네일 URL로 미리보기 설정
      setPreview(thumbnailUrl);

      // 부모 컴포넌트에 URL 전달
      if (onUploadSuccess) {
        onUploadSuccess({ originalUrl, thumbnailUrl });
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      const errorMessage = error.response?.data || '이미지 업로드에 실패했습니다.';
      alert(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setUploading(false);
      // 같은 파일 다시 선택 가능하도록 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onUploadSuccess) {
      onUploadSuccess(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full max-w-[300px] aspect-[3/2] rounded-xl overflow-hidden border border-slate-200 group">
          <img
            src={preview}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              className="bg-white/90 hover:bg-white text-slate-700 border-0"
            >
              변경
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="bg-red-500/90 hover:bg-red-600 border-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className={`
            w-full max-w-[300px] aspect-[3/2] rounded-xl border-2 border-dashed 
            flex flex-col items-center justify-center cursor-pointer transition-all
            ${uploading ? 'bg-slate-50 border-slate-200' : 'border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-300'}
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
              <p className="text-sm text-slate-500 font-medium">업로드 중...</p>
            </>
          ) : (
            <>
              <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                <ImageIcon className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700">썸네일 이미지 업로드</p>
              <p className="text-xs text-slate-400 mt-1">클릭하여 이미지 선택 (최대 10MB)</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
