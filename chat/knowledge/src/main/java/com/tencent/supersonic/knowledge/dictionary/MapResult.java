package com.tencent.supersonic.knowledge.dictionary;

import com.google.common.base.Objects;
import java.io.Serializable;
import java.util.List;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class MapResult implements Serializable {

    private String name;
    private List<String> natures;
    private int offset = 0;

    private double similarity;

    private String detectWord;

    public MapResult() {

    }

    public MapResult(String name, List<String> natures, String detectWord) {
        this.name = name;
        this.natures = natures;
        this.detectWord = detectWord;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        MapResult mapResult = (MapResult) o;
        return Objects.equal(name, mapResult.name) && Objects.equal(natures, mapResult.natures);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(name, natures);
    }

    public void setOffset(int offset) {
        this.offset = offset;
    }

}