package com.tencent.supersonic;

import com.tencent.supersonic.auth.api.authentication.pojo.User;
import com.tencent.supersonic.common.pojo.enums.AggOperatorEnum;
import com.tencent.supersonic.semantic.api.model.enums.DimensionTypeEnum;
import com.tencent.supersonic.semantic.api.model.enums.IdentifyTypeEnum;
import com.tencent.supersonic.semantic.api.model.pojo.Dim;
import com.tencent.supersonic.semantic.api.model.pojo.DimensionTimeTypeParams;
import com.tencent.supersonic.semantic.api.model.pojo.Identify;
import com.tencent.supersonic.semantic.api.model.pojo.Measure;
import com.tencent.supersonic.semantic.api.model.request.DatasourceReq;
import com.tencent.supersonic.semantic.api.model.request.DomainReq;
import com.tencent.supersonic.semantic.api.model.request.ModelReq;
import com.tencent.supersonic.semantic.model.domain.DatasourceService;
import com.tencent.supersonic.semantic.model.domain.DomainService;
import com.tencent.supersonic.semantic.model.domain.ModelService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
@Slf4j
@Order(2)
public class LoadBenchMarkDemo implements CommandLineRunner {

    private User user = User.getFakeUser();

    @Value("${spring.h2.demo.enabled:false}")
    private boolean demoEnable;

    @Autowired
    private DomainService domainService;
    @Autowired
    private ModelService modelService;
    @Autowired
    private DatasourceService datasourceService;

    @Override
    public void run(String... args) {
        if (!demoEnable) {
            return;
        }
        try {
            addDomain();
            addModel_1();
            addDatasource_1();
            addDatasource_2();
            addDatasource_3();
            addDatasource_4();
        } catch (Exception e) {
            log.error("Failed to add bench mark demo data", e);
        }

    }

    public void addDomain() {
        DomainReq domainReq = new DomainReq();
        domainReq.setName("Assessment Data - Music");
        domainReq.setBizName("music");
        domainReq.setParentId(0L);
        domainReq.setViewers(Arrays.asList("admin", "tom", "jack"));
        domainReq.setViewOrgs(Collections.singletonList("admin"));
        domainReq.setAdmins(Collections.singletonList("admin"));
        domainReq.setAdminOrgs(Collections.emptyList());
        domainService.createDomain(domainReq, user);
    }

    public void addModel_1() {
        ModelReq modelReq = new ModelReq();
        modelReq.setName("Assessment Data - Music");
        modelReq.setBizName("music");
        modelReq.setDomainId(2L);
        modelReq.setViewers(Arrays.asList("admin", "tom", "jack"));
        modelReq.setViewOrgs(Collections.singletonList("admin"));
        modelReq.setAdmins(Collections.singletonList("admin"));
        modelReq.setAdminOrgs(Collections.emptyList());
        modelService.createModel(modelReq, user);
    }

    public void addDatasource_1() throws Exception {
        DatasourceReq datasourceReq = new DatasourceReq();
        datasourceReq.setModelId(3L);
        datasourceReq.setName("Art Type");
        datasourceReq.setBizName("genre");
        datasourceReq.setDescription("Art Type");
        datasourceReq.setDatabaseId(1L);

        List<Dim> dimensions = new ArrayList<>();
        Dim dimension1 = new Dim("", "imp_date", DimensionTypeEnum.time.name(), 0);
        dimension1.setTypeParams(new DimensionTimeTypeParams());
        dimensions.add(dimension1);
        dimensions.add(new Dim("Active Area", "most_popular_in", DimensionTypeEnum.categorical.name(), 1));
        datasourceReq.setDimensions(dimensions);

        List<Identify> identifiers = new ArrayList<>();
        identifiers.add(new Identify("Music Genre", IdentifyTypeEnum.primary.name(), "g_name"));
        datasourceReq.setIdentifiers(identifiers);

        List<Measure> measures = new ArrayList<>();
        Measure measure = new Measure("Rating", "rating", AggOperatorEnum.SUM.name(), 0);
        measures.add(measure);
        datasourceReq.setMeasures(measures);

        datasourceReq.setQueryType("sql_query");
        datasourceReq.setSqlQuery("SELECT g_name, rating, most_popular_in FROM genre");
        datasourceService.createDatasource(datasourceReq, user);
    }

