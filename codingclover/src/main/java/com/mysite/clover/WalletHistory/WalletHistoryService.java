package com.mysite.clover.WalletHistory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletHistoryService {

    private final WalletHistoryRepository walletHistoryRepository;

    /**
     * 지갑 히스토리 기록 생성
     */
    @Transactional
    public WalletHistory createHistory(Long userId, Integer changeAmount, WalletChangeReason reason, Long paymentId) {
        WalletHistory history = new WalletHistory();
        history.setUserId(userId);
        history.setChangeAmount(changeAmount);
        history.setReason(reason);
        history.setPaymentId(paymentId);
        
        return walletHistoryRepository.save(history);
    }

    /**
     * 충전 히스토리 기록
     */
    @Transactional
    public WalletHistory recordCharge(Long userId, Integer amount, Long paymentId) {
        return createHistory(userId, amount, WalletChangeReason.CHARGE, paymentId);
    }

    /**
     * 사용 히스토리 기록
     */
    @Transactional
    public WalletHistory recordUse(Long userId, Integer amount, Long paymentId) {
        return createHistory(userId, -amount, WalletChangeReason.USE, paymentId);
    }

    /**
     * 환불 히스토리 기록
     */
    @Transactional
    public WalletHistory recordRefund(Long userId, Integer amount, Long paymentId) {
        return createHistory(userId, amount, WalletChangeReason.REFUND, paymentId);
    }

    /**
     * 관리자 조정 히스토리 기록
     */
    @Transactional
    public WalletHistory recordAdminAdjustment(Long userId, Integer amount, String memo) {
        // 관리자 조정 시에는 paymentId 대신 메모를 별도로 관리할 수 있음
        return createHistory(userId, amount, WalletChangeReason.ADMIN, null);
    }

    /**
     * 사용자 지갑 히스토리 조회
     */
    public List<WalletHistory> getUserHistory(Long userId) {
        return walletHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * 사용자 지갑 히스토리 페이징 조회
     */
    public Page<WalletHistory> getUserHistoryPaged(Long userId, Pageable pageable) {
        return walletHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * 특정 결제와 연관된 히스토리 조회
     */
    public List<WalletHistory> getHistoryByPayment(Long paymentId) {
        return walletHistoryRepository.findByPaymentId(paymentId);
    }

    /**
     * 특정 기간의 히스토리 조회
     */
    public List<WalletHistory> getHistoryByPeriod(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return walletHistoryRepository.findByUserIdAndCreatedAtBetween(userId, startDate, endDate);
    }

    /**
     * 사용자 통계 조회
     */
    public WalletStatistics getUserStatistics(Long userId) {
        Integer totalCharge = walletHistoryRepository.getTotalChargeAmount(userId);
        Integer totalUse = walletHistoryRepository.getTotalUseAmount(userId);
        
        WalletStatistics stats = new WalletStatistics();
        stats.setUserId(userId);
        stats.setTotalChargeAmount(totalCharge != null ? totalCharge : 0);
        stats.setTotalUseAmount(totalUse != null ? totalUse : 0);
        
        return stats;
    }
}