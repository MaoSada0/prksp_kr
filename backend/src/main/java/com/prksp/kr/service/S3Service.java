package com.prksp.kr.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.public-url}")
    private String publicUrl;

    @PostConstruct
    public void initBucket() {
        try {
            ensureBucketExists();
        } catch (Exception e) {
            log.warn("S3 bucket init deferred: {}", e.getMessage());
        }
    }

    public String upload(String key, byte[] data, String contentType) {
        ensureBucketExists();
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(contentType)
                        .build(),
                RequestBody.fromBytes(data));
        return publicUrl + "/" + bucket + "/" + key;
    }

    private void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (Exception e) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
            s3Client.putBucketPolicy(PutBucketPolicyRequest.builder()
                    .bucket(bucket)
                    .policy("""
                            {
                              "Version": "2012-10-17",
                              "Statement": [{
                                "Effect": "Allow",
                                "Principal": "*",
                                "Action": "s3:GetObject",
                                "Resource": "arn:aws:s3:::%s/*"
                              }]
                            }
                            """.formatted(bucket))
                    .build());
            log.info("Created S3 bucket: {}", bucket);
        }
    }
}
