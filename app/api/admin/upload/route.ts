import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import crypto from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const endpoint = process.env.R2_ENDPOINT;
const publicUrl = process.env.R2_PUBLIC_URL;

export async function POST(request: Request) {
  try {
    if (
      !accountId ||
      !accessKeyId ||
      !secretAccessKey ||
      !bucketName ||
      !endpoint ||
      !publicUrl
    ) {
      throw new Error("R2 ortam değişkenleri eksik.");
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Görsel dosyası seçilmedi." },
        { status: 400 }
      );
    }

    const extension = ALLOWED_TYPES[file.type];

    if (!extension) {
      return NextResponse.json(
        { error: "Desteklenmeyen görsel formatı." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Görsel boyutu en fazla 10 MB olabilir." },
        { status: 400 }
      );
    }

    const filename = `${crypto.randomUUID()}${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const baseUrl = publicUrl!.replace(/\/$/, "");

    return NextResponse.json({
      success: true,
      url: `${baseUrl}/${filename}`,
    });
  } catch (error) {
    console.error("R2 görsel yükleme hatası:", error);

    return NextResponse.json(
      { error: "Görsel yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}