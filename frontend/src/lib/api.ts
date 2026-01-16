import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UploadFileResponse {
  short_code: string;
  visit_code: string;
  short_link: string;
  expires_at: string;
}

export interface UploadMessageResponse {
  short_code: string;
  visit_code: string;
  short_link: string;
  expires_at: string;
}

export interface TransferInfo {
  type: 'file' | 'message';
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  download_url?: string;
  content?: string;
  expires_at: string;
}

export interface InitUploadResponse {
  short_code: string;
  visit_code: string;
  upload_id: string;
  chunk_count: number;
  chunk_size: number;
}

export interface ChunkUploadResponse {
  message: string;
  chunk_index: number;
  etag: string;
}

export interface CompleteUploadResponse extends UploadFileResponse {
  message: string;
}

// 初始化文件上传
export const initFileUpload = async (
  fileName: string,
  fileSize: number,
  mimeType: string,
  expiration: string = '10m'
): Promise<InitUploadResponse> => {
  const formData = new FormData();
  formData.append('file_name', fileName);
  formData.append('file_size', fileSize.toString());
  formData.append('mime_type', mimeType);
  formData.append('expiration', expiration);
  
  const response = await api.post<InitUploadResponse>('/api/upload/file/init', formData);
  return response.data;
};

// 上传文件分片
export const uploadFileChunk = async (
  shortCode: string,
  chunkIndex: number,
  chunk: Blob
): Promise<ChunkUploadResponse> => {
  const formData = new FormData();
  formData.append('short_code', shortCode);
  formData.append('chunk_index', chunkIndex.toString());
  formData.append('file', chunk);
  
  const response = await api.post<ChunkUploadResponse>('/api/upload/file/chunk', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// 完成文件上传
export const completeFileUpload = async (shortCode: string): Promise<CompleteUploadResponse> => {
  const formData = new FormData();
  formData.append('short_code', shortCode);
  
  const response = await api.post<CompleteUploadResponse>('/api/upload/file/complete', formData);
  return response.data;
};

// 保留旧接口以兼容（已废弃，但保留以防需要）
export const uploadFile = async (file: File, expiration: string = '10m'): Promise<UploadFileResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('expiration', expiration);
  
  const response = await api.post<UploadFileResponse>('/api/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const uploadMessage = async (content: string, expiration: string = '10m'): Promise<UploadMessageResponse> => {
  const formData = new FormData();
  formData.append('content', content);
  formData.append('expiration', expiration);
  
  const response = await api.post<UploadMessageResponse>('/api/upload/message', formData);
  
  return response.data;
};

export const getTransfer = async (shortCode: string, visitCode: string): Promise<TransferInfo> => {
  const response = await api.get<TransferInfo>(`/api/transfer/${shortCode}`, {
    params: { visit_code: visitCode },
  });
  
  return response.data;
};
