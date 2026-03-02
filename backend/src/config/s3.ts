import AWS from 'aws-sdk';

export const s3Config = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  signatureVersion: 'v4',
});

export const S3_BUCKET = process.env.AWS_S3_BUCKET || 'olx-images';

export const getSignedUploadUrl = async (key: string, contentType: string): Promise<string> => {
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Expires: 60 * 5,
    ContentType: contentType,
  };
  
  return s3Config.getSignedUrlPromise('putObject', params);
};

export const getSignedDownloadUrl = async (key: string): Promise<string> => {
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Expires: 60 * 60,
  };
  
  return s3Config.getSignedUrlPromise('getObject', params);
};

export const deleteObject = async (key: string): Promise<void> => {
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
  };
  
  await s3Config.deleteObject(params).promise();
};

export const generateKey = (userId: string, filename: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const ext = filename.split('.').pop();
  return `listings/${userId}/${timestamp}-${random}.${ext}`;
};
