import { S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export async function uploadToS3(file: File) {
  try {
    const s3 = new S3({
      region: "eu-west-2",
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
    });

    const file_key =
      "uploads/" + Date.now().toString() + file.name.replace(" ", "-");

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
      Body: file,
    };

    // Using the Upload class from lib-storage for progress tracking
    const upload = new Upload({
      client: s3,
      params: params,
    });

    // Add progress tracking
    upload.on("httpUploadProgress", (evt) => {
      console.log(
        "Uploading to s3..." +
          parseInt(((evt.loaded! * 100) / evt.total!).toString()) +
          "%"
      );
    });

    // Wait for the upload to complete
    await upload.done();
    console.log("Successfully uploaded to S3!", file_key);

    return {
      file_key,
      file_name: file.name,
    };
  } catch (error) {
    console.log("UPLOAD ERROR:", error);
    throw error; // Re-throw to allow caller to handle
  }
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.eu-west-2.amazonaws.com/${file_key}`;
  return url;
}
