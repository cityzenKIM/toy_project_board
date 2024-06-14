import { Module } from '@nestjs/common';
import { AwsS3Service } from './uploads-aws-s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [AwsS3Service],
  exports: [AwsS3Service],
})
export class UploadsModule {}