    public void addDatasource_2() throws Exception {
        DatasourceReq datasourceReq = new DatasourceReq();
        datasourceReq.setModelId(3L);
        datasourceReq.setName("Artist");
        datasourceReq.setBizName("artist");
        datasourceReq.setDescription("Artist");
        datasourceReq.setDatabaseId(1L);

        List<Dim> dimensions = new ArrayList<>();
        dimensions.add(new Dim("Nationality", "country", DimensionTypeEnum.categorical.name(), 1));
        dimensions.add(new Dim("Gender", "gender", DimensionTypeEnum.categorical.name(), 1));
        datasourceReq.setDimensions(dimensions);

        List<Identify> identifiers = new ArrayList<>();
        identifiers.add(new Identify("Artist Name", IdentifyTypeEnum.primary.name(), "artist_name"));
        identifiers.add(new Identify("Music Genre Name", IdentifyTypeEnum.foreign.name(), "g_name"));
        datasourceReq.setIdentifiers(identifiers);

        datasourceReq.setMeasures(Collections.emptyList());

        datasourceReq.setQueryType("sql_query");
        datasourceReq.setSqlQuery("SELECT artist_name, country, gender, g_name FROM artist");
        datasourceService.createDatasource(datasourceReq, user);
    }

    public void addDatasource_3() throws Exception {
        DatasourceReq datasourceReq = new DatasourceReq();
        datasourceReq.setModelId(3L);
        datasourceReq.setName("File");
        datasourceReq.setBizName("files");
        datasourceReq.setDescription("File");
        datasourceReq.setDatabaseId(1L);

        List<Dim> dimensions = new ArrayList<>();
        dimensions.add(new Dim("duration", "duration", DimensionTypeEnum.categorical.name(), 1));
        dimensions.add(new Dim("file_format", "formats", DimensionTypeEnum.categorical.name(), 1));
        datasourceReq.setDimensions(dimensions);

        List<Identify> identifiers = new ArrayList<>();
        identifiers.add(new Identify("song_id", IdentifyTypeEnum.primary.name(), "f_id"));
        identifiers.add(new Identify("artist_name", IdentifyTypeEnum.foreign.name(), "artist_name"));
        datasourceReq.setIdentifiers(identifiers);

        datasourceReq.setMeasures(Collections.emptyList());

        datasourceReq.setQueryType("sql_query");
        datasourceReq.setSqlQuery("SELECT f_id, artist_name, file_size, duration, formats FROM files");
        datasourceService.createDatasource(datasourceReq, user);
    }

    public void addDatasource_4() throws Exception {
        DatasourceReq datasourceReq = new DatasourceReq();
        datasourceReq.setModelId(3L);
        datasourceReq.setName("Songs");
        datasourceReq.setBizName("song");
        datasourceReq.setDescription("Songs");
        datasourceReq.setDatabaseId(1L);

        List<Dim> dimensions = new ArrayList<>();
        Dim dimension1 = new Dim("", "imp_date", DimensionTypeEnum.time.name(), 0);
        dimension1.setTypeParams(new DimensionTimeTypeParams());
        dimensions.add(dimension1);
        dimensions.add(new Dim("Country", "country", DimensionTypeEnum.categorical.name(), 1));
        dimensions.add(new Dim("Language", "languages", DimensionTypeEnum.categorical.name(), 1));
        dimensions.add(new Dim("Release Date", "releasedate", DimensionTypeEnum.categorical.name(), 1));
        datasourceReq.setDimensions(dimensions);

        List<Identify> identifiers = new ArrayList<>();
        identifiers.add(new Identify("Song Name", IdentifyTypeEnum.primary.name(), "song_name"));
        identifiers.add(new Identify("Song ID", IdentifyTypeEnum.foreign.name(), "f_id"));
        datasourceReq.setIdentifiers(identifiers);

        List<Measure> measures = new ArrayList<>();
        measures.add(new Measure("resolution", "resolution", AggOperatorEnum.SUM.name(), 1));
        measures.add(new Measure("Rating", "rating", AggOperatorEnum.SUM.name(), 1));
        datasourceReq.setMeasures(measures);

        datasourceReq.setQueryType("sql_query");
        datasourceReq.setSqlQuery("SELECT imp_date, song_name, artist_name, country, f_id, g_name, "
                + " rating, languages, releasedate, resolution FROM song");
        datasourceService.createDatasource(datasourceReq, user);
    }

}