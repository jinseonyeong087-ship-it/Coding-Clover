package com.mysite.clover.WalletHistory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface WalletHistoryRepository extends JpaRepository<WalletHistory, Long> {
    
    /**
     * 사용자별 지갑 히스토리 조회 (최신순)
     */
    List<WalletHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * 사용자별 지갑 히스토리 페이징 조회
     */
    Page<WalletHistory> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * 사용자별 특정 사유의 히스토리 조회
     */
    List<WalletHistory> findByUserIdAndReason(Long userId, WalletChangeReason reason);
    
    /**
     * 특정 결제와 연관된 히스토리 조회
     */
    List<WalletHistory> findByPaymentId(Long paymentId);
    
    /**
     * 특정 기간 동안의 히스토리 조회
     */
    List<WalletHistory> findByUserIdAndCreatedAtBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * 사용자별 총 충전 금액
     */
    @Query("SELECT COALESCE(SUM(h.changeAmount), 0) FROM WalletHistory h WHERE h.userId = :userId AND h.reason = 'CHARGE'")
    Integer getTotalChargeAmount(Long userId);
    
    /**
     * 사용자별 총 사용 금액
     */
    @Query("SELECT COALESCE(SUM(ABS(h.changeAmount)), 0) FROM WalletHistory h WHERE h.userId = :userId AND h.reason = 'USE'")
    Integer getTotalUseAmount(Long userId);
}