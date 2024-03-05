import { environment } from "@/env/env";
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: environment.AWS_DEFAULT_REGION,
  endpoint: environment.AWS_BASE_URL,
  credentials: {
    accessKeyId: environment.AWS_ACCESS_KEY_ID,
    secretAccessKey: environment.AWS_SECRET_ACCESS_KEY,
  },
});
