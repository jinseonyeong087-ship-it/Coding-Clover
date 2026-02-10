package com.mysite.clover.Image;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.CrossOrigin;

import lombok.RequiredArgsConstructor;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class ImageController {

  private final ImageService imageService;

  @PostMapping("/image")
  public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
    try {
      Map<String, String> urls = imageService.uploadImage(file);
      return ResponseEntity.ok(urls);
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
    }
  }
}
