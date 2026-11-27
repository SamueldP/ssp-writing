import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Terminal, ArrowRight, FileCode, Copy } from 'lucide-react';
import { WritingStatus } from '../utils/workbenchLogic';
import {
  SourceBadgeInfo,
  InGameContextFlow,
  RAYLIB_LIMITS,
  RaylibLimitSpec,
  ENCOUNTER_SCRIPT_FLOW
} from '../utils/auditReferenceData';

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

export const SourceBadge: React.FC<{ badge?: SourceBadgeInfo }> = ({ badge }) => {
  if (!badge) return null;

  const styles =
    badge.kind === 'LIVE_JSON'
      ? 'text-[#4cc9c0] border-[#4cc9c0]/40 bg-[#4cc9c0]/10'
      : badge.kind === 'HARDCODED_CS'
      ? 'text-[#e5a03c] border-[#e5a03c]/40 bg-[#e5a03c]/10'
      : 'text-[#a78bfa] border-[#a78bfa]/40 bg-[#a78bfa]/10';

  return (
    <span
      title={`${badge.label} — ${badge.location}${badge.note ? ` (${badge.note})` : ''}`}
      className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider px-1.5 py-0.5 border whitespace-nowrap ${styles}`}
    >
      <FileCode className="w-2.5 h-2.5 shrink-0" />
      <span>{badge.label}</span>
      <span className="opacity-75 font-normal hidden xl:inline">· {badge.location}</span>
    </span>
  );
};

export const InGameContextStrip: React.FC<{ flow?: InGameContextFlow }> = ({ flow }) => {
  if (!flow) return null;
  return (
    <div className="bg-[#0b0e13] border border-[#222b38] px-3 py-2 text-[11px] font-mono space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-[10px] text-[#4cc9c0] uppercase tracking-wider font-bold">
        <span>IN-GAME CONTEXT &amp; SURROUNDING BEATS (SECTION 1 AUDIT)</span>
        {flow.pacingNote && <span className="text-[#8492a6] font-normal normal-case">{flow.pacingNote}</span>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] leading-snug">
        <div className="bg-[#11161f] border border-[#1e2633] px-2.5 py-1.5">
          <span className="text-[#64748b] font-bold block text-[9.5px] uppercase">1. BEFORE</span>
          <span className="text-[#94a3b8]">{flow.before}</span>
        </div>
        <div className="bg-[#171f2c] border border-[#e5a03c]/40 px-2.5 py-1.5">
          <span className="text-[#e5a03c] font-bold block text-[9.5px] uppercase flex items-center gap-1">
            <ArrowRight className="w-2.5 h-2.5" /> 2. THIS LINE
          </span>
          <span className="text-[#d8dee9]">{flow.thisLine}</span>
        </div>
        <div className="bg-[#11161f] border border-[#1e2633] px-2.5 py-1.5">
          <span className="text-[#64748b] font-bold block text-[9.5px] uppercase">3. AFTER</span>
          <span className="text-[#94a3b8]">{flow.after}</span>
        </div>
      </div>
    </div>
  );
};

export const CurrentlyInGameBox: React.FC<{
  text?: string;
  source?: string;
  badge?: SourceBadgeInfo;
  onCopyToEditor?: () => void;
}> = ({ text, source, badge, onCopyToEditor }) => {
  if (!text) return null;
  return (
    <div className="bg-[#0a0d12] border border-[#1e2736] px-3 py-2 space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-bold text-[#8492a6] uppercase tracking-wider bg-[#151c27] border border-[#263040] px-1.5 py-0.5">
            CURRENTLY IN GAME
          </span>
          {source && (
            <span className="font-mono text-[10.5px] text-[#4cc9c0]">
              {source}
            </span>
          )}
          {badge && <SourceBadge badge={badge} />}
        </div>
        {onCopyToEditor && (
          <button
            type="button"
            onClick={onCopyToEditor}
            title="Copy verbatim in-game text into the editor field below"
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#121720] border border-[#263040] font-mono text-[10px] text-[#8492a6] hover:border-[#e5a03c] hover:text-[#d8dee9] cursor-pointer"
          >
            <Copy className="w-2.5 h-2.5" /> COPY TO EDITOR
          </button>
        )}
      </div>
      <pre className="font-mono text-[11.5px] leading-relaxed text-[#94a3b8] whitespace-pre-wrap break-words select-all m-0">
        {text}
      </pre>
      {badge?.note && (
        <div className="font-mono text-[10.5px] text-[#e5a03c] pt-0.5">
          {badge.note}
        </div>
      )}
    </div>
  );
};

export const EncounterFlowReferencePanel: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-[#121720] border border-[#263040]">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        className="w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#161d28] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {open ? (
            <ChevronDown className="w-4 h-4 text-[#4cc9c0] shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#4cc9c0] shrink-0" />
          )}
          <Terminal className="w-3.5 h-3.5 text-[#4cc9c0] shrink-0" />
          <span className="font-mono text-xs font-bold text-[#4cc9c0] tracking-wide">
            ENCOUNTER SCRIPT FLOW — FULL TURN-BY-TURN TIMELINE (SECTION 1 AUDIT REFERENCE)
          </span>
        </div>
        <span className="font-mono text-[10.5px] text-[#8492a6] shrink-0">
          {open ? 'HIDE TIMELINE' : 'SHOW TIMELINE (STAGES 0–5)'}
        </span>
      </button>

      {open && (
        <div className="p-4 border-t border-[#222b38] space-y-3 bg-[#0d1118]">
          <div className="bg-[#121720] border border-[#222b38] p-2.5 font-mono text-[11px] text-[#94a3b8] space-y-1">
            <div>
              <strong className="text-[#e5a03c]">STATE MACHINE (UI/DeskScreen.cs:23-38):</strong>{' '}
              BayEmpty (0) → ShipGlidingIn (1, 3.2s) → OpeningGreetingDelay (2, 0.18s) → [AwaitingAutoShieldsDrop (12)] → DownloadingProtocols (4, 1.80s) → InspectingSlateAndShip (6) → UploadingClearance (7, 1.80s) → TransmittingClearance (9, 1.80s) → ResolvingDecision (11, 1.25s).
            </div>
            <div>
              <strong className="text-[#4cc9c0]">COMMS PACING (CommsTypewriterQueue.cs):</strong>{' '}
              Routine lines stream at <code className="text-[#d8dee9]">65 chars/sec</code>; Pre-shift talking-head hails stream at <code className="text-[#d8dee9]">32 chars/sec</code> (0.95s line pause). Auto-inserts <code className="text-[#d8dee9]">0.60s [RECEIVING...]</code> lag whenever Captain speaks immediately after Officer.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {ENCOUNTER_SCRIPT_FLOW.map(st => (
              <div key={st.stage} className="bg-[#121720] border border-[#222b38] p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2633] pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10.5px] font-bold px-1.5 py-0.5 bg-[#e5a03c]/15 border border-[#e5a03c]/50 text-[#e5a03c]">
                      {st.stage}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#d8dee9]">{st.title}</span>
                  </div>
                  <span className="font-mono text-[10.5px] text-[#4cc9c0]">{st.sourceLoc}</span>
                </div>
                <p className="text-xs text-[#8492a6]">{st.summary}</p>
                <div className="space-y-1.5">
                  {st.steps.map(step => {
                    const spkColor =
                      step.speaker === 'OFFICER'
                        ? 'text-[#4cc9c0] border-[#4cc9c0]/40 bg-[#4cc9c0]/10'
                        : step.speaker === 'CAPTAIN'
                        ? 'text-[#e5a03c] border-[#e5a03c]/40 bg-[#e5a03c]/10'
                        : 'text-[#94a3b8] border-[#334155] bg-[#0b0e13]';
                    return (
                      <div
                        key={step.num}
                        className="bg-[#0b0e13] border border-[#1e2633] px-2.5 py-1.5 font-mono text-[11px] space-y-0.5"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[#64748b] font-bold">#{step.num}</span>
                          <span className={`text-[9.5px] px-1.5 py-0.2 border font-bold ${spkColor}`}>
                            {step.speaker}
                          </span>
                          <span className="text-[#d8dee9] font-bold">{step.line}</span>
                        </div>
                        <div className="text-[#8492a6] text-[10.5px] pl-6">{step.detail}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
  raylibPreset?: keyof typeof RAYLIB_LIMITS;
  ariaLabel?: string;
}

function estimateWrappedLines(text: string, charsPerLine: number): { totalLines: number; longestRawLine: number } {
  if (!text) return { totalLines: 0, longestRawLine: 0 };
  const rawLines = text.split('\n');
  let totalLines = 0;
  let longestRawLine = 0;
  for (const raw of rawLines) {
    if (raw.length > longestRawLine) longestRawLine = raw.length;
    if (raw.length === 0) {
      totalLines += 1;
    } else {
      totalLines += Math.ceil(raw.length / Math.max(1, charsPerLine));
    }
  }
  return { totalLines, longestRawLine };
}

export const RaylibTextarea: React.FC<RaylibTextareaProps> = ({
  value,
  onChange,
  onFocus,
  placeholder,
  rows = 2,
  readOnly = false,
  softLimit,
  limitLabel,
  raylibPreset = 'comms_line',
  ariaLabel
}) => {
  const spec: RaylibLimitSpec = RAYLIB_LIMITS[raylibPreset] || RAYLIB_LIMITS.comms_line;
  const effectiveSoftLimit = softLimit ?? spec.softCharLimit;
  const effectiveLabel = limitLabel || spec.label;

  const text = value || '';
  const len = text.length;
  const { totalLines: estLinesPlusThree, longestRawLine } = estimateWrappedLines(
    text,
    spec.charsPerLinePlusThree
  );

  const overCharLimit = effectiveSoftLimit > 0 && len > effectiveSoftLimit;
  const overLineLimit = typeof spec.maxLines === 'number' && estLinesPlusThree > spec.maxLines;
  const overSingleLineWidth =
    Boolean(spec.enforceSingleLineAtPlusThree) && longestRawLine > spec.charsPerLinePlusThree;
  const overLimit = overCharLimit || overLineLimit || overSingleLineWidth;

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
            ? 'border-[#e5a03c] focus:border-[#e5a03c] bg-[#16120b]'
            : 'border-[#222b38] focus:border-[#e5a03c]'
        }`}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 mt-0.5 font-mono text-[10px] tabular-nums">
        <span className="text-[#5a6678] truncate" title={spec.notes}>
          Raylib: {spec.innerWidthPx}px inner · ~{spec.charsPerLinePlusThree} chars/line (+3){' '}
          {!spec.denseRow ? `/ ~${spec.charsPerLineZero} (+0)` : '(denseRow locked)'}
          {spec.maxLines ? ` · max ${spec.maxLines} line${spec.maxLines === 1 ? '' : 's'}` : ''}
        </span>
        <span className={overLimit ? 'text-[#e5a03c] font-bold' : 'text-[#64748b]'}>
          {len} / {effectiveSoftLimit} chars
          {spec.maxLines
            ? ` · ~${estLinesPlusThree}/${spec.maxLines} lines (@+3)`
            : ` · ~${estLinesPlusThree} lines (@+3)`}
          {' '}({effectiveLabel})
          {overCharLimit ? ' — EXCEEDS BOX CHAR LIMIT' : ''}
          {!overCharLimit && overLineLimit ? ` — EXCEEDS ${spec.maxLines}-LINE BOX HEIGHT (@+3)` : ''}
          {!overCharLimit && !overLineLimit && overSingleLineWidth
            ? ` — LINE OVERFLOWS ${spec.innerWidthPx}PX AT +3 (> ${spec.charsPerLinePlusThree} CHARS)`
            : ''}
        </span>
      </div>
    </div>
  );
};
