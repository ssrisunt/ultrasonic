package com.tencent.supersonic.chat.parser.llm.dsl;

import lombok.Data;

@Data
public class ModelMatchResult {
    private Integer count = 0;
    private double maxSimilarity;
}