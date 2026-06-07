package com.generated.ldmurdergame.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.generated.ldmurdergame.model.KpiTargetUpdateRequest;
import com.generated.ldmurdergame.model.OverviewResponse;
import com.generated.ldmurdergame.service.OverviewService;

@RestController
public class OverviewController {
  private final OverviewService overviewService;

  public OverviewController(OverviewService overviewService) {
    this.overviewService = overviewService;
  }

  @GetMapping({"/overview", "/api/overview"})
  public OverviewResponse overview() {
    return overviewService.getOverview();
  }

  @PostMapping({"/kpi/target", "/api/kpi/target"})
  public Map<String, Object> updateKpiTarget(@RequestBody KpiTargetUpdateRequest request) {
    boolean success = overviewService.updateKpiTarget(request.label(), request.monthlyTarget());
    return Map.of("success", success, "message", success ? "目标更新成功" : "指标不存在");
  }
}
