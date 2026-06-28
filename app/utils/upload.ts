import api from '../services/api';
import axios from 'axios';

type UploadOptions = {
  optimizeVideo?: boolean;
};

export const uploadFile = async (
  file: File,
  onProgress?: (percent: number) => void,
  options: UploadOptions = {}
): Promise<string> => {
  try {
    const shouldOptimizeVideo = options.optimizeVideo ?? file.type.startsWith("video/");

    // 1. Get presigned upload URL from backend
    const res = await api.get('/admin/upload/presigned-url', {
      params: {
        filename: file.name,
        content_type: file.type || 'application/octet-stream'
      }
    });

    const { upload_url, file_url, source_file_url, optimization_required } = res.data;

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

    if (shouldOptimizeVideo && optimization_required && source_file_url) {
      const optimizeRes = await api.post("/admin/upload/optimize", {
        source_file_url,
        final_file_url: file_url,
      });

      if (optimizeRes.data?.status === "skipped" && optimizeRes.data?.file_url) {
        return optimizeRes.data.file_url;
      }
    }

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
