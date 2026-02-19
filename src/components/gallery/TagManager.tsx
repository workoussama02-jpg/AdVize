/**
 * Tag manager — add/remove tags on media items.
 * PRD Section 6.7.
 *
 * @component TagManager
 */
'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface TagManagerProps {
  tags: string[];
  onUpdate: (tags: string[]) => void;
}

export function TagManager({ tags, onUpdate }: TagManagerProps) {
  const [newTag, setNewTag] = useState('');

  const handleAdd = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onUpdate([...tags, trimmed]);
      setNewTag('');
    }
  };

  const handleRemove = (tag: string) => {
    onUpdate(tags.filter((t) => t !== tag));
  };

  return (
    <div className="input-group">
      <label className="input-label" htmlFor="tag-input">Tags</label>
      <div className="media-tags">
        {tags.map((tag) => (
          <span key={tag} className="badge badge-neutral">
            {tag}
            <button
              className="three-dot-btn"
              onClick={() => handleRemove(tag)}
              aria-label={`Remove tag ${tag}`}
              id={`remove-tag-${tag}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="quick-actions">
        <input
          type="text"
          className="input-field"
          placeholder="Add tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
          id="tag-input"
        />
        <button className="btn btn-secondary btn-sm" onClick={handleAdd} id="add-tag-btn" aria-label="Add tag">
          <Plus size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
