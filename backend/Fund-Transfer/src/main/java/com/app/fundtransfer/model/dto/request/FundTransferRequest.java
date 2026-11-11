package com.app.fundtransfer.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FundTransferRequest {

    private String fromAccount;

    private String toAccount;

    private BigDecimal amount;

    /** Optional note from the sender, saved on both sides of the transfer. */
    private String description;
}
