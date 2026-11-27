import React from 'react';
import { WritingStatus } from '../utils/workbenchLogic';

export const StatusLabel: React.FC<{ status: WritingStatus }> = ({ status }) => {
  const styles: Record<WritingStatus, string> = {
    LOCKED: 'text-[#4cc9c0] border-[#4cc9c0]/30 bg-[#4cc9c0]/10',
    DONE: 'text-[#52b778] border-[#52b778]/30 bg-[#52b778]/10',
    DRAFT: 'text-[#e5a03c] border-[#e5a03c]/40 bg-[#e5a03c]/10',
    TODO: 'text-[#64748b] border-[#263040] bg-[#0b0e13]',
    CUT: 'text-[#5a6678] border-[#263040] bg-[#0b0e13] line-through'
  };
  return (
    <span
      className={`font-mono text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 border ${styles[status]}`}
    >
      {status}
    </span>
  );
};

interface RaylibTextareaProps {
  value: string;
  onChange: (val: string) => void;
  onFocus?: (el: HTMLTextAreaElement) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
  softLimit?: number;
  limitLabel?: string;
  ariaLabel?: string;
}

export const RaylibTextarea: React.FC<RaylibTextareaProps> = ({
  value,
  onChange,
  onFocus,
  placeholder,
  rows = 2,
  readOnly = false,
  softLimit,
  limitLabel = 'Raylib UI width',
  ariaLabel
}) => {
  const len = (value || '').length;
  const overLimit = typeof softLimit === 'number' && softLimit > 0 && len > softLimit;

  return (
    <div className="w-full relative group">
      <textarea
        rows={rows}
        value={value}
        readOnly={readOnly}
        aria-label={ariaLabel || placeholder || 'Dialogue text'}
        placeholder={placeholder}
        onFocus={e => onFocus?.(e.currentTarget)}
        onChange={e => onChange(e.target.value)}
        className={`w-full bg-[#0b0e13] border px-3 py-2 font-mono text-[13px] leading-relaxed text-[#d8dee9] placeholder-[#475569] transition-colors resize-y focus:outline-none ${
          readOnly
            ? 'border-dashed border-[#222b38] text-[#8492a6] bg-[#0d1118]'
            : overLimit
            ? 'border-[#e5a03c] focus:border-[#e5a03c]'
            : 'border-[#222b38] focus:border-[#e5a03c]'
        }`}
      />
      {(len > 0 || overLimit) && (
        <div className="flex items-center justify-end mt-0.5 font-mono text-[10px] tabular-nums">
          {softLimit ? (
            <span className={overLimit ? 'text-[#e5a03c] font-bold' : 'text-[#64748b]'}>
              {len} / {softLimit} chars ({limitLabel}){overLimit ? ' — exceeds soft width limit' : ''}
            </span>
          ) : (
            <span className="text-[#64748b]">{len} chars</span>
          )}
        </div>
      )}
    </div>
  );
};
