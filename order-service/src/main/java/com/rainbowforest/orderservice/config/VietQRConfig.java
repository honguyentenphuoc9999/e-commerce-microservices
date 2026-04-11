package com.rainbowforest.orderservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class VietQRConfig {

    @Value("${vietqr.bank_id}")
    public String bankId;

    @Value("${vietqr.account_no}")
    public String accountNo;

    @Value("${vietqr.account_name}")
    public String accountName;

    @Value("${vietqr.template}")
    public String template;
}
