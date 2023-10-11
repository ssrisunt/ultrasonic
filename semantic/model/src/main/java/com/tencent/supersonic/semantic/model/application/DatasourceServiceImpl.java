package com.tencent.supersonic.semantic.model.application;

import com.alibaba.fastjson.JSONObject;
import com.google.common.collect.Lists;
import com.tencent.supersonic.auth.api.authentication.pojo.User;
import com.tencent.supersonic.common.pojo.exception.InvalidArgumentException;
import com.tencent.supersonic.common.util.JsonUtil;
import com.tencent.supersonic.semantic.api.model.pojo.DatasourceDetail;
import com.tencent.supersonic.semantic.api.model.pojo.Dim;
import com.tencent.supersonic.semantic.api.model.pojo.Identify;
import com.tencent.supersonic.semantic.api.model.pojo.ItemDateFilter;
import com.tencent.supersonic.semantic.api.model.pojo.Measure;
import com.tencent.supersonic.semantic.api.model.yaml.DatasourceYamlTpl;
import com.tencent.supersonic.semantic.api.model.yaml.DimensionYamlTpl;
import com.tencent.supersonic.semantic.api.model.yaml.MetricYamlTpl;
import com.tencent.supersonic.semantic.api.model.request.DatasourceRelaReq;
import com.tencent.supersonic.semantic.api.model.request.DatasourceReq;
import com.tencent.supersonic.semantic.api.model.request.DateInfoReq;
import com.tencent.supersonic.semantic.api.model.request.DimensionReq;
import com.tencent.supersonic.semantic.api.model.request.MetricReq;
import com.tencent.supersonic.semantic.api.model.response.DatabaseResp;
import com.tencent.supersonic.semantic.api.model.response.DatasourceRelaResp;
import com.tencent.supersonic.semantic.api.model.response.DatasourceResp;
import com.tencent.supersonic.semantic.api.model.response.DimensionResp;
import com.tencent.supersonic.semantic.api.model.response.ItemDateResp;
import com.tencent.supersonic.semantic.api.model.response.MeasureResp;
import com.tencent.supersonic.semantic.api.model.response.MetricResp;
import com.tencent.supersonic.semantic.model.domain.DatabaseService;
import com.tencent.supersonic.semantic.model.domain.DatasourceService;
import com.tencent.supersonic.semantic.model.domain.DimensionService;
import com.tencent.supersonic.semantic.model.domain.MetricService;
import com.tencent.supersonic.semantic.model.domain.dataobject.DatasourceDO;
import com.tencent.supersonic.semantic.model.domain.dataobject.DatasourceRelaDO;
import com.tencent.supersonic.semantic.model.domain.dataobject.DateInfoDO;
import com.tencent.supersonic.semantic.model.domain.manager.DatasourceYamlManager;
import com.tencent.supersonic.semantic.model.domain.manager.DimensionYamlManager;
import com.tencent.supersonic.semantic.model.domain.manager.MetricYamlManager;
import com.tencent.supersonic.semantic.model.domain.pojo.Datasource;
import com.tencent.supersonic.semantic.model.domain.repository.DatasourceRepository;
import com.tencent.supersonic.semantic.model.domain.repository.DateInfoRepository;
import com.tencent.supersonic.semantic.model.domain.utils.DatasourceConverter;
import com.tencent.supersonic.semantic.model.domain.utils.DimensionConverter;
import com.tencent.supersonic.semantic.model.domain.utils.MetricConverter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import com.tencent.supersonic.semantic.model.domain.utils.NameCheckUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.BeanUtils;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;


@Service
@Slf4j
public class DatasourceServiceImpl implements DatasourceService {

    private DatasourceRepository datasourceRepository;

    private DatabaseService databaseService;

    private DimensionService dimensionService;

    private MetricService metricService;

    private DateInfoRepository dateInfoRepository;


