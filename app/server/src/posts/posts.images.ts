import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import express, { type Request, type Response } from 'express';
import { POSTS_PATHS } from '@summit/shared';
import { requireAuth } from '../auth/middleware/middleware.js';
import { AppError } from '../errors/app.error.js';
import {
  detectImageType,
  IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
} from '../lib/image-type.js';
import { Router } from 'express';

const imagesRouter: Router = Router();
const uploadDirectory = path.join(process.cwd(), 'uploads', 'posts');
const filePattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

imagesRouter.post(
  POSTS_PATHS.uploadImage,
  requireAuth,
  express.raw({
    type: IMAGE_MIME_TYPES,
    limit: MAX_IMAGE_BYTES,
  }),
  async (request: Request, response: Response): Promise<void> => {
    if (!Buffer.isBuffer(request.body) || request.body.length === 0)
      throw new AppError(
        415,
        'INVALID_IMAGE_TYPE',
        'Upload a JPEG, PNG, or WebP image.',
      );
    const detected = detectImageType(request.body);
    if (
      !detected ||
      detected.mime !== request.get('content-type')?.split(';')[0].toLowerCase()
    )
      throw new AppError(
        415,
        'INVALID_IMAGE_TYPE',
        'The file must match its JPEG, PNG, or WebP type.',
      );
    const name = `${randomUUID()}.${detected.ext}`;
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, name), request.body, {
      flag: 'wx',
    });
    response.status(201).json({ photoUrl: `/api/posts/images/${name}` });
  },
);

imagesRouter.get(
  POSTS_PATHS.getImage,
  (request: Request<{ imageName: string }>, response: Response): void => {
    const name = request.params.imageName;
    if (!name || !filePattern.test(name)) {
      response.sendStatus(404);
      return;
    }
    const extension = name.substring(name.lastIndexOf('.') + 1);
    response.type(extension === 'jpg' ? 'jpeg' : extension);
    response.set('Cache-Control', 'public, max-age=86400');
    response.sendFile(path.join(uploadDirectory, name), (error) => {
      if (error && !response.headersSent) response.sendStatus(404);
    });
  },
);

export default imagesRouter;
