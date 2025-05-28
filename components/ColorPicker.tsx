"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [hexInput, setHexInput] = useState(color)

  const handleColorClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Force trigger the native color picker
    if (colorInputRef.current) {
      colorInputRef.current.click()
      // For mobile devices, also try to focus
      colorInputRef.current.focus()
    }
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    onChange(newColor)
    setHexInput(newColor)
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setHexInput(value)

    if (/^#[0-9A-F]{6}$/i.test(value)) {
      onChange(value)
    }
  }

  const isValidHex = /^#[0-9A-F]{6}$/i.test(hexInput)

  useEffect(() => {
    setHexInput(color)
  }, [color])

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">Custom Color</Label>
      <div className="flex items-center gap-3">
        {/* Color Swatch Button - Make it more touch-friendly */}
        <button
          type="button"
          onClick={handleColorClick}
          className="group relative w-16 h-12 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden touch-manipulation"
          title="Click to open color picker"
          style={{ minHeight: "48px" }} // Ensure minimum touch target size
        >
          <div
            className="w-full h-full transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: color }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200" />

          {/* Always visible icon for better mobile UX */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-white bg-opacity-80 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3V1m0 20v-2m8-10h2m-2 4h2m-2 4h2m-2-8h2"
                />
              </svg>
            </div>
          </div>
        </button>

        {/* Hex Input */}
        <div className="flex-1">
          <div className="relative">
            <Input
              value={hexInput}
              onChange={handleHexInputChange}
              placeholder="#FFFFFF"
              className={`font-mono text-sm pl-8 transition-all duration-200 ${
                isValidHex
                  ? "border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  : "border-red-300 focus:border-red-500 focus:ring-red-500"
              }`}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-mono">#</div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {hexInput && (
                <div
                  className={`w-2 h-2 rounded-full ${isValidHex ? "bg-green-500" : "bg-red-500"}`}
                  title={isValidHex ? "Valid color" : "Invalid color format"}
                />
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter a 6-digit hex color code</p>
        </div>

        {/* Native color input - positioned to be accessible but hidden */}
        <input
          ref={colorInputRef}
          type="color"
          value={color}
          onChange={handleColorChange}
          className="absolute opacity-0 pointer-events-none w-0 h-0"
          tabIndex={-1}
        />
      </div>
    </div>
  )
}
