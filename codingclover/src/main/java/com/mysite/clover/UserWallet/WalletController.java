package com.mysite.clover.UserWallet;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WalletController {

    private final WalletIntegrationService walletIntegrationService;
    private final UsersRepository usersRepository;

    /**
     * 현재 포인트 잔액 조회
     */
    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(Principal principal) {
        try {
            Long userId = getUserIdFromPrincipal(principal);
            Integer balance = walletIntegrationService.getCurrentBalance(userId);
            
            return ResponseEntity.ok().body(Map.of("balance", balance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 포인트 충전
     */
    @PostMapping("/charge")
    public ResponseEntity<?> chargePoints(
            @RequestBody Map<String, Object> request, 
            Principal principal) {
        try {
            Long userId = getUserIdFromPrincipal(principal);
            Integer amount = Integer.parseInt(request.get("amount").toString());
            Long paymentId = Long.parseLong(request.get("paymentId").toString());

            UserWallet wallet = walletIntegrationService.chargePoints(userId, amount, paymentId);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "포인트가 성공적으로 충전되었습니다.",
                    "currentBalance", wallet.getBalance(),
                    "chargedAmount", amount
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * 포인트 사용
     */
    @PostMapping("/use")
    public ResponseEntity<?> usePoints(
            @RequestBody Map<String, Object> request, 
            Principal principal) {
        try {
            Long userId = getUserIdFromPrincipal(principal);
            Integer amount = Integer.parseInt(request.get("amount").toString());
            Long paymentId = request.get("paymentId") != null ? 
                Long.parseLong(request.get("paymentId").toString()) : null;

            UserWallet wallet = walletIntegrationService.usePoints(userId, amount, paymentId);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "포인트가 성공적으로 사용되었습니다.",
                    "currentBalance", wallet.getBalance(),
                    "usedAmount", amount
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * 지갑 초기화 (개발/테스트 용도)
     */
    @PostMapping("/initialize")
    public ResponseEntity<?> initializeWallet(Principal principal) {
        try {
            Long userId = getUserIdFromPrincipal(principal);
            
            UserWallet wallet = walletIntegrationService.initializeWallet(userId);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "지갑이 초기화되었습니다.",
                    "balance", wallet.getBalance()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Principal에서 사용자 ID 추출하는 헬퍼 메서드
     */
    private Long getUserIdFromPrincipal(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        
        Users user = usersRepository.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        return user.getUserId();
    }
}