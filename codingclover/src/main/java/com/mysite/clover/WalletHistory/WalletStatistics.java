package com.mysite.clover.WalletHistory;

import lombok.Data;

@Data
public class WalletStatistics {
    private Long userId;
    private Integer totalChargeAmount;
    private Integer totalUseAmount;
    private Integer netAmount;
    
    public Integer getNetAmount() {
        return totalChargeAmount - totalUseAmount;
    }
}