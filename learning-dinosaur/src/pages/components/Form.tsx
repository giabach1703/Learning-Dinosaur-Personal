import React from 'react';
import { Form, FormInstance, Input, Select } from 'antd';

interface DeckFormProps {
  form: FormInstance;
  tagOptions: { label: string; value: string }[];
}

const DeckForm: React.FC<DeckFormProps> = ({ form, tagOptions }) => {
  return (
    <Form layout="vertical" form={form}>
      <Form.Item
        label="Tên bộ thẻ"
        name="name"
        rules={[{ required: true, message: 'Vui lòng nhập tên bộ thẻ' }]}
      >
        <Input placeholder="Ví dụ: Từ vựng Khủng Long" />
      </Form.Item>

      <Form.Item label="Mô tả ngắn" name="description">
        <Input.TextArea
          rows={3}
          placeholder="Ví dụ: Tập hợp các thuật ngữ và khái niệm về cổ sinh vật học"
          maxLength={200}
          showCount
        />
      </Form.Item>

      <Form.Item label="Tag phân loại" name="tags">
        <Select
          mode="tags"
          placeholder="Ví dụ: dino, science"
          options={tagOptions}
          style={{ width: '100%' }}
        />
      </Form.Item>
    </Form>
  );
};

export default DeckForm;
