/**
 * Upload zone — drag-and-drop file upload area.
 * PRD Section 6.7.
 *
 * @component UploadZone
 */
'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';

/** Allowed file types for upload */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  isUploading?: boolean;
}

export function UploadZone({ onUpload, isUploading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList | File[]): File[] => {
    const valid: File[] = [];
    const fileList = Array.from(files);

    for (const file of fileList) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError(`"${file.name}" is not a supported format. Use JPEG, PNG, WebP, GIF, or MP4.`);
        return [];
      }
      if (file.size > MAX_SIZE_BYTES) {
        setUploadError(`"${file.name}" exceeds the 10MB limit.`);
        return [];
      }
      valid.push(file);
    }

    setUploadError(null);
    return valid;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = validateFiles(e.dataTransfer.files);
    if (files.length > 0) onUpload(files);
  }, [onUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = validateFiles(e.target.files);
    if (files.length > 0) onUpload(files);
  };

  return (
    <div>
      <div
        className={`upload-zone ${isDragging ? 'upload-zone-active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        id="upload-zone"
        aria-label="Upload files"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        <Upload size={32} className="upload-zone-icon" aria-hidden="true" />
        <span className="upload-zone-title">
          {isUploading ? 'Uploading...' : 'Drop files here or click to upload'}
        </span>
        <span className="upload-zone-hint">
          JPEG, PNG, WebP, GIF, or MP4 — Max 10MB
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          multiple
          onChange={handleFileSelect}
          className="sr-only"
          id="upload-file-input"
        />
      </div>
      {uploadError && (
        <p className="auth-error" role="alert">{uploadError}</p>
      )}
    </div>
  );
}
