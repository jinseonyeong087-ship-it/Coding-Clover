package com.mysite.clover.UserWallet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface UserWalletRepository extends JpaRepository<UserWallet, Long> {
    
    /**
     * 사용자 지갑 조회
     */
    Optional<UserWallet> findByUserId(Long userId);
    
    /**
     * 사용자 지갑이 존재하는지 확인
     */
    boolean existsByUserId(Long userId);
    
    /**
     * 포인트 증가
     */
    @Transactional
    @Modifying
    @Query("UPDATE UserWallet w SET w.balance = w.balance + :amount WHERE w.userId = :userId")
    int increaseBalance(Long userId, Integer amount);
    
    /**
     * 포인트 감소
     */
    @Transactional
    @Modifying
    @Query("UPDATE UserWallet w SET w.balance = w.balance - :amount WHERE w.userId = :userId AND w.balance >= :amount")
    int decreaseBalance(Long userId, Integer amount);
}