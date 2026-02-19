/**
 * Media gallery page — upload, view, tag, and manage creative assets.
 * PRD Section 6.7.
 */
'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { UploadZone } from '@/components/gallery/UploadZone';
import { MediaGrid } from '@/components/gallery/MediaGrid';
import { EmptyState } from '@/components/shared/EmptyState';

/** Media item interface matching DB schema */
interface MediaItem {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  tags: string[];
  uploaded_at: string;
}

export default function GalleryPage() {
  const [isUploading, setIsUploading] = useState(false);

  /* Placeholder — fetched from InsForge storage in production */
  const items: MediaItem[] = [];

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    /* Upload to InsForge storage, then save metadata to DB */
    setIsUploading(false);
  };

  const handleDelete = async (id: string) => {
    /* Delete from InsForge storage and DB */
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Media Gallery</h1>
          <p className="page-subtitle">
            Upload images and videos for AI creative recommendations
          </p>
        </div>
      </div>

      <UploadZone onUpload={handleUpload} isUploading={isUploading} />

      <div className="divider" />

      {items.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Upload images and videos for your ads"
          description="Add your creative assets so AdVize can recommend the best visuals for each campaign."
        />
      ) : (
        <MediaGrid items={items} onDelete={handleDelete} />
      )}
    </div>
  );
}
