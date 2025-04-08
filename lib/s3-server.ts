/* eslint-disable @typescript-eslint/no-explicit-any */

import { S3 } from "@aws-sdk/client-s3";
import fs from "fs";

export async function downloadFromS3(file_key: string) {
  try {
    const s3 = new S3({
      region: "eu-west-2",
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
    });

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
    };

    // Get the object
    const obj = await s3.getObject(params);

    // Convert the streaming body to a buffer
    const streamToBuffer = async (stream: any): Promise<Buffer> => {
      // If it's already a buffer
      if (Buffer.isBuffer(stream)) {
        return stream;
      }

      // Handle Node.js streams
      if (stream && typeof stream.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks: any[] = [];
          stream.on("data", (chunk: any) => chunks.push(chunk));
          stream.on("error", reject);
          stream.on("end", () => resolve(Buffer.concat(chunks)));
        });
      }

      // Handle Web API streams
      if (stream && typeof stream.getReader === "function") {
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        return Buffer.concat(chunks);
      }

      throw new Error("Unknown stream type");
    };

    // Create a file name matching your original pattern
    const file_name = `/tmp/pdf-${Date.now()}.pdf`;

    // Get buffer from the body
    const bodyContent = await streamToBuffer(obj.Body);

    // Write the file
    fs.writeFileSync(file_name, bodyContent);

    return file_name;
  } catch (error) {
    console.log(error);
    return null;
  }
}
