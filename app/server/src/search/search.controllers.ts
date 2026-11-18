import { AppError } from '../errors/app.error.js';
import { ErrorCode } from '../errors/error-code.js';
import { HttpStatus } from '../errors/http-status.js';
import { detectImageType } from '../lib/image-type.js';
import { searchByImageService, searchPostsService } from './search.services.js';
import {
  SEARCH_CONTRACTS,
  type SearchByImageResponse,
  type SearchPostsRequest,
  type SearchPostsResponse,
} from '@summit/shared';
import type { NextFunction, Request, Response } from 'express';

export async function searchPostsController(
  request: Request<Record<string, never>, unknown, SearchPostsRequest>,
  response: Response<SearchPostsResponse>,
): Promise<void> {
  // The keyword must be present, not blank, and at most 100 characters.
  const parsed = SEARCH_CONTRACTS.posts.query.safeParse(request.query);
  if (!parsed.success) {
    throw new AppError(
      400,
      'INVALID_REQUEST',
      'Enter a search keyword (1 to 100 characters).',
    );
  }
  const result = await searchPostsService(parsed.data.q);
  const body = SEARCH_CONTRACTS.posts.responseBody.parse(result);
  response.status(200).json(body);
}

export async function searchByImageController(
  request: Request,
  response: Response<SearchByImageResponse>,
): Promise<void> {
  // express.raw() only fills the body for the image types we accept.
  const image: unknown = request.body;
  if (!Buffer.isBuffer(image) || image.length === 0) {
    throw new AppError(
      HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ErrorCode.INVALID_IMAGE_TYPE,
      'Upload a JPEG, PNG, or WebP image.',
    );
  }
  // The file itself must really be the type it claims to be.
  const detected = detectImageType(image);
  const claimed = request.get('content-type')?.split(';')[0].toLowerCase();
  if (!detected || detected.mime !== claimed) {
    throw new AppError(
      HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ErrorCode.INVALID_IMAGE_TYPE,
      'The file must match its JPEG, PNG, or WebP type.',
    );
  }
  const result = await searchByImageService(image, detected.mime);
  const body = SEARCH_CONTRACTS.image.responseBody.parse(result);
  response.status(HttpStatus.OK).json(body);
}

// express.raw() rejects files over the size limit before the controller runs.
// Turn that into a clear message instead of a general server error.
export function imageTooLargeHandler(
  error: unknown,
  _request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const isTooLarge =
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === 'entity.too.large';
  next(
    isTooLarge
      ? new AppError(
          HttpStatus.PAYLOAD_TOO_LARGE,
          ErrorCode.IMAGE_TOO_LARGE,
          'The image must be 5 MB or smaller.',
        )
      : error,
  );
}
