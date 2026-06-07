import React, { useRef, useEffect } from 'react';
import { Button, Space, Tooltip } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  FontColorsOutlined,
  BgColorsOutlined,
  UndoOutlined,
  RedoOutlined,
} from '@ant-design/icons';

interface TinyEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const TinyEditor: React.FC<TinyEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Nhập nội dung...',
  minHeight = 120,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Synchronize internal div content with value prop
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, argument: string = '') => {
    document.execCommand(command, false, argument);
    handleInput();
  };

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
      {/* Editor Toolbar */}
      <div style={{ background: '#f5f5f5', borderBottom: '1px solid #d9d9d9', padding: '6px 12px' }}>
        <Space size={4}>
          <Tooltip title="Chữ đậm">
            <Button
              type="text"
              size="small"
              icon={<BoldOutlined />}
              onClick={() => executeCommand('bold')}
            />
          </Tooltip>
          <Tooltip title="Chữ nghiêng">
            <Button
              type="text"
              size="small"
              icon={<ItalicOutlined />}
              onClick={() => executeCommand('italic')}
            />
          </Tooltip>
          <Tooltip title="Gạch chân">
            <Button
              type="text"
              size="small"
              icon={<UnderlineOutlined />}
              onClick={() => executeCommand('underline')}
            />
          </Tooltip>
          <span style={{ borderLeft: '1px solid #d9d9d9', height: 16, margin: '0 4px' }} />
          <Tooltip title="Màu chữ đỏ">
            <Button
              type="text"
              size="small"
              icon={<FontColorsOutlined style={{ color: '#ff4d4f' }} />}
              onClick={() => executeCommand('foreColor', '#ff4d4f')}
            />
          </Tooltip>
          <Tooltip title="Màu chữ xanh">
            <Button
              type="text"
              size="small"
              icon={<FontColorsOutlined style={{ color: '#52c41a' }} />}
              onClick={() => executeCommand('foreColor', '#52c41a')}
            />
          </Tooltip>
          <Tooltip title="Tô màu nền vàng">
            <Button
              type="text"
              size="small"
              icon={<BgColorsOutlined style={{ color: '#faad14' }} />}
              onClick={() => executeCommand('backColor', '#fffbe6')}
            />
          </Tooltip>
          <span style={{ borderLeft: '1px solid #d9d9d9', height: 16, margin: '0 4px' }} />
          <Tooltip title="Hoàn tác">
            <Button
              type="text"
              size="small"
              icon={<UndoOutlined />}
              onClick={() => executeCommand('undo')}
            />
          </Tooltip>
          <Tooltip title="Làm lại">
            <Button
              type="text"
              size="small"
              icon={<RedoOutlined />}
              onClick={() => executeCommand('redo')}
            />
          </Tooltip>
        </Space>
      </div>

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{
          minHeight: minHeight,
          padding: '12px',
          outline: 'none',
          fontSize: '15px',
          lineHeight: '1.6',
          fontFamily: 'inherit',
          color: '#333',
        }}
        placeholder={placeholder}
      />
      
      {/* CSS styling for placeholder when empty */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(placeholder);
          color: #bfbfbf;
          cursor: text;
        }
      `}</style>
    </div>
  );
};

export default TinyEditor;