    public DatasourceServiceImpl(DatasourceRepository datasourceRepository,
            DatabaseService databaseService,
            @Lazy DimensionService dimensionService,
            @Lazy MetricService metricService,
            DateInfoRepository dateInfoRepository) {
        this.datasourceRepository = datasourceRepository;
        this.databaseService = databaseService;
        this.dimensionService = dimensionService;
        this.metricService = metricService;
        this.dateInfoRepository = dateInfoRepository;
    }

    @Override
    @Transactional
    public DatasourceResp createDatasource(DatasourceReq datasourceReq, User user) throws Exception {
        preCheck(datasourceReq);
        checkExist(datasourceReq);
        Datasource datasource = DatasourceConverter.convert(datasourceReq);
        log.info("[create datasource] object:{}", JSONObject.toJSONString(datasource));
        saveDatasource(datasource, user);
        Optional<DatasourceResp> datasourceDescOptional = getDatasource(datasourceReq.getModelId(),
                datasourceReq.getBizName());
        if (!datasourceDescOptional.isPresent()) {
            throw new RuntimeException("Failed to create data source");
        }
        DatasourceResp datasourceResp = datasourceDescOptional.get();
        datasource.setId(datasourceResp.getId());
        batchCreateDimension(datasource, user);
        batchCreateMetric(datasource, user);
        return datasourceResp;
    }

    @Override
    @Transactional
    public DatasourceResp updateDatasource(DatasourceReq datasourceReq, User user) throws Exception {
        preCheck(datasourceReq);
        Datasource datasource = DatasourceConverter.convert(datasourceReq);

        log.info("[update datasource] object:{}", JSONObject.toJSONString(datasource));

        batchCreateDimension(datasource, user);
        batchCreateMetric(datasource, user);
        DatasourceDO datasourceDO = updateDatasource(datasource, user);
        return DatasourceConverter.convert(datasourceDO);
    }

    private DatasourceDO updateDatasource(Datasource datasource, User user) {
        DatasourceDO datasourceDO = datasourceRepository.getDatasourceById(datasource.getId());
        datasource.updatedBy(user.getName());
        datasourceRepository.updateDatasource(DatasourceConverter.convert(datasourceDO, datasource));
        return datasourceDO;
    }

    @Override
    public List<MeasureResp> getMeasureListOfModel(Long modelId) {
        List<DatasourceResp> datasourceResps = getDatasourceList(modelId);
        List<MeasureResp> measureResps = Lists.newArrayList();
        if (!CollectionUtils.isEmpty(datasourceResps)) {
            for (DatasourceResp datasourceDesc : datasourceResps) {
                DatasourceDetail datasourceDetail = datasourceDesc.getDatasourceDetail();
                List<Measure> measures = datasourceDetail.getMeasures();
                if (!CollectionUtils.isEmpty(measures)) {
                    measureResps.addAll(
                            measures.stream().map(measure -> DatasourceConverter.convert(measure, datasourceDesc))
                                    .collect(Collectors.toList()));
                }
            }
        }
        return measureResps;
    }


    private void batchCreateDimension(Datasource datasource, User user) throws Exception {
        List<DimensionReq> dimensionReqs = DatasourceConverter.convertDimensionList(datasource);
        dimensionService.createDimensionBatch(dimensionReqs, user);
    }

    private void batchCreateMetric(Datasource datasource, User user) throws Exception {
        List<MetricReq> exprMetricReqs = DatasourceConverter.convertMetricList(datasource);
        metricService.createMetricBatch(exprMetricReqs, user);
    }


    private Optional<DatasourceResp> getDatasource(Long modelId, String bizName) {
        List<DatasourceResp> datasourceResps = getDatasourceList(modelId);
        if (CollectionUtils.isEmpty(datasourceResps)) {
            return Optional.empty();
        }
        for (DatasourceResp datasourceDesc : datasourceResps) {
            if (datasourceDesc.getBizName().equals(bizName)) {
                return Optional.of(datasourceDesc);
            }
        }
        return Optional.empty();
    }

