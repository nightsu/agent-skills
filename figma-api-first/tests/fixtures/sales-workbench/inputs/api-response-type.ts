export interface SalesWorkbenchResponse {
  code: number;
  msg: string;
  success: boolean;
  data: {
    firstContactSection: {
      avgAssignedStudentCount: MetricValue;
      callOutRate: MetricValue;
      callConnectRate: MetricValue;
      wechatAddRate: MetricValue;
      notFirstContactRate: MetricValue;
      notFirstContactOver24hRate: MetricValue;
    };
    demandSection: {
      avgTalkDurationPerSales: MetricValue;
      avgEffectiveTalkDurationPerStudent: MetricValue;
      avgFollowCountPerStudent: MetricValue;
      evaSubmitRate: MetricValue;
      appDownloadRate: MetricValue;
    };
    conversionSection: {
      targetCompletionRate: MetricValue;
      headConversionRate: MetricValue;
      breakShellRate: MetricValue;
      ltv: MetricValue;
    };
  };
}

export interface MetricValue {
  numerator: number;
  denominator: number;
  percent: number;
}
