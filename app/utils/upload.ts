import api from '../services/api';
import axios from 'axios';

export const uploadFile = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> => {
  try {
    // 1. Get presigned upload URL from backend
    const res = await api.get('/admin/upload/presigned-url', {
      params: {
        filename: file.name,
        content_type: file.type || 'application/octet-stream'
      }
    });

    const { upload_url, file_url } = res.data;

    // 2. PUT file binary directly to S3
    await axios.put(upload_url, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });

    return file_url;
  } catch (err: any) {
    console.warn("S3 upload failed, falling back to local upload", err);

    // Fallback: standard multipart upload to backend
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/admin/upload", formData, {
      headers: { "Content-Type": undefined },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });

    return res.data.url;
  }
};
