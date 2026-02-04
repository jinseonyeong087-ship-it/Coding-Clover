package com.mysite.clover.UserWallet;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserWalletService {

    private final UserWalletRepository userWalletRepository;

    /**
     * 사용자 지갑 생성 (회원가입 시 호출)
     */
    @Transactional
    public UserWallet createWallet(Long userId) {
        if (userWalletRepository.existsByUserId(userId)) {
            throw new RuntimeException("이미 지갑이 존재합니다: " + userId);
        }

        UserWallet wallet = new UserWallet();
        wallet.setUserId(userId);
        wallet.setBalance(0);
        
        return userWalletRepository.save(wallet);
    }

    /**
     * 포인트 잔액 조회
     */
    public Integer getBalance(Long userId) {
        return userWalletRepository.findByUserId(userId)
            .map(UserWallet::getBalance)
            .orElse(0);
    }

    /**
     * 사용자 지갑 조회 (없으면 생성)
     */
    @Transactional
    public UserWallet getOrCreateWallet(Long userId) {
        return userWalletRepository.findByUserId(userId)
            .orElseGet(() -> createWallet(userId));
    }

    /**
     * 포인트 충전
     */
    @Transactional
    public UserWallet chargePoints(Long userId, Integer amount) {
        if (amount <= 0) {
            throw new RuntimeException("충전 금액은 0보다 커야 합니다");
        }

        // 지갑이 없으면 생성
        UserWallet wallet = getOrCreateWallet(userId);
        
        int updatedRows = userWalletRepository.increaseBalance(userId, amount);
        if (updatedRows == 0) {
            throw new RuntimeException("포인트 충전에 실패했습니다");
        }

        // 업데이트된 지갑 정보 반환
        return userWalletRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("지갑 정보를 찾을 수 없습니다"));
    }

    /**
     * 포인트 사용
     */
    @Transactional
    public UserWallet usePoints(Long userId, Integer amount) {
        if (amount <= 0) {
            throw new RuntimeException("사용 금액은 0보다 커야 합니다");
        }

        // 잔액 확인
        Integer currentBalance = getBalance(userId);
        if (currentBalance < amount) {
            throw new RuntimeException("포인트가 부족합니다. 현재 잔액: " + currentBalance + ", 사용 요청: " + amount);
        }

        int updatedRows = userWalletRepository.decreaseBalance(userId, amount);
        if (updatedRows == 0) {
            throw new RuntimeException("포인트 사용에 실패했습니다. 잔액을 확인해주세요");
        }

        // 업데이트된 지갑 정보 반환
        return userWalletRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("지갑 정보를 찾을 수 없습니다"));
    }

    /**
     * 포인트 환불
     */
    @Transactional
    public UserWallet refundPoints(Long userId, Integer amount) {
        if (amount <= 0) {
            throw new RuntimeException("환불 금액은 0보다 커야 합니다");
        }

        // 지갑이 없으면 생성
        UserWallet wallet = getOrCreateWallet(userId);
        
        int updatedRows = userWalletRepository.increaseBalance(userId, amount);
        if (updatedRows == 0) {
            throw new RuntimeException("포인트 환불에 실패했습니다");
        }

        // 업데이트된 지갑 정보 반환
        return userWalletRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("지갑 정보를 찾을 수 없습니다"));
    }
}