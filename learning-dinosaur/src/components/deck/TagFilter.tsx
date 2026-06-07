import React from 'react';
import { Space, Tag } from 'antd';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onChange: (tag: string | null) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags = [], selectedTag, onChange }) => {
  const safeTags = Array.isArray(tags) ? tags : [];

  if (safeTags.length === 0) {
    return null;
  }

  return (
    <Space wrap style={{ marginBottom: 12 }}>
      <Tag
        color={!selectedTag ? 'green' : 'default'}
        onClick={() => onChange(null)}
        style={{ cursor: 'pointer' }}
      >
        Tất cả
      </Tag>

      {safeTags.map((tag) => (
        <Tag
          key={tag}
          color={selectedTag === tag ? 'green' : 'default'}
          onClick={() => onChange(tag)}
          style={{ cursor: 'pointer' }}
        >
          {tag}
        </Tag>
      ))}
    </Space>
  );
};

export default TagFilter;
