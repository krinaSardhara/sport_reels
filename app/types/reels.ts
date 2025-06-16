export interface ReelMetadata {
  athletename?: string;
  datecreated?: string;
  type?: string;
  format?: string;
  resolution?: string;
  source?: string;
}

export interface ReelType {
  videoUrl: string;
  metadata: ReelMetadata;
}
  