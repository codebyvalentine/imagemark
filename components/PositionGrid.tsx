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
          <div className="text-current mb-1">
            <div className="w-8 h-8 border-2 border-gray-400 rounded-md relative bg-white">
              <div 
                className="absolute w-2 h-2 bg-gray-500 rounded-sm z-10"
                style={{
                  top: preset.id.includes('top') ? '2px' : preset.id.includes('bottom') ? 'auto' : '50%',
                  bottom: preset.id.includes('bottom') ? '2px' : 'auto',
                  left: preset.id.includes('left') ? '2px' : preset.id.includes('right') ? 'auto' : '50%',
                  right: preset.id.includes('right') ? '2px' : 'auto',
                  transform: preset.id.includes('center') ? 
                    (preset.id === 'center' ? 'translate(-50%, -50%)' : 
                     preset.id.includes('center-left') || preset.id.includes('center-right') ? 'translateY(-50%)' : 
                     'translateX(-50%)') : 'none'
                }}
              />
            </div>
          </div>
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
