// import { CoreTool, jsonSchema } from 'ai';
import { getErrorMsg } from './utils';
// import { BITTE_PRIMITIVES, isBittePrimitiveName } from './primitives';
import {
  // AnyBitteTool,
  BitteMetadata,
  BitteToolExecutor,
  BitteToolSpec,
} from './types';

// export const createCoreTool = (
//   tool: BitteToolSpec,
//   metadata?: BitteMetadata,
// ): CoreTool => {
//   if ('execution' in tool) {
//     return {
//       parameters: jsonSchema(tool.function.parameters || {}),
//       description: tool.function.description,
//       execute: async (args) => createExecutor(tool, metadata)(args),
//     };
//   }
//   const toolName = tool.function.name;
//   if (isBittePrimitiveName(toolName)) {
//     return convertToCoreTool(BITTE_PRIMITIVES[toolName], metadata);
//   }

//   throw new Error(`Failed to create CoreTool for ${tool.function.name}`);
// };

export const createExecutor = (
  tool: BitteToolSpec,
  metadata?: BitteMetadata,
): BitteToolExecutor => {
  return async (args) => {
    try {
      if (!('execution' in tool)) {
        throw new Error(
          `No execution details found for plugin tool ${tool.function.name}`,
        );
      }

      const { baseUrl, path, httpMethod } = tool.execution;
      const fullBaseUrl = baseUrl.startsWith('http')
        ? baseUrl
        : `https://${baseUrl}`;

      // Build URL with path parameters
      let url = `${fullBaseUrl}${path}`;
      const remainingArgs = { ...args };

      url = url.replace(/\{(\w+)\}/g, (_, key) => {
        if (remainingArgs[key] === undefined) {
          throw new Error(`Missing required path parameter: ${key}`);
        }
        const value = remainingArgs[key];
        delete remainingArgs[key];
        return encodeURIComponent(String(value));
      });

      // Setup request
      const headers: HeadersInit = {
        ...(metadata && { 'mb-metadata': JSON.stringify(metadata) }),
      };

      const method = httpMethod.toUpperCase();
      const fetchOptions: RequestInit = { method, headers };

      // Handle query parameters
      const queryParams = new URLSearchParams();
      Object.entries(remainingArgs)
        .filter(([_, value]) => value != null)
        .forEach(([key, value]) => queryParams.append(key, String(value)));

      const queryString = queryParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }

      // Handle request body
      if (['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(method)) {
        headers['Content-Type'] = 'application/json';
        fetchOptions.body = JSON.stringify(remainingArgs);
      }

      // Execute request
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(
          `HTTP error during plugin tool execution: ${response.status} ${response.statusText}`,
        );
      }
      // Parse response based on content type
      const contentType = response.headers.get('Content-Type') || '';
      const data = await (contentType.includes('application/json')
        ? response.json()
        : contentType.includes('text')
          ? response.text()
          : response.blob());

      return { data };
    } catch (error) {
      return {
        error: `Error executing pluginTool ${tool.function.name}. ${getErrorMsg(
          error,
        )}`,
      };
    }
  };
};

// export const convertToCoreTool = (
//   tool: AnyBitteTool,
//   metadata?: BitteMetadata,
// ): CoreTool => {
//   return {
//     parameters: jsonSchema(tool.toolSpec.function.parameters || {}),
//     description: tool.toolSpec.function.description,
//     execute: async (args) => tool.execute(args, metadata),
//   };
// };