    //保存并获取自增ID
    private void saveDatasource(Datasource datasource, User user) {
        DatasourceDO datasourceDO = DatasourceConverter.convert(datasource, user);
        log.info("[save datasource] datasourceDO:{}", JSONObject.toJSONString(datasourceDO));
        datasourceRepository.createDatasource(datasourceDO);
        datasource.setId(datasourceDO.getId());
    }


    private void preCheck(DatasourceReq datasourceReq) {
        if (NameCheckUtils.containsSpecialCharacters(datasourceReq.getName())) {
            String message = String.format("The data source name [%s] contains special characters, please modify it", datasourceReq.getName());
            throw new InvalidArgumentException(message);
        }
        List<Dim> dims = datasourceReq.getDimensions();
        List<Measure> measures = datasourceReq.getMeasures();
        List<Dim> timeDims = datasourceReq.getTimeDimension();
        List<Identify> identifies = datasourceReq.getIdentifiers();
        if (CollectionUtils.isEmpty(dims)) {
            throw new InvalidArgumentException("Missing dimension information");
        }
        if (CollectionUtils.isEmpty(identifies)) {
            throw new InvalidArgumentException("Missing primary key information");
        }
        if (!CollectionUtils.isEmpty(measures) && CollectionUtils.isEmpty(timeDims)) {
            throw new InvalidArgumentException("When there is measurement, the time dimension is indispensable");
        }
        for (Measure measure : measures) {
            if (StringUtils.isNotBlank(measure.getName())
                    && NameCheckUtils.containsSpecialCharacters(measure.getName())) {
                String message = String.format("Measurement [%s] contains special characters, please modify it", measure.getName());
                throw new InvalidArgumentException(message);
            }
        }
        for (Dim dim : dims) {
            if (StringUtils.isNotBlank(dim.getName())
                    && NameCheckUtils.containsSpecialCharacters(dim.getName())) {
                String message = String.format("Dimension [%s] contains special characters, please modify it", dim.getName());
                throw new InvalidArgumentException(message);
            }
        }
        for (Identify identify : identifies) {
            if (StringUtils.isNotBlank(identify.getName())
                    && NameCheckUtils.containsSpecialCharacters(identify.getName())) {
                String message = String.format("Primary key/foreign key [%s] contains special characters, please modify it", identify.getName());
                throw new InvalidArgumentException(message);
            }
        }
    }

    private void checkExist(DatasourceReq datasourceReq) {
        Optional<DatasourceResp> datasourceRespOptional = getDatasource(datasourceReq.getModelId(),
                datasourceReq.getBizName());
        if (datasourceRespOptional.isPresent()) {
            throw new InvalidArgumentException("A data source name already exists:" + datasourceReq.getBizName());
        }
    }

    @Override
    public List<DatasourceResp> getDatasourceList(Long modelId) {
        return DatasourceConverter.convertList(datasourceRepository.getDatasourceList(modelId));
    }

    @Override
    public List<DatasourceResp> getDatasourceList() {
        return DatasourceConverter.convertList(datasourceRepository.getDatasourceList());
    }

    @Override
    public List<DatasourceResp> getDatasourceListByDatabaseId(Long databaseId) {
        return getDatasourceList().stream()
                .filter(datasourceResp -> datasourceResp.getDatabaseId().equals(databaseId))
                .collect(Collectors.toList());
    }

    @Override
    public List<DatasourceResp> getDatasourceListNoMeasurePrefix(Long modelId) {
        List<DatasourceResp> datasourceResps = getDatasourceList(modelId);
        for (DatasourceResp datasourceResp : datasourceResps) {
            if (!CollectionUtils.isEmpty(datasourceResp.getDatasourceDetail().getMeasures())) {
                for (Measure measure : datasourceResp.getDatasourceDetail().getMeasures()) {
                    measure.setBizName(Optional.ofNullable(measure.getBizName()).orElse("")
                            .replace(getDatasourcePrefix(datasourceResp.getBizName()), ""));
                }
            }
        }
        return datasourceResps;
    }

