import { slugify } from '@/utils/auth/slugify';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { v4 } from 'uuid';

export interface TextareaAutosizeProps {
  id?: string;
  label: string;
  modelValue?: string | number;
  autosize?: boolean;
  minHeight?: number;
  maxHeight?: number;
  number?: number;
  error?: string | boolean;
  onUpdate?: (value: string | number | undefined) => void;
  placeholder?: string;
  className?: string;
}

const Textarea = styled.textarea<{ error: boolean }>`
  width: 100%;
  resize: none;
  overflow: auto;

  background-color: var(--bg-color);
  border: ${(props) => (props.error ? '2px solid red;' : '')};
  color: var(--text-color);
  &:focus {
    box-shadow: ${(props) => (props.error ? '0 0 0 2px red' : '0 0 0 2px var(--primary-color)')};
  }
`;

export default function TextareaAutosize({
  id = '',
  modelValue = '',
  minHeight = 100,
  maxHeight = 300,
  number,
  error,
  onUpdate,
  placeholder,
  className,
  label,
}: TextareaAutosizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [maxHeightScroll, setMaxHeightScroll] = useState(false);

  const resize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset the height to auto before calculating the new height
      let contentHeight = textareaRef.current.scrollHeight;
      if (minHeight) {
        contentHeight = contentHeight < minHeight ? minHeight : contentHeight;
      }
      if (maxHeight) {
        if (contentHeight > maxHeight) {
          contentHeight = maxHeight;
          setMaxHeightScroll(true);
        } else {
          setMaxHeightScroll(false);
        }
      }
      textareaRef.current.style.height = contentHeight + 'px';
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    resize();
    const contents = e.target.value;
    if (number) {
      onUpdate && onUpdate && onUpdate(!contents ? undefined : parseFloat(contents));
    } else {
      onUpdate && onUpdate(contents);
    }
  };

  useEffect(() => {
    resize();
  }, [minHeight, maxHeight, id]);

  useEffect(() => {
    resize();
  }, []);

  useEffect(() => {
    resize();
  }, [modelValue]);

  const uuid = v4();

  const slugLable = slugify(label);

  return (
    <div className={'w-full mt-2 ' + className || ''}>
      <label htmlFor={id || slugLable || uuid} className="block text-sm font-medium leading-6">
        {label}
      </label>

      <div className="mt-2 w-full">
        <Textarea
          name={id || slugLable || uuid}
          id={id || slugLable || uuid}
          className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
          ref={textareaRef}
          onChange={handleInput}
          onFocus={resize}
          value={modelValue as string}
          placeholder={placeholder}
          error={!!error}
        />
        {error && typeof error === 'string' && (
          <p className="mt-2 text-sm text-red-600" id="email-error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
