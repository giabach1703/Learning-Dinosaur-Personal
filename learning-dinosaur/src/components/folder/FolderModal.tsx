import React, { useState, useEffect } from 'react';
import { Modal, Input, Checkbox, Space, message, Typography } from 'antd';
import { useModel } from 'umi';
import { FolderOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface FolderModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export interface FolderData {
  id: string;
  name: string;
  deckIds: string[];
}

const FolderModal: React.FC<FolderModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [folderName, setFolderName] = useState<string>('');
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
  const { decks, loadDecks } = useModel('useDeckModel');

  useEffect(() => {
    if (visible) {
      setFolderName('');
      setSelectedDecks([]);
      loadDecks();
    }
  }, [visible, loadDecks]);

  const handleSave = () => {
    if (!folderName.trim()) {
      message.error('Vui lòng nhập tên thư mục');
      return;
    }

    try {
      const stored = localStorage.getItem('dino_folders');
      const folders: FolderData[] = stored ? JSON.parse(stored) : [];

      // Check duplicate name
      if (folders.some(f => f.name.toLowerCase() === folderName.trim().toLowerCase())) {
        message.error('Tên thư mục đã tồn tại');
        return;
      }

      const newFolder: FolderData = {
        id: 'folder_' + Date.now(),
        name: folderName.trim(),
        deckIds: selectedDecks,
      };

      folders.push(newFolder);
      localStorage.setItem('dino_folders', JSON.stringify(folders));
      message.success('Tạo thư mục thành công');
      onSuccess();
      onCancel();
    } catch (e) {
      message.error('Có lỗi xảy ra khi tạo thư mục');
    }
  };

  return (
    <Modal
      title={
        <Space>
          <FolderOutlined style={{ color: '#2f855a' }} />
          <span>Tạo thư mục mới</span>
        </Space>
      }
      visible={visible}
      onOk={handleSave}
      onCancel={onCancel}
      okText="Tạo thư mục"
      cancelText="Hủy"
      okButtonProps={{ style: { background: '#2f855a', borderColor: '#2f855a' } }}
      bodyStyle={{ padding: '20px' }}
    >
      <div style={{ marginBottom: '16px' }}>
        <Text strong style={{ display: 'block', marginBottom: '8px' }}>Tên thư mục</Text>
        <Input
          placeholder="Nhập tên thư mục (ví dụ: Tiếng Anh giao tiếp...)"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          maxLength={30}
          size="large"
          style={{ borderRadius: '8px' }}
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: '8px' }}>Chọn bộ thẻ đưa vào thư mục (Tùy chọn)</Text>
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '12px' }}>
          {decks.length === 0 ? (
            <Text type="secondary">Bạn chưa có bộ thẻ nào. Hãy tạo bộ thẻ trước.</Text>
          ) : (
            <Checkbox.Group
              value={selectedDecks}
              onChange={(checkedValues) => setSelectedDecks(checkedValues as string[])}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {decks.map(deck => (
                <Checkbox key={deck.id} value={deck.id}>
                  {deck.name} <Text type="secondary" style={{ fontSize: '12px' }}>({deck.totalCards} thẻ)</Text>
                </Checkbox>
              ))}
            </Checkbox.Group>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FolderModal;
