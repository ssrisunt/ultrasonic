package com.tencent.supersonic.common.util;


import com.plexpt.chatgpt.ChatGPT;
import com.plexpt.chatgpt.entity.chat.ChatCompletion;
import com.plexpt.chatgpt.entity.chat.ChatCompletionResponse;
import com.plexpt.chatgpt.entity.chat.Message;
import com.plexpt.chatgpt.util.Proxys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.Proxy;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;


@Component
@Slf4j
public class ChatGptHelper {

    @Value("${llm.chatgpt.apikey:}")
    private String apiKey;

    @Value("${llm.chatgpt.apiHost:}")
    private String apiHost;

    @Value("${llm.chatgpt.proxyIp:}")
    private String proxyIp;

    @Value("${llm.chatgpt.proxyPort:}")
    private Integer proxyPort;


    public ChatGPT getChatGPT() {
        Proxy proxy = null;
        if (!"default".equals(proxyIp)) {
            proxy = Proxys.http(proxyIp, proxyPort);
        }
        return ChatGPT.builder()
                .apiKey(apiKey)
                .proxy(proxy)
                .timeout(900)
                .apiHost(apiHost) //反向代理地址
                .build()
                .init();
    }

    public Message getChatCompletion(Message system, Message message) {
        ChatCompletion chatCompletion = ChatCompletion.builder()
                .model(ChatCompletion.Model.GPT_3_5_TURBO_16K.getName())
                .messages(Arrays.asList(system, message))
                .maxTokens(10000)
                .temperature(0.9)
                .build();
        ChatCompletionResponse response = getChatGPT().chatCompletion(chatCompletion);
        return response.getChoices().get(0).getMessage();
    }

    public String inferredTime(String queryText) {
        long nowTime = System.currentTimeMillis();
        Date date = new Date(nowTime);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        String formattedDate = sdf.format(date);
        Message system = Message.ofSystem("Current Time " + formattedDate + "，You are a professional data analyst, and your task is to answer users' questions professionally based on data."
                + "You need to follow these rules:\n"
                + "1.Returns the canonical data format，json，as： input：near10 The number of daily active days，output：{\"start\":\"2023-07-21\",\"end\":\"2023-07-31\"}"
                + "2.You require a specification of time data, which can be approximate 10 Day, National Day, Dragon Boat Festival, get the corresponding time, fill in the json.\n"
                + "3.你的数据时间，只有当前及之前时间即可,超过则回复去年\n"
                + "4.Only the time needs to be parsed，The time can be time, month, year, or day、The calendar uses the Gregorian calendar\n"
                + "5.The time is given if it is absolutely correct，You can't make it up\n"

        );
        Message message = Message.of("输入：" + queryText + "，输出：");
        Message res = getChatCompletion(system, message);
        return res.getContent();
    }


    public String mockAlias(String mockType,
                            String name,
                            String bizName,
                            String table,
                            String desc,
                            Boolean isPercentage) {
        String msg = "Assuming you are a professional data analyst specializing in metrics and dimensions, "
                + "you have a vast amount of data analysis metrics content. You are familiar with the basic"
                + " format of the content,Now, Construct your answer Based on the following json-schema.\n"
                + "{\n"
                + "\"$schema\": \"http://json-schema.org/draft-07/schema#\",\n"
                + "\"type\": \"array\",\n"
                + "\"minItems\": 2,\n"
                + "\"maxItems\": 4,\n"
                + "\"items\": {\n"
                + "\"type\": \"string\",\n"
                + "\"description\": \"Assuming you are a data analyst and give a defined "
                + mockType
                + " name: "
                + name + ","
                + "this "
                + mockType
                + " is from database and table: "
                + table + ",This "
                + mockType
                + " calculates the field source: "
                + bizName
                + ", The description of this metrics is: "
                + desc
                + ", provide some aliases for this, please take chinese or english,"
                + "You must adhere to the following rules:\n"
                + "1. Please do not generate aliases like xxx1, xxx2, xxx3.\n"
                + "2. Please do not generate aliases that are the same as the original names of metrics/dimensions.\n"
                + "3. Please pay attention to the quality of the generated aliases and "
                + "   avoid creating aliases that look like test data.\n"
                + "4. Please generate more Chinese aliases."
                + "},\n"
                + "\"additionalProperties\":false}\n"
                + "Please double-check whether the answer conforms to the format described in the JSON-schema.\n"
                + "ANSWER JSON:";
        log.info("msg:{}", msg);
        Message system = Message.ofSystem("");
        Message message = Message.of(msg);
        Message res = getChatCompletion(system, message);
        return res.getContent();
    }


    public String mockDimensionValueAlias(String json) {
        String msg = "Assuming you are a professional data analyst specializing in indicators,for you a json list，"
                + "the required content to follow is as follows: "
                + "1. The format of JSON,"
                + "2. Only return in JSON format,"
                + "3. the array item > 1 and < 5,more alias,"
                + "for example：input:[\"qq_music\",\"kugou_music\"],"
                + "out:{\"tran\":[\"qqMusic\",\"KugouMusic\"],\"alias\":{\"qq_music\":[\"qTone\",\"qqMusic\"],"
                + "\"kugou_music\":[\"kugou\",\"coolDogs\"]}},"
                + "now input: "
                + json + ","
                + "answer json:";
        log.info("msg:{}", msg);
        Message system = Message.ofSystem("");
        Message message = Message.of(msg);
        Message res = getChatCompletion(system, message);
        return res.getContent();
    }


    public static void main(String[] args) {
        ChatGptHelper chatGptHelper = new ChatGptHelper();
        System.out.println(chatGptHelper.mockAlias("", "", "", "", "", false));
    }


}
