package com.tencent.supersonic.chat.corrector;

import com.tencent.supersonic.chat.api.pojo.SemanticCorrectInfo;
import com.tencent.supersonic.chat.parser.llm.dsl.DSLParseResult;
import com.tencent.supersonic.chat.query.llm.dsl.LLMReq;
import com.tencent.supersonic.chat.query.llm.dsl.LLMReq.ElementValue;
import com.tencent.supersonic.common.pojo.Constants;
import com.tencent.supersonic.common.util.JsonUtil;
import com.tencent.supersonic.common.util.jsqlparser.SqlParserUpdateHelper;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.CollectionUtils;

@Slf4j
public class GlobalBeforeCorrector extends BaseSemanticCorrector {

    @Override
    public void correct(SemanticCorrectInfo semanticCorrectInfo) {

        super.correct(semanticCorrectInfo);

        replaceAlias(semanticCorrectInfo);

        updateFieldNameByLinkingValue(semanticCorrectInfo);

        correctFieldName(semanticCorrectInfo);
    }

    private void replaceAlias(SemanticCorrectInfo semanticCorrectInfo) {
        String replaceAlias = SqlParserUpdateHelper.replaceAlias(semanticCorrectInfo.getSql());
        semanticCorrectInfo.setSql(replaceAlias);
    }

    private void correctFieldName(SemanticCorrectInfo semanticCorrectInfo) {

        Map<String, String> fieldNameMap = getFieldNameMap(semanticCorrectInfo.getParseInfo().getModelId());

        String sql = SqlParserUpdateHelper.replaceFields(semanticCorrectInfo.getSql(), fieldNameMap);

        semanticCorrectInfo.setSql(sql);
    }

    private void updateFieldNameByLinkingValue(SemanticCorrectInfo semanticCorrectInfo) {
        Object context = semanticCorrectInfo.getParseInfo().getProperties().get(Constants.CONTEXT);
        if (Objects.isNull(context)) {
            return;
        }

        DSLParseResult dslParseResult = JsonUtil.toObject(JsonUtil.toString(context), DSLParseResult.class);
        if (Objects.isNull(dslParseResult) || Objects.isNull(dslParseResult.getLlmReq())) {
            return;
        }
        LLMReq llmReq = dslParseResult.getLlmReq();
        List<ElementValue> linking = llmReq.getLinking();
        if (CollectionUtils.isEmpty(linking)) {
            return;
        }

        Map<String, Set<String>> fieldValueToFieldNames = linking.stream().collect(
                Collectors.groupingBy(ElementValue::getFieldValue,
                        Collectors.mapping(ElementValue::getFieldName, Collectors.toSet())));

        String sql = SqlParserUpdateHelper.replaceFieldNameByValue(semanticCorrectInfo.getSql(),
                fieldValueToFieldNames);
        semanticCorrectInfo.setSql(sql);
    }
}