    private String getDatasourcePrefix(String datasourceBizName) {
        return String.format("%s_", datasourceBizName);
    }


    @Override
    public Map<Long, DatasourceResp> getDatasourceMap() {
        Map<Long, DatasourceResp> map = new HashMap<>();
        List<DatasourceResp> datasourceResps = getDatasourceList();
        if (CollectionUtils.isEmpty(datasourceResps)) {
            return map;
        }
        return datasourceResps.stream().collect(Collectors.toMap(DatasourceResp::getId, a -> a, (k1, k2) -> k1));
    }


    @Override
    public void deleteDatasource(Long id) {
        DatasourceDO datasourceDO = datasourceRepository.getDatasourceById(id);
        if (datasourceDO == null) {
            return;
        }
        checkDelete(datasourceDO.getModelId(), id);
        datasourceRepository.deleteDatasource(id);
    }

    private void checkDelete(Long modelId, Long datasourceId) {
        List<MetricResp> metricResps = metricService.getMetrics(modelId, datasourceId);
        List<DimensionResp> dimensionResps = dimensionService.getDimensionsByDatasource(datasourceId);
        if (!CollectionUtils.isEmpty(metricResps) || !CollectionUtils.isEmpty(dimensionResps)) {
            throw new RuntimeException("There are indicators and dimensions created based on this data source. They cannot be deleted yet. Please confirm.");
        }
    }


    private List<DatasourceRelaResp> convertDatasourceRelaList(List<DatasourceRelaDO> datasourceRelaDOS) {
        List<DatasourceRelaResp> datasourceRelaResps = Lists.newArrayList();
        if (CollectionUtils.isEmpty(datasourceRelaDOS)) {
            return datasourceRelaResps;
        }
        return datasourceRelaDOS.stream().map(DatasourceConverter::convert).collect(Collectors.toList());
    }


    @Override

    public DatasourceRelaResp createOrUpdateDatasourceRela(DatasourceRelaReq datasourceRelaReq, User user) {
        if (datasourceRelaReq.getId() == null) {
            DatasourceRelaDO datasourceRelaDO = new DatasourceRelaDO();
            BeanUtils.copyProperties(datasourceRelaReq, datasourceRelaDO);
            datasourceRelaDO.setCreatedAt(new Date());
            datasourceRelaDO.setCreatedBy(user.getName());
            datasourceRelaDO.setUpdatedAt(new Date());
            datasourceRelaDO.setUpdatedBy(user.getName());
            datasourceRepository.createDatasourceRela(datasourceRelaDO);
            return DatasourceConverter.convert(datasourceRelaDO);
        }
        Long id = datasourceRelaReq.getId();
        DatasourceRelaDO datasourceRelaDO = datasourceRepository.getDatasourceRelaById(id);
        BeanUtils.copyProperties(datasourceRelaDO, datasourceRelaReq);
        datasourceRelaDO.setUpdatedAt(new Date());
        datasourceRelaDO.setUpdatedBy(user.getName());
        datasourceRepository.updateDatasourceRela(datasourceRelaDO);
        return DatasourceConverter.convert(datasourceRelaDO);
    }

    @Override
    public List<DatasourceRelaResp> getDatasourceRelaList(Long modelId) {
        return convertDatasourceRelaList(datasourceRepository.getDatasourceRelaList(modelId));
    }


    @Override
    public void deleteDatasourceRela(Long id) {
        datasourceRepository.deleteDatasourceRela(id);
    }


    @Override
    public ItemDateResp getItemDate(ItemDateFilter dimension, ItemDateFilter metric) {
        List<DateInfoReq> itemDates = new ArrayList<>();
        List<DateInfoDO> dimensions = dateInfoRepository.getDateInfos(dimension);
        List<DateInfoDO> metrics = dateInfoRepository.getDateInfos(metric);

        log.info("getDateDate, dimension:{}, dimensions dateInfo:{}", dimension, dimensions);
        log.info("getDateDate, metric:{}, metrics dateInfo:{}", metric, metrics);
        itemDates.addAll(convert(dimensions));
        itemDates.addAll(convert(metrics));

        ItemDateResp itemDateDescriptor = calculateDateInternal(itemDates);
        log.info("itemDateDescriptor:{}", itemDateDescriptor);

        return itemDateDescriptor;
    }

