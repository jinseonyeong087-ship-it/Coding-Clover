package com.mysite.clover.Product;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ProductInitializer implements CommandLineRunner {

  private final ProductRepository productRepository;

  @Override
  public void run(String... args) throws Exception {
    // 테스트용 1원짜리 수강권 생성
    String testProductName = "테스트 수강권";
    if (!productRepository.existsByName(testProductName)) {
      Product product = new Product();
      product.setName(testProductName);
      product.setPrice(1); // 1원
      product.setType(ProductType.COURSE);
      productRepository.save(product);
      System.out.println("테스트용 1원 상품이 생성되었습니다: " + product.getProductId());
    }
  }
}
