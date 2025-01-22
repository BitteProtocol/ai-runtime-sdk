export * from './generate-evm-transaction';
export * from './generate-image';
export * from './generate-transaction';

// import { AnyBitteTool, BitteToolSpec } from '../types';
// import { generateTransaction } from './generate-transaction';
// import { transferFt } from './transfer-ft';

export enum BittePrimitiveName {
  TRANSFER_FT = 'transfer-ft',
  GENERATE_TRANSACTION = 'generate-transaction',
  SUBMIT_QUERY = 'submit-query',
  GENERATE_IMAGE = 'generate-image',
  GET_SWAP_TRANSACTIONS = 'getSwapTransactions',
  GET_TOKEN_METADATA = 'getTokenMetadata',
  GENERATE_EVM_TX = 'generate-evm-tx',
  RENDER_CHART = 'render-chart',
}

export const isBittePrimitiveName = (
  value: unknown,
): value is BittePrimitiveName => {
  return Object.values(BittePrimitiveName).includes(
    value as BittePrimitiveName,
  );
};

// TODO: needs to be compatible with builder pattern -> primitives can't be
// built without params
// export const BITTE_PRIMITIVES = {
//   [BittePrimitiveName.TRANSFER_FT]: transferFt,
//   [BittePrimitiveName.GENERATE_TRANSACTION]: generateTransaction,
//   [BittePrimitiveName.GENERATE_EVM_TX]: generateEvmTx,
//   [BittePrimitiveName.SUBMIT_QUERY]: submitQuery,
//   [BittePrimitiveName.GENERATE_IMAGE]: generateImage,
//   [BittePrimitiveName.GET_SWAP_TRANSACTIONS]: getSwapTransactions,
//   [BittePrimitiveName.GET_TOKEN_METADATA]: getTokenMetadata,
//   [BittePrimitiveName.RENDER_CHART]: renderChart,
// } satisfies Record<BittePrimitiveName, AnyBitteTool>;

// export const BITTE_PRIMITIVE_SPECS = Object.fromEntries(
//   Object.entries(BITTE_PRIMITIVES).map(([key, value]) => [key, value.toolSpec]),
// ) as Record<BittePrimitiveName, BitteToolSpec>;