    private List<DateInfoReq> convert(List<DateInfoDO> dateInfoDOList) {
        List<DateInfoReq> dateInfoCommendList = new ArrayList<>();
        dateInfoDOList.stream().forEach(dateInfoDO -> {
            DateInfoReq dateInfoCommend = new DateInfoReq();
            BeanUtils.copyProperties(dateInfoDO, dateInfoCommend);
            dateInfoCommend.setUnavailableDateList(JsonUtil.toList(dateInfoDO.getUnavailableDateList(), String.class));
            dateInfoCommendList.add(dateInfoCommend);
        });
        return dateInfoCommendList;
    }

    private ItemDateResp calculateDateInternal(List<DateInfoReq> itemDates) {
        if (CollectionUtils.isEmpty(itemDates)) {
            log.warn("itemDates is empty!");
            return null;
        }
        String dateFormat = itemDates.get(0).getDateFormat();
        String startDate = itemDates.get(0).getStartDate();
        String endDate = itemDates.get(0).getEndDate();
        String datePeriod = itemDates.get(0).getDatePeriod();
        List<String> unavailableDateList = itemDates.get(0).getUnavailableDateList();
        for (DateInfoReq item : itemDates) {
            String startDate1 = item.getStartDate();
            String endDate1 = item.getEndDate();
            List<String> unavailableDateList1 = item.getUnavailableDateList();
            if (Strings.isNotEmpty(startDate1) && startDate1.compareTo(startDate) > 0) {
                startDate = startDate1;
            }
            if (Strings.isNotEmpty(endDate1) && endDate1.compareTo(endDate) < 0) {
                endDate = endDate1;
            }
            if (!CollectionUtils.isEmpty(unavailableDateList1)) {
                unavailableDateList.addAll(unavailableDateList1);
            }
        }

        return new ItemDateResp(dateFormat, startDate, endDate, datePeriod, unavailableDateList);

    }

    @Override
    public void getModelYamlTplByModelIds(Set<Long> modelIds, Map<String, List<DimensionYamlTpl>> dimensionYamlMap,
            List<DatasourceYamlTpl> datasourceYamlTplList, List<MetricYamlTpl> metricYamlTplList) {
        for (Long modelId : modelIds) {
            List<DatasourceResp> datasourceResps = getDatasourceList(modelId);
            List<MetricResp> metricResps = metricService.getMetrics(modelId);
            metricYamlTplList.addAll(MetricYamlManager.convert2YamlObj(MetricConverter.metricInfo2Metric(metricResps)));
            Long databaseId = datasourceResps.iterator().next().getDatabaseId();
            DatabaseResp databaseResp = databaseService.getDatabase(databaseId);
            List<DimensionResp> dimensionResps = dimensionService.getDimensions(modelId);
            for (DatasourceResp datasourceResp : datasourceResps) {
                datasourceYamlTplList.add(DatasourceYamlManager.convert2YamlObj(
                        DatasourceConverter.datasourceInfo2Datasource(datasourceResp), databaseResp));
                if (!dimensionYamlMap.containsKey(datasourceResp.getBizName())) {
                    dimensionYamlMap.put(datasourceResp.getBizName(), new ArrayList<>());
                }
                List<DimensionResp> dimensionRespList = dimensionResps.stream()
                        .filter(d -> d.getDatasourceBizName().equalsIgnoreCase(datasourceResp.getBizName()))
                        .collect(Collectors.toList());
                dimensionYamlMap.get(datasourceResp.getBizName()).addAll(DimensionYamlManager.convert2DimensionYaml(
                        DimensionConverter.dimensionInfo2Dimension(dimensionRespList)));
            }
        }

    }
}
