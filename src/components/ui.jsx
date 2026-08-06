import React from "react";
import { BORDER, STAGE_COLOR, STAGES, SURFACE, TEXT, TEXT_FAINT, TEXT_MUTED } from "../lib/constants";

export function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-xl p-6 ${className}`}
      style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, ...style }}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
      <div className="text-xs font-medium" style={{ color: TEXT_FAINT }}>
        {label}
      </div>
      <div className="font-display text-2xl font-semibold mt-1" style={{ color: TEXT }}>
        {value}
      </div>
      {sub && (
        <div className="text-[11px] mt-0.5" style={{ color: TEXT_FAINT }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function StagePill({ stage }) {
  const color = STAGE_COLOR[stage] || "#5B6B85";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: color + "1f", color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
      {stage}
    </span>
  );
}

export function StageRail({ currentStage, isLost }) {
  const idx = STAGES.indexOf(currentStage);
  return (
    <div className="flex items-center w-full">
      {STAGES.map((s, i) => {
        const reached = !isLost && i <= idx;
        const isCurrent = !isLost && i === idx;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className="w-2.5 h-2.5 rounded-full border-2 transition-colors"
                style={{
                  borderColor: reached ? STAGE_COLOR[s] : BORDER,
                  backgroundColor: isCurrent ? STAGE_COLOR[s] : reached ? STAGE_COLOR[s] + "33" : "transparent",
                  boxShadow: isCurrent ? `0 0 10px ${STAGE_COLOR[s]}99` : "none",
                }}
              />
              <span
                className={`text-[10px] tracking-wide ${isCurrent ? "font-semibold" : ""}`}
                style={{ color: isCurrent ? STAGE_COLOR[s] : TEXT_FAINT }}
              >
                {s}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className="flex-1 h-[2px] mx-1 mb-4"
                style={{ backgroundColor: reached && i < idx ? STAGE_COLOR[s] : BORDER }}
              />
            )}
          </React.Fragment>
        );
      })}
      {isLost && (
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 ml-3">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: STAGE_COLOR.Lost, boxShadow: `0 0 8px ${STAGE_COLOR.Lost}99` }}
          />
          <span className="text-[10px] font-semibold" style={{ color: STAGE_COLOR.Lost }}>
            Lost
          </span>
        </div>
      )}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium mb-1 block" style={{ color: TEXT_MUTED }}>
        {label}
      </label>
      {children}
    </div>
  );
}
