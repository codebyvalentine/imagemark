"use client"

import type { PositionPreset } from "@/types/watermark"
import { POSITION_PRESETS } from "@/constants/watermark"
import type React from "react"
import { memo } from "react"

interface PositionGridProps {
  selectedPreset: string
  onSelectPreset: (preset: PositionPreset) => void
}

export const PositionGrid: React.FC<PositionGridProps> = memo(({ selectedPreset, onSelectPreset }) => {
  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {POSITION_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onSelectPreset(preset)}
          className={`group relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 touch-manipulation ${
            selectedPreset === preset.id
              ? "bg-teal-100 text-teal-700 ring-2 ring-teal-500 shadow-md scale-105"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-102 active:scale-95"
          }`}
          title={preset.name}
          aria-label={`Position: ${preset.name}`}
        >
          <div className="text-current mb-1">{preset.icon}</div>
          <span className="text-xs font-medium text-center leading-tight">{preset.name}</span>

          {selectedPreset === preset.id && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-600 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          )}
        </button>
      ))}
    </div>
  )
})

PositionGrid.displayName = "PositionGrid"
