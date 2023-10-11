package com.tencent.supersonic;

import com.alibaba.fastjson.JSONObject;
import com.google.common.collect.Lists;
import com.tencent.supersonic.auth.api.authentication.pojo.User;
import com.tencent.supersonic.chat.agent.Agent;
import com.tencent.supersonic.chat.agent.AgentConfig;
import com.tencent.supersonic.chat.agent.tool.AgentToolType;
import com.tencent.supersonic.chat.agent.tool.DslTool;
import com.tencent.supersonic.chat.agent.tool.RuleQueryTool;
import com.tencent.supersonic.chat.api.pojo.request.ChatAggConfigReq;
import com.tencent.supersonic.chat.api.pojo.request.ChatConfigBaseReq;
import com.tencent.supersonic.chat.api.pojo.request.ChatDefaultConfigReq;
import com.tencent.supersonic.chat.api.pojo.request.ChatDetailConfigReq;
import com.tencent.supersonic.chat.api.pojo.request.ExecuteQueryReq;
import com.tencent.supersonic.chat.api.pojo.request.ItemVisibility;
import com.tencent.supersonic.chat.api.pojo.request.KnowledgeInfoReq;
import com.tencent.supersonic.chat.api.pojo.request.QueryReq;
import com.tencent.supersonic.chat.api.pojo.request.RecommendedQuestionReq;
import com.tencent.supersonic.chat.api.pojo.response.ParseResp;
import com.tencent.supersonic.chat.plugin.Plugin;
import com.tencent.supersonic.chat.plugin.PluginParseConfig;
import com.tencent.supersonic.chat.query.plugin.ParamOption;
import com.tencent.supersonic.chat.query.plugin.WebBase;
import com.tencent.supersonic.chat.service.AgentService;
import com.tencent.supersonic.chat.service.ChatService;
import com.tencent.supersonic.chat.service.ConfigService;
import com.tencent.supersonic.chat.service.PluginService;
import com.tencent.supersonic.chat.service.QueryService;
import com.tencent.supersonic.common.util.JsonUtil;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ConfigureDemo implements ApplicationListener<ApplicationReadyEvent> {

    private User user = User.getFakeUser();
    @Qualifier("chatQueryService")
    @Autowired
    private QueryService queryService;
    @Autowired
    private ChatService chatService;
    @Autowired
    private ConfigService configService;
    @Autowired
    private PluginService pluginService;
    @Autowired
    private AgentService agentService;
    @Value("${spring.h2.demo.enabled:false}")
    private boolean demoEnable;

    private void parseAndExecute(int chatId, String queryText) throws Exception {
        QueryReq queryRequest = new QueryReq();
        queryRequest.setQueryText(queryText);
        queryRequest.setChatId(chatId);
        queryRequest.setAgentId(1);
        queryRequest.setUser(User.getFakeUser());
        ParseResp parseResp = queryService.performParsing(queryRequest);

        ExecuteQueryReq executeReq = new ExecuteQueryReq();
        executeReq.setQueryId(parseResp.getQueryId());
        executeReq.setParseId(parseResp.getSelectedParses().get(0).getId());
        executeReq.setQueryText(queryRequest.getQueryText());
        executeReq.setParseInfo(parseResp.getSelectedParses().get(0));
        executeReq.setChatId(parseResp.getChatId());
        executeReq.setUser(queryRequest.getUser());
        executeReq.setAgentId(1);
        queryService.performExecution(executeReq);
    }

    public void addSampleChats() throws Exception {
        chatService.addChat(user, "Sample Dialogue 1", 1);

        parseAndExecute(1, "Number of Visits");
        parseAndExecute(1, "Statistics by sector");
        parseAndExecute(1, "Inquiry last 30 days");
    }

    public void addSampleChats2() throws Exception {
        chatService.addChat(user, "Sample Dialogue 2", 1);

        parseAndExecute(2, "Length of stay of Alice");
        parseAndExecute(2, "Comparing the number of visits by Alice and Lucy");
        parseAndExecute(2, "Most visited department");
    }

    public void addDemoChatConfig_1() {
        ChatConfigBaseReq chatConfigBaseReq = new ChatConfigBaseReq();
        chatConfigBaseReq.setModelId(1L);

        ChatDetailConfigReq chatDetailConfig = new ChatDetailConfigReq();
        ChatDefaultConfigReq chatDefaultConfigDetail = new ChatDefaultConfigReq();
        List<Long> dimensionIds0 = Arrays.asList(1L, 2L);
        List<Long> metricIds0 = Arrays.asList(1L);
        chatDefaultConfigDetail.setDimensionIds(dimensionIds0);
        chatDefaultConfigDetail.setMetricIds(metricIds0);
        chatDefaultConfigDetail.setUnit(7);
        chatDefaultConfigDetail.setPeriod("DAY");
        chatDetailConfig.setChatDefaultConfig(chatDefaultConfigDetail);
        ItemVisibility visibility0 = new ItemVisibility();
        chatDetailConfig.setVisibility(visibility0);
        chatConfigBaseReq.setChatDetailConfig(chatDetailConfig);

        ChatAggConfigReq chatAggConfig = new ChatAggConfigReq();
        ChatDefaultConfigReq chatDefaultConfigAgg = new ChatDefaultConfigReq();
        List<Long> dimensionIds1 = Arrays.asList(1L, 2L);
        List<Long> metricIds1 = Arrays.asList(1L);
        chatDefaultConfigAgg.setDimensionIds(dimensionIds1);
        chatDefaultConfigAgg.setMetricIds(metricIds1);
        chatDefaultConfigAgg.setUnit(7);
        chatDefaultConfigAgg.setPeriod("DAY");
        chatDefaultConfigAgg.setTimeMode(ChatDefaultConfigReq.TimeMode.RECENT);
        chatAggConfig.setChatDefaultConfig(chatDefaultConfigAgg);
        ItemVisibility visibility1 = new ItemVisibility();
        chatAggConfig.setVisibility(visibility1);
        List<KnowledgeInfoReq> knowledgeInfos = new ArrayList<>();
        KnowledgeInfoReq knowledgeInfoReq = new KnowledgeInfoReq();
        knowledgeInfoReq.setItemId(1L);
        knowledgeInfoReq.setSearchEnable(true);
        knowledgeInfos.add(knowledgeInfoReq);
        KnowledgeInfoReq knowledgeInfoReq2 = new KnowledgeInfoReq();
        knowledgeInfoReq2.setItemId(2L);
        knowledgeInfoReq2.setSearchEnable(true);
        knowledgeInfos.add(knowledgeInfoReq2);
        chatAggConfig.setKnowledgeInfos(knowledgeInfos);
        chatConfigBaseReq.setChatAggConfig(chatAggConfig);

        List<RecommendedQuestionReq> recommendedQuestions = new ArrayList<>();
        recommendedQuestions.add(new RecommendedQuestionReq("Number of u visits"));
        recommendedQuestions.add(new RecommendedQuestionReq("Summary of the number of visits in the past 15 days"));
        recommendedQuestions.add(new RecommendedQuestionReq("Summary of the number of visits in the past 15 days"));
        recommendedQuestions.add(new RecommendedQuestionReq("Counting the number of visitors by department"));
        recommendedQuestions.add(new RecommendedQuestionReq("Comparing the length of stay of Alice and Lucy"));
        recommendedQuestions.add(new RecommendedQuestionReq("Department with the highest number of visits"));
        chatConfigBaseReq.setRecommendedQuestions(recommendedQuestions);

        configService.addConfig(chatConfigBaseReq, user);
    }

    public void addDemoChatConfig_2() {
        ChatConfigBaseReq chatConfigBaseReq = new ChatConfigBaseReq();
        chatConfigBaseReq.setModelId(2L);

        ChatDetailConfigReq chatDetailConfig = new ChatDetailConfigReq();
        ChatDefaultConfigReq chatDefaultConfigDetail = new ChatDefaultConfigReq();
        List<Long> dimensionIds0 = Arrays.asList(4L, 5L, 6L, 7L);
        List<Long> metricIds0 = Arrays.asList(4L);
        chatDefaultConfigDetail.setDimensionIds(dimensionIds0);
        chatDefaultConfigDetail.setMetricIds(metricIds0);
        chatDefaultConfigDetail.setUnit(7);
        chatDefaultConfigDetail.setPeriod("DAY");
        chatDetailConfig.setChatDefaultConfig(chatDefaultConfigDetail);
        ItemVisibility visibility0 = new ItemVisibility();
        chatDetailConfig.setVisibility(visibility0);
        chatConfigBaseReq.setChatDetailConfig(chatDetailConfig);

        ChatAggConfigReq chatAggConfig = new ChatAggConfigReq();
        ChatDefaultConfigReq chatDefaultConfigAgg = new ChatDefaultConfigReq();
        List<Long> dimensionIds1 = Arrays.asList(4L, 5L, 6L, 7L);
        List<Long> metricIds1 = Arrays.asList(4L);
        chatDefaultConfigAgg.setDimensionIds(dimensionIds1);
        chatDefaultConfigAgg.setMetricIds(metricIds1);
        chatDefaultConfigAgg.setUnit(7);
        chatDefaultConfigAgg.setPeriod("DAY");
        chatDefaultConfigAgg.setTimeMode(ChatDefaultConfigReq.TimeMode.RECENT);
        chatAggConfig.setChatDefaultConfig(chatDefaultConfigAgg);
        ItemVisibility visibility1 = new ItemVisibility();
        chatAggConfig.setVisibility(visibility1);
        chatConfigBaseReq.setChatAggConfig(chatAggConfig);

        List<RecommendedQuestionReq> recommendedQuestions = new ArrayList<>();
        chatConfigBaseReq.setRecommendedQuestions(recommendedQuestions);

        configService.addConfig(chatConfigBaseReq, user);
    }


    private void addPlugin_1() {
        Plugin plugin1 = new Plugin();
        plugin1.setType("WEB_PAGE");
        plugin1.setModelList(Arrays.asList(1L));
        plugin1.setPattern("It is used to analyze the flow profile of the ultrasonic number, including the tracking of core indicators such as UV and PV. P.S. Presented as an example only, no actual Kanban board");
        plugin1.setName("UltraSonic Traffic Analysis Kanban");
        PluginParseConfig pluginParseConfig = new PluginParseConfig();
        pluginParseConfig.setDescription(plugin1.getPattern());
        pluginParseConfig.setName(plugin1.getName());
        pluginParseConfig.setExamples(Lists.newArrayList("How is Tom's recent visit to UltraSonic"));
        plugin1.setParseModeConfig(JSONObject.toJSONString(pluginParseConfig));
        WebBase webBase = new WebBase();
        webBase.setUrl("www.yourbi.com");
        ParamOption paramOption = new ParamOption();
        paramOption.setKey("name");
        paramOption.setParamType(ParamOption.ParamType.SEMANTIC);
        paramOption.setElementId(2L);
        paramOption.setModelId(1L);
        List<ParamOption> paramOptions = Arrays.asList(paramOption);
        webBase.setParamOptions(paramOptions);
        plugin1.setConfig(JsonUtil.toString(webBase));

        pluginService.createPlugin(plugin1, user);
    }

    private void addAgent1() {
        Agent agent = new Agent();
        agent.setId(1);
        agent.setName("Calculate indicators");
        agent.setDescription("Helps you query metrics in natural language, supporting time limits, conditional filtering, drill-down dimensions, and aggregated statistics");
        agent.setStatus(1);
        agent.setEnableSearch(1);
        agent.setExamples(Lists.newArrayList("Number of visits", "Summary of visits in the past 15 days", "Number of visitors by department",
                "Comparison of length of stay with Alice and Lucy", "Department with the highest number of ultrasound visits"));
        AgentConfig agentConfig = new AgentConfig();
        RuleQueryTool ruleQueryTool = new RuleQueryTool();
        ruleQueryTool.setType(AgentToolType.RULE);
        ruleQueryTool.setId("0");
        ruleQueryTool.setModelIds(Lists.newArrayList(-1L));
        ruleQueryTool.setQueryModes(Lists.newArrayList(
                "METRIC_ENTITY", "METRIC_FILTER", "METRIC_GROUPBY",
                "METRIC_MODEL", "METRIC_ORDERBY"
        ));
        agentConfig.getTools().add(ruleQueryTool);

        DslTool dslTool = new DslTool();
        dslTool.setId("1");
        dslTool.setType(AgentToolType.DSL);
        dslTool.setModelIds(Lists.newArrayList(-1L));
        agentConfig.getTools().add(dslTool);

        agent.setAgentConfig(JSONObject.toJSONString(agentConfig));
        agentService.createAgent(agent, User.getFakeUser());
    }

    private void addAgent2() {
        Agent agent = new Agent();
        agent.setId(2);
        agent.setName("Tags Entity");
        agent.setDescription("Helps you tag entities with natural language, supports multi-criteria combination filtering");
        agent.setStatus(1);
        agent.setEnableSearch(1);
        agent.setExamples(Lists.newArrayList("Chinese style artist", "Hong Kong and Taiwan area artist", "style for popular artist"));
        AgentConfig agentConfig = new AgentConfig();
        RuleQueryTool ruleQueryTool = new RuleQueryTool();
        ruleQueryTool.setId("0");
        ruleQueryTool.setType(AgentToolType.RULE);
        ruleQueryTool.setModelIds(Lists.newArrayList(-1L));
        ruleQueryTool.setQueryModes(Lists.newArrayList(
                "ENTITY_DETAIL", "ENTITY_LIST_FILTER", "ENTITY_ID"));
        agentConfig.getTools().add(ruleQueryTool);

        DslTool dslTool = new DslTool();
        dslTool.setId("1");
        dslTool.setType(AgentToolType.DSL);
        dslTool.setModelIds(Lists.newArrayList(-1L));
        agentConfig.getTools().add(dslTool);

        agent.setAgentConfig(JSONObject.toJSONString(agentConfig));
        agentService.createAgent(agent, User.getFakeUser());
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent applicationReadyEvent) {
        if (!demoEnable) {
            return;
        }
        try {
            addDemoChatConfig_1();
            addDemoChatConfig_2();
            addPlugin_1();
            addAgent1();
            addAgent2();
            addSampleChats();
            addSampleChats2();
        } catch (Exception e) {
            log.error("Failed to add sample chats", e);
        }
    }


}
