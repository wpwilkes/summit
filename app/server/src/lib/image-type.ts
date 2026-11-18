// The image types Summit accepts, for post photos and for search by image.
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Uploaded images may be at most this big.
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type DetectedImageType = { mime: string; ext: string };

// Look at the first bytes of the file to find out what it really is. We do not
// trust the file name or the Content-Type header on their own.
export function detectImageType(data: Buffer): DetectedImageType | undefined {
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
