import cloudinary from "@/config/cloudinary";

export function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(fileUrl: string): Promise<void> {
  try {
    const parts = fileUrl.split("/upload/")[1]; 
    if (!parts) return;

    const withoutVersion = parts.replace(/^v\d+\//, ""); 
    const publicId = withoutVersion.replace(/\.[^/.]+$/, ""); 

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete failed:", err instanceof Error ? err.message : err);
  }
}