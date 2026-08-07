/*----------------------------------------初期設定----------------------------------------*/
import fs from "fs";
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
/*----------------------------------------関数----------------------------------------*/
const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
    },
});

export async function uploadFileToR2(filePath, objectKey, contentType) {
    await r2.send(
        new PutObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: objectKey,
            Body: fs.createReadStream(filePath),
            ContentType: contentType,
        }),
    );
}

export async function createSignedUrl(objectKey) {
    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: objectKey,
    });

    const url = await getSignedUrl(r2, command, {
        expiresIn: 3600,
    });
    return url;
}
