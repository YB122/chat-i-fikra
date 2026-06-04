import { v2 as cloudinary } from "cloudinary";


export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    });
  }

  async uploadBuffer(buffer: Buffer, mimetype: string): Promise<any> {
    const fileStr = buffer.toString("base64");
    const dataUri = `data:${mimetype};base64,${fileStr}`;
    return await cloudinary.uploader.upload(dataUri, {
      resource_type: "auto",
      folder: "skychat",
    });
  }
}