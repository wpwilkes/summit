import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import express, { type Request, type Response } from 'express';
import { POSTS_PATHS } from '@summit/shared';
import { requireAuth } from '../auth/middleware/middleware.js';
import { AppError } from '../errors/app.error.js';
import { Router } from 'express';

const imagesRouter: Router = Router();
const uploadDirectory = path.join(process.cwd(), 'uploads', 'posts');
const maxBytes = 5 * 1024 * 1024;
const filePattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

function detectType(data: Buffer): { mime: string; ext: string } | undefined {
  if (
    data.length >= 3 &&
    data[0] === 0xff &&
    data[1] === 0xd8 &&
    data[2] === 0xff
  )
    return { mime: 'image/jpeg', ext: 'jpg' };
  if (
    data.length >= 8 &&
    data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return { mime: 'image/png', ext: 'png' };
  if (
    data.length >= 12 &&
    data.toString('ascii', 0, 4) === 'RIFF' &&
    data.toString('ascii', 8, 12) === 'WEBP'
  )
    return { mime: 'image/webp', ext: 'webp' };
  return undefined;
}

imagesRouter.post(
  POSTS_PATHS.uploadImage,
  requireAuth,
  express.raw({
    type: ['image/jpeg', 'image/png', 'image/webp'],
    limit: maxBytes,
  }),
  async (request: Request, response: Response): Promise<void> => {
    if (!Buffer.isBuffer(request.body) || request.body.length === 0)
      throw new AppError(
        415,
        'INVALID_IMAGE_TYPE',
        'Upload a JPEG, PNG, or WebP image.',
      );
    const detected = detectType(request.body);
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
