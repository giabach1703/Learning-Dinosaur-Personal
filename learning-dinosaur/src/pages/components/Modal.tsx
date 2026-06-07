import React, { useEffect, useState } from 'react';
import { Modal, Form, message } from 'antd';
import DeckForm from './Form';
import { createDeck, updateDeck, getAllTags } from '../../services';
import { Deck } from '../../services/typing';

interface DeckFormModalProps {
  open: boolean;
  editingDeck: Deck | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DeckFormModal: React.FC<DeckFormModalProps> = ({
  open,
  editingDeck,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [tagOptions, setTagOptions] = useState<{ label: string; value: string }[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    async function loadTags() {
      try {
        const tags = await getAllTags();
        setTagOptions(
          Array.isArray(tags)
            ? tags.map((tag) => ({
                label: tag,
                value: tag,
              }))
            : []
        );
      } catch {
        setTagOptions([]);
      }
    }

    if (open) {
      loadTags();
    }
  }, [open]);

  useEffect(() => {
    if (editingDeck && open) {
      form.setFieldsValue({
        name: editingDeck.name,
        description: editingDeck.description,
        tags: editingDeck.tags || [],
      });
    } else {
      form.resetFields();
    }
  }, [editingDeck, open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingDeck) {
        await updateDeck(editingDeck.id, values);
        message.success('Đã cập nhật bộ thẻ thành công!');
      } else {
        await createDeck(values);
        message.success('Đã tạo bộ thẻ mới thành công!');
      }

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(error.response?.data?.message || 'Không lưu được bộ thẻ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      forceRender
      title={editingDeck ? 'Sửa bộ thẻ' : 'Tạo bộ thẻ mới'}
      open={open}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText={editingDeck ? 'Cập nhật' : 'Tạo mới'}
      cancelText="Hủy"
      confirmLoading={submitting}
    >
      <DeckForm form={form} tagOptions={tagOptions} />
    </Modal>
  );
};

export default DeckFormModal;
