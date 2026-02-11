package com.mysite.clover.Image;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.io.InputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import io.awspring.cloud.s3.ObjectMetadata;
import io.awspring.cloud.s3.S3Template;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageService {

  private final S3Template s3Template;

  @Value("${spring.cloud.aws.s3.bucket}")
  private String bucket;

  public Map<String, String> uploadImage(MultipartFile file) throws IOException {
    System.out.println("Uploading file to S3: " + file.getOriginalFilename());
    if (file.isEmpty()) {
      throw new IllegalArgumentException("빈 파일입니다.");
    }

    // 1. 파일명 생성 (UUID)
    String originalFilename = file.getOriginalFilename();
    String extension = "";
    if (originalFilename != null && originalFilename.contains(".")) {
      extension = originalFilename.substring(originalFilename.lastIndexOf("."));
    }
    String savedFilename = UUID.randomUUID().toString() + extension;

    // 2. S3 업로드 (Original)
    String originalKey = "original/" + savedFilename;
    try (InputStream inputStream = file.getInputStream()) {
      s3Template.upload(bucket, originalKey, inputStream,
          ObjectMetadata.builder().contentType(file.getContentType()).build());
    }

    // 3. 썸네일 생성 및 업로드 (S3Template은 스트림 업로드 지원, 썸네일은 메모리에서 처리 후 업로드)
    // 썸네일 처리를 위해 로컬 임시 파일 사용이 필요할 수 있으나, ByteArray로 처리 가능
    // 여기서는 간단하게 원본을 그대로 썸네일 경로에도 올리거나,
    // Lambda 등으로 리사이징하는 것이 정석이나,
    // 편의상 원본을 업로드 후 URL만 다르게 주거나 (이건 썸네일이 아니지)
    // Thumbnailator로 InputStream을 리사이징해서 업로드

    String thumbKey = "thumb/" + savedFilename;

    try (
        InputStream originalInputStream = file.getInputStream();
        java.io.ByteArrayOutputStream thumbOutput = new java.io.ByteArrayOutputStream();) {
      // 이미지 리사이징
      net.coobird.thumbnailator.Thumbnails.of(originalInputStream)
          .size(300, 200)
          .crop(net.coobird.thumbnailator.geometry.Positions.CENTER)
          .outputQuality(0.85)
          .toOutputStream(thumbOutput);

      // 리사이징된 이미지를 S3에 업로드
      try (InputStream thumbInput = new java.io.ByteArrayInputStream(thumbOutput.toByteArray())) {
        s3Template.upload(bucket, thumbKey, thumbInput,
            ObjectMetadata.builder().contentType(file.getContentType()).build());
      }
    }

    // 4. URL 반환
    Map<String, String> urls = new HashMap<>();

    // AWS S3 URL 형식: https://{bucket}.s3.{region}.amazonaws.com/{key}
    // ap-northeast-2 기준
    String s3BaseUrl = "https://" + bucket + ".s3.ap-northeast-2.amazonaws.com/";

    urls.put("originalUrl", s3BaseUrl + originalKey);
    urls.put("thumbnailUrl", s3BaseUrl + thumbKey);

    System.out.println("Uploaded to S3: " + urls.get("originalUrl"));

    return urls;
  }
}
