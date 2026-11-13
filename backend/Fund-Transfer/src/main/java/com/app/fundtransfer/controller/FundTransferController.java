package com.app.fundtransfer.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.app.fundtransfer.model.dto.FundTransferDto;
import com.app.fundtransfer.model.dto.request.FundTransferRequest;
import com.app.fundtransfer.model.dto.response.FundTransferResponse;
import com.app.fundtransfer.service.FundTransferService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/fund-transfers")
public class FundTransferController {

    /** Set by the API gateway from the signed-in user's token. */
    private static final String USER_HEADER = "X-Auth-User-Id";

    private final FundTransferService fundTransferService;

   
    @PostMapping
    public ResponseEntity<FundTransferResponse> fundTransfer(@RequestBody FundTransferRequest fundTransferRequest,
            @RequestHeader(value = USER_HEADER, required = false) Long authUserId) {
        return new ResponseEntity<>(fundTransferService.fundTransfer(fundTransferRequest, authUserId), HttpStatus.CREATED);
    }

    @GetMapping("/{referenceId}")
    public ResponseEntity<FundTransferDto> getTransferDetailsFromReferenceId(@PathVariable String referenceId,
            @RequestHeader(value = USER_HEADER, required = false) Long authUserId) {
        return new ResponseEntity<>(fundTransferService.getTransferDetailsFromReferenceId(referenceId, authUserId), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<FundTransferDto>> getAllTransfersByAccountId(@RequestParam String accountId,
            @RequestHeader(value = USER_HEADER, required = false) Long authUserId) {
        return new ResponseEntity<>(fundTransferService.getAllTransfersByAccountId(accountId, authUserId), HttpStatus.OK);
    }
}
