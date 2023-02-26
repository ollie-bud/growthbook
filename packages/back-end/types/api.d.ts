import { AuditInterface } from "./audit";
import { ExperimentStatus } from "./experiment";
import { FeatureRule, FeatureValueType } from "./feature";
import { OrganizationInterface } from "./organization";

export interface ExperimentOverride {
  weights?: number[];
  status?: ExperimentStatus;
  force?: number;
  coverage?: number;
  groups?: string[];
  url?: string;
}

export interface FeatureDefinitionRule {
  // eslint-disable-next-line
  force?: any;
  weights?: number[];
  // eslint-disable-next-line
  variations?: any[];
  hashAttribute?: string;
  namespace?: [string, number, number];
  key?: string;
  coverage?: number;
  // eslint-disable-next-line
  condition?: any;
}

export interface FeatureDefinition {
  // eslint-disable-next-line
  defaultValue: any;
  rules?: FeatureDefinitionRule[];
}

export interface ExperimentOverridesResponse {
  status: 200;
  overrides: Record<string, ExperimentOverride>;
  experiments: Record<string, { trackingKey: string }>;
}

export interface ErrorResponse {
  status: 400;
  error: string;
}

export interface ApiRequestLocals {
  apiKey: string;
  organization: OrganizationInterface;
  audit: (data: Partial<AuditInterface>) => Promise<void>;
}

export interface ApiErrorResponse {
  message: string;
}

export interface ApiPaginationFields {
  limit: number;
  offset: number;
  count: number;
  total: number;
  hasMore: boolean;
  nextOffset: number | null;
}

export interface ApiFeatureEnvironmentInterface {
  enabled: boolean;
  defaultValue: string;
  rules: FeatureRule[];
  definition: FeatureDefinition | null;
  draft: null | {
    enabled: boolean;
    defaultValue: string;
    rules: FeatureRule[];
    definition: FeatureDefinition | null;
  };
}

export interface ApiFeatureInterface {
  id: string;
  archived: boolean;
  description: string;
  owner: string;
  project: string;
  dateCreated: string;
  dateUpdated: string;
  valueType: FeatureValueType;
  defaultValue: string;
  tags: string[];
  environments: Record<string, ApiFeatureEnvironmentInterface>;
  revision: {
    version: number;
    comment: string;
    date: string;
    publishedBy: string;
  };
}

export type ApiSDKConnectionInterface = {
  id: string;
  name: string;
  dateCreated: string;
  dateUpdated: string;
  languages: string[];
  environment: string;
  project: string;
  encryptPayload: boolean;
  encryptionKey: string;
  key: string;
  proxyEnabled: boolean;
  proxyHost: string;
  proxySigningKey: string;
};

export type ApiExperimentInterface = {
  id: string;
  name: string;
  dateCreated: string;
  dateUpdated: string;
  project: string;
  hypothesis: string;
  description: string;
  tags: string[];
  owner: string;
  archived: boolean;
  status: string;
  autoRefresh: boolean;

  variations: Array<{
    variationId: string;
    key: string;
    name: string;
    description: string;
    screenshots: string[];
  }>;

  phases: Array<{
    name: string;
    dateStarted: string;
    dateEnded: string;
    reasonForStopping: string;
    seed: string;
    coverage: number;
    trafficSplit: Array<{
      variationId: string;
      weight: number;
    }>;
    namespace: null | {
      namespaceId: string;
      range: [number, number];
    };
    targetingCondition: string;
  }>;

  settings: ApiExperimentAnalysisSettingsInterface;

  resultSummary: null | {
    status: string;
    winner: string;
    conclusions: string;
  };
};

export interface ApiExperimentResultInterface {
  id: string;
  dateUpdated: string;

  experimentId: string;
  phase: string;
  dimension: {
    type: string;
    id?: string;
  };
  dateRange: [string, string];
  settings: ApiExperimentAnalysisSettingsInterface;
  queryIds: string[];

  results: Array<{
    dimension: string;
    totalUsers: number;
    checks: {
      srm: number;
    };
    metrics: Array<{
      metricId: string;
      variations: Array<{
        variationId: string;
        analyses: Array<{
          engine: "bayesian" | "frequentist";

          numerator: number;
          denominator: number;
          mean: number;
          stddev: number;
          percentChange: number;
          ci: [number, number];

          pValue?: number;
          risk?: number;
          changeToBeatControl?: number;
        }>;
      }>;
    }>;
  }>;
}

interface ApiExperimentAnalysisSettingsInterface {
  // Query settings
  datasourceId: string;
  exposureQueryId: string;
  experimentId: string;
  segmentId: string;
  queryFilter: string;
  inProgressConversions: "include" | "exclude";
  multipleVariations: "include" | "exclude";
  attributionModel: "firstExposure" | "allExposures";
  statsEngine: "bayesian" | "frequentist";

  // Metrics
  goals: ApiExperimentMetricInterface[];
  guardrails: ApiExperimentMetricInterface[];
  activationMetric: ApiExperimentMetricInterface | null;
}

interface ApiExperimentMetricInterface {
  metricId: string;
  overrides: {
    conversionWindowStart: null | number;
    conversionWindowEnd: null | number;
    winRiskThreshold: null | number;
    loseRiskThreshold: null | number;
  };
}

export interface ApiMetricInterface {
  id: string;
  owner: string;
  datasourceId: string;
  name: string;
  description: string;
  type: string;
  tags: string[];
  projects: string[];
  dateCreated: string;
  dateUpdated: string;
  archived: boolean;

  behavior: {
    goal: "increase" | "decrease";
    cap: number;
    conversionWindowStart: number;
    conversionWindowEnd: number;
    riskThresholdSuccess: number;
    riskThresholdDanger: number;
    minPercentChange: number;
    maxPercentChange: number;
    minSampleSize: number;
  };

  query: null | ApiMetricQuerySettings;
}

export type ApiMetricQuerySettings =
  | SqlCustomSettings
  | SqlQueryBuilderSettings
  | MixpanelQueryBuilderSettings;

export interface SqlCustomSettings {
  format: "sql-custom";
  identifierTypes: string[];
  conversionSQL: string;
  userAggregationSQL: string;
  denominatorMetricId: string;
}
export interface SqlQueryBuilderSettings {
  format: "sql-builder";
  identifierTypes: string[];
  identifierTypeColumns: Record<string, string>;
  tableName: string;
  valueColumnName: string;
  timestampColumnName: string;
  conditions: Array<{
    column: string;
    operator: string;
    value: string;
  }>;
}
export interface MixpanelQueryBuilderSettings {
  format: "mixpanel-builder";
  eventName: string;
  eventValue: string;
  userAggregation: string;
  conditions: Array<{
    property: string;
    operator: string;
    value: string;
  }>;
}

export interface ApiProjectInterface {
  id: string;
  name: string;
  dateCreated: string;
  dateUpdated: string;
}

export interface ApiSegmentInterface {
  id: string;
  owner: string;
  datasourceId: string;
  identifierType: string;
  name: string;
  query: string;
  dateCreated: string;
  dateUpdated: string;
}

export interface ApiDimensionInterface {
  id: string;
  owner: string;
  datasourceId: string;
  identifierType: string;
  name: string;
  query: string;
  dateCreated: string;
  dateUpdated: string;
}
