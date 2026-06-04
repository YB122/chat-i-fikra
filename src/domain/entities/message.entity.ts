export interface FileAttachment {
  url: string;
  publicId: string;
  type: "image" | "file" | "audio" | "video";
  name: string;
}

export interface Message {
  id?: string;
  content: string;
  room: string;
  userId: string;
  file?: FileAttachment;
  createdAt?: Date;
}