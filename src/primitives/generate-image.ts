import { OpenAI } from 'openai';
import { getErrorMsg } from '../utils';
import {
  BitteToolBuilder,
  BitteToolResult,
  GenerateImageResponse,
} from '../types';

const ARWEAVE_URL = 'https://arweave.net';
const ARWEAVE_UPLOADER_URL = 'https://ar.mintbase.xyz';

export const generateImage: BitteToolBuilder<
  { openaiApiKey: string },
  { prompt: string },
  GenerateImageResponse
> = (args: { openaiApiKey: string }) => ({
  toolSpec: {
    function: {
      name: 'generate-image',
      description:
        'Generates an image, uploads it to Arweave, and displays it for the user.',
      parameters: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: {
            type: 'string',
            description: 'Prompt for the image generation',
          },
        },
      },
    },
    type: 'function',
  },
  execute: async ({
    prompt,
  }): Promise<BitteToolResult<GenerateImageResponse>> => {
    try {
      return {
        data: await generateImageOpenAi(args.openaiApiKey, prompt),
      };
    } catch (error) {
      return {
        error: getErrorMsg(error),
      };
    }
  },
});

export const generateImageOpenAi = async (
  openaiApiKey: string,
  prompt: string,
): Promise<GenerateImageResponse> => {
  const openai = new OpenAI({ apiKey: openaiApiKey });
  const imageGenerationResult = await openai.images.generate({
    prompt: prompt,
    model: 'dall-e-3',
    n: 1,
    size: '1024x1024',
    response_format: 'b64_json',
    quality: 'standard',
    style: 'vivid',
  });

  const imageData = imageGenerationResult.data[0];
  if (!imageData || !imageData.b64_json) {
    throw new Error('No image data returned in imageGenerationResult');
  }

  const fileBuffer = Buffer.from(imageData.b64_json, 'base64');

  const formData = new FormData();

  formData.append(
    'file',
    new Blob([fileBuffer], { type: 'image/jpeg' }),
    'image.jpeg',
  );

  const response = await fetch(ARWEAVE_UPLOADER_URL, {
    method: 'POST',
    body: formData,
    headers: {
      'mb-api-key': 'omni-site',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error uploading via arweave service: ${await response.text()}`,
    );
  }

  const arweaveResponse = await response.json();
  const arweaveHash = arweaveResponse.id;

  if (!arweaveResponse || typeof arweaveHash !== 'string') {
    throw new Error('Invalid response from arweave service');
  }

  const url = `${ARWEAVE_URL}/${arweaveHash}`;

  return {
    url,
    hash: arweaveHash,
  };
};
