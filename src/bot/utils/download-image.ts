import { basename } from 'node:path';

import { AttachmentBuilder } from 'discord.js';

const IMAGE_URL = /^https:\/\/\S+\.(?:png|jpe?g|gif|webp)(?:[?#]\S*)?$/i;

const DOWNLOAD_TIMEOUT = 10_000;

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export const isImageUrl = (text: string) => IMAGE_URL.test(text);

export const downloadImage = async (url: string) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT) });

  if (!response.ok) {
    throw new Error(`Image download failed with status ${response.status}: ${url}`);
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.startsWith('image/')) {
    throw new Error(`Link is not an image (${contentType || 'no content type'}): ${url}`);
  }

  if (Number(response.headers.get('content-length')) > MAX_IMAGE_SIZE) {
    throw new Error(`Image is larger than 10 MB: ${url}`);
  }

  const image = Buffer.from(await response.arrayBuffer());

  if (image.length > MAX_IMAGE_SIZE) {
    throw new Error(`Image is larger than 10 MB: ${url}`);
  }

  return new AttachmentBuilder(image, { name: basename(new URL(url).pathname) });
};
