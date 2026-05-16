import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

type UploadedObject = {
  key: string;
  url: string;
};

@Injectable()
export class StorageService {
  private readonly bucket = process.env.S3_BUCKET ?? '';
  private readonly publicBaseUrl = process.env.S3_PUBLIC_BASE_URL ?? '';
  private readonly client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? 'us-east-1',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    credentials:
      process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          }
        : undefined,
  });

  async uploadQuoteImage(file: {
    buffer: Buffer;
    mimeType: string;
    originalName: string;
  }): Promise<UploadedObject> {
    this.ensureConfigured();

    const extension = this.getFileExtension(file.originalName);
    const key = `quotes/${Date.now()}-${crypto.randomUUID()}${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimeType,
      }),
    );

    return {
      key,
      url: this.buildPublicUrl(key),
    };
  }

  async deleteObjectByUrl(url: string | null | undefined): Promise<void> {
    if (!url) {
      return;
    }

    this.ensureConfigured();

    const key = this.extractObjectKey(url);

    if (!key) {
      return;
    }

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  private ensureConfigured() {
    if (
      !process.env.S3_ENDPOINT ||
      !this.bucket ||
      !process.env.S3_ACCESS_KEY_ID ||
      !process.env.S3_SECRET_ACCESS_KEY
    ) {
      throw new InternalServerErrorException('S3 storage is not configured.');
    }
  }

  private buildPublicUrl(key: string) {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }

    const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, '');

    if (!endpoint) {
      throw new InternalServerErrorException(
        'S3 public URL is not configured.',
      );
    }

    return `${endpoint}/${this.bucket}/${key}`;
  }

  private extractObjectKey(url: string) {
    const normalizedBase = this.publicBaseUrl.replace(/\/$/, '');

    if (normalizedBase && url.startsWith(`${normalizedBase}/`)) {
      return url.slice(normalizedBase.length + 1);
    }

    const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, '');

    if (endpoint) {
      const prefix = `${endpoint}/${this.bucket}/`;

      if (url.startsWith(prefix)) {
        return url.slice(prefix.length);
      }
    }

    return '';
  }

  private getFileExtension(filename: string) {
    const lastDotIndex = filename.lastIndexOf('.');

    if (lastDotIndex === -1) {
      return '';
    }

    return filename.slice(lastDotIndex).toLowerCase();
  }
}
