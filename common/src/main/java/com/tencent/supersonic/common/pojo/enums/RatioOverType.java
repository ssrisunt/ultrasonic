package com.tencent.supersonic.common.pojo.enums;

public enum RatioOverType {
    
    DAY_ON_DAY("Day-on-Day Ratio"),
    WEEK_ON_DAY("Week-on-Day Ratio"),
    WEEK_ON_WEEK("Week-on-Week Ratio"),
    MONTH_ON_WEEK("Month-on-Week Ratio"),
    MONTH_ON_MONTH("Month-on-Month Ratio"),
    YEAR_ON_MONTH("Year-on-Month Growth Rate"),
    YEAR_ON_YEAR("Year-on-Year Ratio");


    private String showName;

    RatioOverType(String showName) {
        this.showName = showName;
    }

    public String getShowName() {
        return showName;
    }
}
