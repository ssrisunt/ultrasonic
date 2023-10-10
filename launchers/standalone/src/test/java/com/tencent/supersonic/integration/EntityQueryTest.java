package com.tencent.supersonic.integration;

import com.tencent.supersonic.chat.api.pojo.SchemaElement;
import com.tencent.supersonic.chat.api.pojo.SemanticParseInfo;
import com.tencent.supersonic.chat.api.pojo.request.QueryFilter;
import com.tencent.supersonic.chat.api.pojo.response.QueryResult;
import com.tencent.supersonic.chat.query.rule.entity.EntityFilterQuery;
import com.tencent.supersonic.chat.query.rule.metric.MetricEntityQuery;
import com.tencent.supersonic.common.pojo.DateConf;
import com.tencent.supersonic.semantic.api.query.enums.FilterOperatorEnum;
import com.tencent.supersonic.util.DataUtils;
import org.junit.Test;
import java.util.ArrayList;
import java.util.List;
import static com.tencent.supersonic.common.pojo.enums.AggregateTypeEnum.NONE;

public class EntityQueryTest extends BaseQueryTest {

    @Test
    public void queryTest_metric_entity_query() throws Exception {
        QueryResult actualResult = submitNewChat("The number of views of artist Jay Chou");

        QueryResult expectedResult = new QueryResult();
        SemanticParseInfo expectedParseInfo = new SemanticParseInfo();
        expectedResult.setChatContext(expectedParseInfo);

        expectedResult.setQueryMode(MetricEntityQuery.QUERY_MODE);
        expectedParseInfo.setAggType(NONE);

        QueryFilter dimensionFilter = DataUtils.getFilter("singer_name", FilterOperatorEnum.EQUALS, "jay", "Singer Name", 7L);
        expectedParseInfo.getDimensionFilters().add(dimensionFilter);

        SchemaElement metric = SchemaElement.builder().name("Playback volume").build();
        expectedParseInfo.getMetrics().add(metric);

        expectedParseInfo.setDateInfo(DataUtils.getDateConf(DateConf.DateMode.RECENT, 7, period, startDay, endDay));
        expectedParseInfo.setNativeQuery(false);

        assertQueryResult(expectedResult, actualResult);
    }

    @Test
    public void queryTest_entity_list_filter() throws Exception {
        QueryResult actualResult = submitNewChat("Love、Entertainers of the popular genre");

        QueryResult expectedResult = new QueryResult();
        SemanticParseInfo expectedParseInfo = new SemanticParseInfo();
        expectedResult.setChatContext(expectedParseInfo);

        expectedResult.setQueryMode(EntityFilterQuery.QUERY_MODE);
        expectedParseInfo.setAggType(NONE);

        List<String> list = new ArrayList<>();
        list.add("爱情");
        list.add("流行");
        QueryFilter dimensionFilter = DataUtils.getFilter("genre", FilterOperatorEnum.IN, list, "Style", 6L);
        expectedParseInfo.getDimensionFilters().add(dimensionFilter);

        SchemaElement metric = SchemaElement.builder().name("Playback volume").build();
        expectedParseInfo.getMetrics().add(metric);

        SchemaElement dim1 = SchemaElement.builder().name("Singer Name").build();
        SchemaElement dim2 = SchemaElement.builder().name("Active region").build();
        SchemaElement dim3 = SchemaElement.builder().name("Style").build();
        SchemaElement dim4 = SchemaElement.builder().name("magnum opus").build();
        expectedParseInfo.getDimensions().add(dim1);
        expectedParseInfo.getDimensions().add(dim2);
        expectedParseInfo.getDimensions().add(dim3);
        expectedParseInfo.getDimensions().add(dim4);

        expectedParseInfo.setDateInfo(DataUtils.getDateConf(DateConf.DateMode.BETWEEN, startDay, startDay));
        expectedParseInfo.setNativeQuery(true);

        assertQueryResult(expectedResult, actualResult);
    }

}
