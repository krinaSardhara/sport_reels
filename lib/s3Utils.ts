import { ReelType } from '@/app/types/reels';
import AWS from 'aws-sdk';

interface S3Config {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}



export class S3Utils {
  private s3: AWS.S3;
  private bucket: string;

  constructor(config: S3Config) {
    this.s3 = new AWS.S3({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    });
    this.bucket = config.bucket;
  }

  private generateAthletePath(athleteName: string): string {
    return athleteName.toLowerCase().replace(/\s+/g, '-');
  }

  async uploadFile(file: Buffer | any, key: string, contentType: string, metadata?: Record<string, string>): Promise<string> {
    try {
      if (!file) {
        throw new Error('File content is required');
      }
      if (!key) {
        throw new Error('S3 key is required');
      }
      if (!contentType) {
        throw new Error('Content type is required');
      }

      // Extract athlete name from metadata if available
      const athleteName = metadata?.athleteName;
      let athletePath = '';
      if (athleteName) {
        athletePath = this.generateAthletePath(athleteName);
        metadata = {
          ...metadata,
          athletePath
        };
      }

      const params = {
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: metadata,
        ACL: 'private'
      };

      console.log(`Attempting to upload file to S3: ${key}`);
      await this.s3.putObject(params).promise();
      console.log(`Successfully uploaded file to S3: ${key}`);
      
      return key;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to upload file to S3: ${error.message}`);
      }
      throw new Error('Failed to upload file to S3: Unknown error');
    }
  }

  async uploadVideo(file: Buffer, key: string, metadata?: Record<string, string>): Promise<string> {
    return this.uploadFile(file, key, 'video/mp4', metadata);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn
    });
  }

  async getVideoMetadata(key: string): Promise<Record<string, string>> {
    const response = await this.s3.headObject({
      Bucket: this.bucket,
      Key: key
    }).promise();

    return response.Metadata || {};
  }

  async listVideos(): Promise<{ key: string; signedUrl: string; metadata: Record<string, string> }[]> {
    const response = await this.s3.listObjectsV2({
      Bucket: this.bucket,
    }).promise();

    if (!response.Contents) {
      return [];
    }

    return Promise.all(
      response.Contents.map(async (item) => {
        const key = item.Key!;
        const signedUrl = await this.getSignedUrl(key);
        const metadata = await this.getVideoMetadata(key);
        
        return {
          key,
          signedUrl,
          metadata
        };
      })
    );
  }

  async getReels(): Promise<ReelType[]> {
    const videos = await this.listVideos();
console.log(videos
  .map((video) => ({
    videoUrl: video.signedUrl,
    metadata: video.metadata 
  }))
  .sort((a, b) => new Date(b.metadata.datecreated).getTime() - new Date(a.metadata.datecreated).getTime())
)
    return videos
      .map((video) => ({
        videoUrl: video.signedUrl,
        metadata: video.metadata
      }))
      .sort((a, b) => new Date(b.metadata.datecreated).getTime() - new Date(a.metadata.datecreated).getTime());
  }

}