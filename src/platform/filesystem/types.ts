export type WriteResult = { uri: string; sizeBytes: number };

export interface FilesystemService {
  /** Pick a file via Storage Access Framework. Returns content as base64. */
  pickFile(): Promise<{ uri: string; name: string; base64: string } | null>;
  /** Save bytes to user-chosen location via SAF. Returns final URI. */
  saveFile(opts: {
    suggestedName: string;
    base64: string;
    mimeType?: string;
  }): Promise<WriteResult | null>;
  /** Share a file. */
  share(uri: string, mimeType?: string): Promise<void>;
}
