package com.mysite.clover.Image;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import net.coobird.thumbnailator.Thumbnails;

@Service
public class ImageService {

  @Value("${file.upload.path}")
  private String uploadPath;

  public Map<String, String> uploadImage(MultipartFile file) throws IOException {
    System.out.println("Uploading file: " + file.getOriginalFilename());
    if (file.isEmpty()) {
      throw new IllegalArgumentException("빈 파일입니다.");
    }

    // 0. 절대 경로로 변환 (핵심 수정 사항)
    Path absUploadPath = Paths.get(uploadPath).toAbsolutePath().normalize();
    System.out.println("Absolute Upload Path: " + absUploadPath);

    // 1. 폴더 생성 (없으면 생성)
    File originalDir = new File(absUploadPath.toFile(), "original");
    File thumbDir = new File(absUploadPath.toFile(), "thumb");

    if (!originalDir.exists())
      originalDir.mkdirs();
    if (!thumbDir.exists())
      thumbDir.mkdirs();

    // 2. 파일명 생성 (UUID)
    String originalFilename = file.getOriginalFilename();
    String extension = "";
    if (originalFilename != null && originalFilename.contains(".")) {
      extension = originalFilename.substring(originalFilename.lastIndexOf("."));
    }
    String savedFilename = UUID.randomUUID().toString() + extension;

    // 3. 원본 저장 (반드시 절대 경로 File 객체 사용)
    File dest = new File(originalDir, savedFilename);
    System.out.println("Saving original to: " + dest.getAbsolutePath());
    file.transferTo(dest);

    // 4. 썸네일 생성 및 저장 (300x200)
    File thumbDest = new File(thumbDir, savedFilename);
    Thumbnails.of(dest)
        .size(300, 200)
        .crop(net.coobird.thumbnailator.geometry.Positions.CENTER)
        .outputQuality(0.85)
        .toFile(thumbDest);

    // 5. URL 반환
    Map<String, String> urls = new HashMap<>();
    urls.put("originalUrl", "/uploads/original/" + savedFilename);
    urls.put("thumbnailUrl", "/uploads/thumb/" + savedFilename);

    return urls;
  }
}
