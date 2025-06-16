export interface GenerateResponse {
  data: {
    description: string;
    imageUrls: string[];
    audioBufferData: string;
  };
}

export interface GenerateRequest {
  athleteName: string;
} 