import {
  FunctionCallAction,
  Transaction,
  TransferAction,
} from '@near-wallet-selector/core';
import { CoreTool, JSONValue, CoreMessage } from 'ai';
import { FunctionDefinition } from 'openai/resources';
import { FunctionTool } from 'openai/resources/beta/assistants';

// --------------------------------- Agents --------------------------------- //
export type BitteAgentConfig = {
  id: string;
  name: string;
  accountId: string;
  description: string;
  instructions: string;
  verified: boolean;
  tools?: BitteToolSpec[];
  image?: string;
  repo?: string;
  category?: string;
};

export type BitteAgent = Omit<BitteAgentConfig, 'tools'> & {
  toolSpecs?: FunctionTool[];
  tools?: Record<string, CoreTool>;
};

// -------------------------------- Messages -------------------------------- //
export type SmartActionMessage = CoreMessage & {
  id?: string;
  agentId?: string;
};

// --------------------------------- Tools ---------------------------------- //
export type BitteMetadata = Record<string, unknown>;

export type BitteToolSpec = PluginToolSpec | FunctionTool;

export type PluginToolSpec = {
  id: string;
  agentId: string;
  type: 'function';
  function: FunctionDefinition;
  execution: ExecutionDefinition;
  verified: boolean;
};

export type ExecutionDefinition = {
  baseUrl: string;
  path: string;
  httpMethod: string;
};

export type BitteTool<TArgs = Record<string, JSONValue>, TResult = unknown> = {
  toolSpec: FunctionTool;
  execute: BitteToolExecutor<TArgs, TResult>;
  // render?: BitteToolRenderer; // TODO: remove if this stays unused
};

export type BitteToolExecutor<
  TArgs = Record<string, JSONValue>,
  TResult = unknown,
> = (
  args: TArgs,
  metadata?: BitteMetadata,
) => Promise<BitteToolResult<TResult>>;

export type BitteToolResult<TResult = unknown> =
  | { data: TResult; error?: never }
  | { data?: never; error: string };

export type BitteToolWarning = {
  message: string;
  final: boolean;
};

export type BitteToolBuilder<
  TBuilderArgs,
  TArgs = Record<string, JSONValue>,
  TResult = unknown,
> = (args: TBuilderArgs) => BitteTool<TArgs, TResult>;

// TODO: remove if this stays unused
// export type BitteToolRenderer<TArgs = unknown> = (
//   args: TArgs,
//   metadata?: BitteMetadata,
// ) => ReactNode | null;

// TODO: Remove this once we have a better way to handle this.
export type AnyBitteTool = BitteTool<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// ------------------------------- Primitives ------------------------------- //
export type AccountTransaction = Omit<Transaction, 'actions'> & {
  actions: Array<FunctionCallAction | TransferAction>;
};

// FT balances
export type UserToken = {
  chain: UserTokenChain;
  balances: UserTokenBalance;
  meta: UserTokenMeta;
};

export type UserTokenChain = {
  chainId?: number; // undefined is Near
  chainName: string;
  chainIcon?: string;
};

export type UserTokenBalance = {
  balance: number;
  usdBalance: number;
  price?: number;
};

export type UserTokenMeta = {
  name: string;
  symbol: string;
  decimals: number;
  tokenIcon?: string;
  contractAddress?: string;
  isSpam: boolean;
};

export type AllowlistedToken = {
  name: string;
  symbol: string;
  contractId: string;
  decimals: number;
  icon?: string;
};

// GQL queries
export type GqlFetchResult<T> = {
  data?: T;
  error?: string;
};

// Image generation
export type GenerateImageResponse = {
  url: string;
  hash: string;
};

// Charts
export type ChartType = 'line' | 'bar' | 'area' | 'candle';
export type DataFormat = 'number' | 'currency' | 'percentage';
export type TimeValue = string | number;
export type RawDataPoint = [TimeValue, number, ...number[]];
export type ChartDataPoint = {
  time: number;
  [key: string]: number;
};
export type OhlcDataPoint = {
  time: number;
  open: number;
  close: number;
  high: number;
  low: number;
};

export type MetricData = {
  metric: string;
  percentageChange: number;
  isPositive: boolean;
  isCandle: boolean;
};

export type ChartProps<T extends ChartType = ChartType> = {
  chartConfig: ChartConfig;
  timeKey: string;
  metricKeys: string[];
  chartData: T extends 'candle' ? OhlcDataPoint[] : ChartDataPoint[];
  dateFormatter: (timestamp: number, compact?: boolean) => string;
  valueFormatter: (value: unknown, compact?: boolean) => string;
};

export type ChartConfig = {
  [k in string]: {
    label?: string;
    icon?: string;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<'light' | 'dark', string> }
  );
};

export type ChartWrapperProps<T extends ChartType = ChartType> = Omit<
  ChartProps<T>,
  'dateFormatter' | 'valueFormatter' | 'metricKeys' | 'timeKey'
> & {
  title: string;
  description: string;
  metricLabels: string[];
  metricData: MetricData[];
  chartType: T;
  dataFormat?: DataFormat;
};

export type RenderChartArgs = Omit<
  ChartWrapperProps,
  'chartConfig' | 'chartData'
> & {
  metricLabels: string[];
  dataPoints: [TimeValue, ...number[]][];
};

// ---------------------------------- Misc ---------------------------------- //
export type NearNetworkId = 'mainnet' | 'testnet';
export const isNearNetworkId = (x: unknown): x is NearNetworkId =>
  typeof x === 'string' && ['mainnet', 'testnet'].includes(x);
