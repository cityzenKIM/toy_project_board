import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AwsS3Service {
  private awsS3: S3Client;
  public readonly S3_BUCKET_NAME: string;
  constructor() {
    this.awsS3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
  }
  async uploadFileToS3(
    folder: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      const key = `${folder}/${uuidv4()}-${file.originalname}`;
      const command = new PutObjectCommand({
        Bucket: this.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });
      await this.awsS3.send(command);
      return `https://${this.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      throw new BadRequestException(`파일 업로드 실패 : ${error}`);
    }
  }
}
