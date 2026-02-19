/**
 * Media grid — thumbnail grid of uploaded media files.
 * PRD Section 6.7.
 *
 * @component MediaGrid
 */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trash2, Tag, Play } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

/** Media item data from DB */
interface MediaItem {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  tags: string[];
  uploaded_at: string;
}

interface MediaGridProps {
  items: MediaItem[];
  onDelete?: (id: string) => void;
  onTagUpdate?: (id: string, tags: string[]) => void;
}

export function MediaGrid({ items, onDelete, onTagUpdate }: MediaGridProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isVideo = (type: string) => type.startsWith('video/');

  const handleDelete = (id: string) => {
    onDelete?.(id);
    setDeleteConfirm(null);
    setSelectedItem(null);
  };

  return (
    <>
      <div className="media-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className="media-item"
            onClick={() => setSelectedItem(item)}
            role="button"
            tabIndex={0}
            aria-label={`View ${item.file_name}`}
            id={`media-${item.id}`}
            onKeyDown={(e) => { if (e.key === 'Enter') setSelectedItem(item); }}
          >
            {isVideo(item.file_type) ? (
              <div className="centered-page">
                <Play size={48} className="upload-zone-icon" aria-hidden="true" />
              </div>
            ) : (
              <Image
                src={item.file_url}
                alt={item.file_name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
            <div className="media-item-overlay">
              <span className="media-item-name">{item.file_name}</span>
              {item.tags.length > 0 && (
                <div className="media-tags">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="neutral">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview modal */}
      <Modal
        open={selectedItem !== null}
        title={selectedItem?.file_name ?? ''}
        onClose={() => setSelectedItem(null)}
        footer={
          selectedItem && onDelete ? (
            deleteConfirm === selectedItem.id ? (
              <>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(selectedItem.id)}
                  id={`confirm-delete-${selectedItem.id}`}
                >
                  Confirm Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirm(null)}
                  id={`cancel-delete-${selectedItem.id}`}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteConfirm(selectedItem.id)}
                id={`delete-${selectedItem.id}`}
              >
                <Trash2 size={14} aria-hidden="true" />
                Delete
              </Button>
            )
          ) : undefined
        }
      >
        {selectedItem && (
          <>
            {isVideo(selectedItem.file_type) ? (
              <video controls className="media-preview-video" aria-label={selectedItem.file_name}>
                <source src={selectedItem.file_url} type={selectedItem.file_type} />
              </video>
            ) : (
              <Image
                src={selectedItem.file_url}
                alt={selectedItem.file_name}
                width={480}
                height={480}
              />
            )}
            {selectedItem.tags.length > 0 && (
              <div className="media-tags">
                {selectedItem.tags.map((tag) => (
                  <Badge key={tag} variant="neutral">{tag}</Badge>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
