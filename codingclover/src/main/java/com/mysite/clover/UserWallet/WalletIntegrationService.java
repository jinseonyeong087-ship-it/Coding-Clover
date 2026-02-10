package com.mysite.clover.UserWallet;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.mysite.clover.WalletHistory.WalletHistoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WalletIntegrationService {

    private final UserWalletService userWalletService;
    private final WalletHistoryService walletHistoryService;

    /**
     * 포인트 충전 (잔액 업데이트 + 히스토리 기록)
     */
    @Transactional
    public UserWallet chargePoints(Long userId, Integer amount, Long paymentId) {
        // 1. 잔액 업데이트
        UserWallet wallet = userWalletService.chargePoints(userId, amount);
        
        // 2. 히스토리 기록
        walletHistoryService.recordCharge(userId, amount, paymentId);
        
        return wallet;
    }

    /**
     * 포인트 사용 (잔액 업데이트 + 히스토리 기록)
     */
    @Transactional
    public UserWallet usePoints(Long userId, Integer amount, Long paymentId) {
        // 1. 잔액 업데이트
        UserWallet wallet = userWalletService.usePoints(userId, amount);
        
        // 2. 히스토리 기록
        walletHistoryService.recordUse(userId, amount, paymentId);
        
        return wallet;
    }

    /**
     * 포인트 환불 (잔액 업데이트 + 히스토리 기록)
     */
    @Transactional
    public UserWallet refundPoints(Long userId, Integer amount, Long paymentId) {
        // 1. 잔액 업데이트
        UserWallet wallet = userWalletService.refundPoints(userId, amount);
        
        // 2. 히스토리 기록
        walletHistoryService.recordRefund(userId, amount, paymentId);
        
        return wallet;
    }

    /**
     * 사용자 지갑 초기화 (회원가입 시)
     */
    @Transactional
    public UserWallet initializeWallet(Long userId) {
        return userWalletService.createWallet(userId);
    }

    /**
     * 현재 포인트 잔액 조회
     */
    public Integer getCurrentBalance(Long userId) {
        return userWalletService.getBalance(userId);
    }
}