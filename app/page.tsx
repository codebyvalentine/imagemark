"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Download, Settings, ChevronDown, RotateCcw, X, Plus, Upload, Shield, Zap, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Types
interface WatermarkSettings {
  type: "text" | "image"
  text: string
  font: string
  fontSize: number
  fontMode: "light" | "dark" | "custom"
  customColor: string
  opacity: number
  rotation: number
  positionX: number
  positionY: number
  positionPreset: string
  imageSize: number
}

interface ImageItem {
  id: string
  image: HTMLImageElement
  file: File
  canvas?: HTMLCanvasElement
  customSettings?: WatermarkSettings
}

interface PositionPreset {
  id: string
  name: string
  x: number
  y: number
  icon: React.ReactNode
}

// Constants
const DEFAULT_SETTINGS: WatermarkSettings = {
  type: "text",
  text: "Enter text",
  font: "Inter",
  fontSize: 14,
  fontMode: "light",
  customColor: "#ffffff",
  opacity: 10,
  rotation: -45,
  positionX: 50,
  positionY: 50,
  positionPreset: "center",
  imageSize: 25,
}

const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
]
const ANALYSIS_SIZE = 100

// Preset colors for quick selection
const PRESET_COLORS = [
  "#ffffff", // White
  "#000000", // Black
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f59e0b", // Amber
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#f43f5e", // Rose
  "#64748b", // Slate
]

const FONT_OPTIONS = [
  { name: "Inter", family: "Inter, sans-serif", category: "Sans Serif" },
  { name: "Roboto", family: "Roboto, sans-serif", category: "Sans Serif" },
  { name: "Open Sans", family: "'Open Sans', sans-serif", category: "Sans Serif" },
  { name: "Lato", family: "Lato, sans-serif", category: "Sans Serif" },
  { name: "Montserrat", family: "Montserrat, sans-serif", category: "Sans Serif" },
  { name: "Poppins", family: "Poppins, sans-serif", category: "Sans Serif" },
  { name: "Source Sans Pro", family: "'Source Sans Pro', sans-serif", category: "Sans Serif" },
  { name: "Arial", family: "Arial, sans-serif", category: "Sans Serif" },
  { name: "Helvetica", family: "Helvetica, Arial, sans-serif", category: "Sans Serif" },

  { name: "Playfair Display", family: "'Playfair Display', serif", category: "Serif" },
  { name: "Merriweather", family: "Merriweather, serif", category: "Serif" },
  { name: "Lora", family: "Lora, serif", category: "Serif" },
  { name: "Crimson Text", family: "'Crimson Text', serif", category: "Serif" },
  { name: "Times New Roman", family: "'Times New Roman', Times, serif", category: "Serif" },
  { name: "Georgia", family: "Georgia, serif", category: "Serif" },

  { name: "Fira Code", family: "'Fira Code', monospace", category: "Monospace" },
  { name: "Source Code Pro", family: "'Source Code Pro', monospace", category: "Monospace" },
  { name: "JetBrains Mono", family: "'JetBrains Mono', monospace", category: "Monospace" },
  { name: "Courier New", family: "'Courier New', Courier, monospace", category: "Monospace" },

  { name: "Bebas Neue", family: "'Bebas Neue', sans-serif", category: "Display" },
  { name: "Oswald", family: "Oswald, sans-serif", category: "Display" },
  { name: "Anton", family: "Anton, sans-serif", category: "Display" },
  { name: "Bangers", family: "Bangers, cursive", category: "Display" },
  { name: "Impact", family: "Impact, 'Arial Black', sans-serif", category: "Display" },

  { name: "Dancing Script", family: "'Dancing Script', cursive", category: "Script" },
  { name: "Pacifico", family: "Pacifico, cursive", category: "Script" },
  { name: "Great Vibes", family: "'Great Vibes', cursive", category: "Script" },
]

// Position Presets - Updated with better mobile-friendly design
const POSITION_PRESETS: PositionPreset[] = [
  {
    id: "top-left",
    name: "Top Left",
    x: 10,
    y: 10,
    icon: (
      <div className="w-8 h-8 border-2 border-current rounded-md relative">
        <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-current rounded-sm"></div>
      </div>
    ),
  },
  {
    id: "top-center",
    name: "Top Center",
    x: 50,
    y: 10,
    icon: (
      <div className="w-8 h-8 border-2 border-current rounded-md relative">
        <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-current rounded-sm"></div>
      </div>
    ),
  },
  {
    id: "top-right",
    name: "Top Right",
    x: 90,
    y: 10,
    icon: (
      <div className="w-8 h-8 border-2 border-current rounded-md relative">
        <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-current rounded-sm"></div>
      </div>
    ),
  },
  {
    id: "center-left",
    name: "Center Left",
    x: 10,
    y: 50,
    icon: (
      <div className="w-8 h-8 border-2 border-current rounded-md relative">
        <div className="absolute top-1/2 left-0.5 transform -translate-y-1/2 w-2 h-2 bg-current rounded-sm"></div>
      </div>
    ),
  },
  {
    id: "center",
    name: "Center",
    x: 50,
    y: 50,
    icon: (
      <div className="w-8 h-8 border-2 border-current rounded-md relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-current rounded-sm"></div>
      </div>
    ),
  },
  {
    id: "center-right",
    name: "Center Right",
    x: 90,
    y: 50,
    icon: (
      <div className="w-8 h-8 border-2 border-current rounded-md relative">
        <div className="absolute top-1/2 right-0.5 transform -translate-y-1/2 w-2 h-2 bg-current rounded-sm"></div>
      </div>
    ),
  },
  {
    id: "bottom-left",
    name: "Bottom Left",
    x: 10,
    y: 90,
    icon: (
      <div className="w-8 h-8 border-2 border-current rounded-md relative">
        <div className="absolute bottom-0.5 left-0.5 w-2 h-2 bg-current rounded-sm"></div>
      </div>
    ),
  },
  {
    id: "bottom-center",
    name: "Bottom Center",
    x: 50,
    y: 90,
    icon: (
      <div className="w-8 h-8 border-2 border-current rounded-md relative">
        <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-current rounded-sm"></div>
      </div>
    ),
  },
  {
    id: "bottom-right",
    name: "Bottom Right",
    x: 90,
    y: 90,
    icon: (
      <div className="w-8 h-8 border-2 border-current rounded-md relative">
        <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-current rounded-sm"></div>
      </div>
    ),
  },
]

// Logo Component
const ImageMarkLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="16" rx="2" fill="#0D9488" />
    <rect x="6" y="10" width="12" height="8" rx="1" fill="white" fillOpacity="0.3" />
    <circle cx="24" cy="8" r="6" fill="#14B8A6" />
    <path d="M21 8L23 10L27 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="4" y="8" width="2" height="2" rx="1" fill="white" fillOpacity="0.6" />
  </svg>
)

// Enhanced Color Picker Component - OS Native with Better Styling
const ColorPicker = ({
  color,
  onChange,
}: {
  color: string
  onChange: (color: string) => void
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [hexInput, setHexInput] = useState(color)

  const handleColorClick = () => {
    colorInputRef.current?.click()
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    onChange(newColor)
    setHexInput(newColor)
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setHexInput(value)

    // Validate hex color format and update if valid
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      onChange(value)
    }
  }

  const isValidHex = /^#[0-9A-F]{6}$/i.test(hexInput)

  // Update hex input when color prop changes
  useEffect(() => {
    setHexInput(color)
  }, [color])

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">Custom Color</Label>
      <div className="flex items-center gap-3">
        {/* Color Swatch Button */}
        <button
          type="button"
          onClick={handleColorClick}
          className="group relative w-16 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden"
          title="Click to open color picker"
        >
          <div
            className="w-full h-full transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: color }}
          />
          {/* Subtle overlay for better visual feedback */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200" />

          {/* Color picker icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-5 h-5 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {/* Hash symbol */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-mono">#</div>

            {/* Validation indicator */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {hexInput &&
                (isValidHex ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Valid color" />
                ) : (
                  <div className="w-2 h-2 bg-red-500 rounded-full" title="Invalid color format" />
                ))}
            </div>
          </div>

          {/* Helper text */}
          <p className="text-xs text-gray-500 mt-1">Enter a 6-digit hex color code</p>
        </div>

        {/* Hidden native color input */}
        <input ref={colorInputRef} type="color" value={color} onChange={handleColorChange} className="sr-only" />
      </div>
    </div>
  )
}

// Position Grid Component - Updated for better mobile UX
const PositionGrid = ({
  selectedPreset,
  onSelectPreset,
}: {
  selectedPreset: string
  onSelectPreset: (preset: PositionPreset) => void
}) => {
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

          {/* Active indicator */}
          {selectedPreset === preset.id && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-600 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

// Individual Image Settings Modal
const ImageSettingsModal = ({
  imageItem,
  globalSettings,
  watermarkImage,
  onClose,
  onSave,
}: {
  imageItem: ImageItem
  globalSettings: WatermarkSettings
  watermarkImage: HTMLImageElement | null
  onClose: () => void
  onSave: (settings: WatermarkSettings) => void
}) => {
  const [localSettings, setLocalSettings] = useState<WatermarkSettings>(
    imageItem.customSettings || { ...globalSettings },
  )
  const [useGlobalSettings, setUseGlobalSettings] = useState(!imageItem.customSettings)

  const updateLocalSetting = useCallback(<K extends keyof WatermarkSettings>(key: K, value: WatermarkSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))

    // If updating position manually, clear the preset selection
    if (key === "positionX" || key === "positionY") {
      setLocalSettings((prev) => ({ ...prev, positionPreset: "custom" }))
    }
  }, [])

  const handlePositionPresetSelect = useCallback((preset: PositionPreset) => {
    setLocalSettings((prev) => ({
      ...prev,
      positionX: preset.x,
      positionY: preset.y,
      positionPreset: preset.id,
    }))
  }, [])

  const handleSave = () => {
    if (useGlobalSettings) {
      onSave(globalSettings)
    } else {
      onSave(localSettings)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Image Settings</h2>
              <p className="text-sm text-gray-600 mt-1">{imageItem.file.name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Use Global Settings Toggle */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="useGlobal"
                checked={useGlobalSettings}
                onChange={(e) => setUseGlobalSettings(e.target.checked)}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="useGlobal" className="text-sm font-medium text-gray-700">
                Use global watermark settings
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              When enabled, this image will use the global settings. Disable to customize this image individually.
            </p>
          </div>

          {/* Custom Settings Panel */}
          {!useGlobalSettings && (
            <div className="space-y-6">
              {/* Type Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Watermark Type</Label>
                <div className="grid grid-cols-2 gap-2 max-w-xs">
                  <Button
                    variant={localSettings.type === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateLocalSetting("type", "text")}
                    className={`h-10 font-medium transition-all ${
                      localSettings.type === "text"
                        ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                        : "border-gray-300 hover:border-teal-400 hover:text-teal-600"
                    }`}
                  >
                    Text
                  </Button>
                  <Button
                    variant={localSettings.type === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateLocalSetting("type", "image")}
                    className={`h-10 font-medium transition-all ${
                      localSettings.type === "image"
                        ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                        : "border-gray-300 hover:border-teal-400 hover:text-teal-600"
                    }`}
                  >
                    Image
                  </Button>
                </div>
              </div>

              {/* Text Settings */}
              {localSettings.type === "text" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Watermark Text</Label>
                    <Input
                      value={localSettings.text}
                      onChange={(e) => updateLocalSetting("text", e.target.value)}
                      placeholder="Enter your watermark text"
                      className="text-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Font Family</Label>
                    <select
                      value={localSettings.font}
                      onChange={(e) => updateLocalSetting("font", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.name} value={font.name} style={{ fontFamily: font.family }}>
                          {font.name} ({font.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Text Color</Label>
                    <div className="space-y-4">
                      {/* Color Mode Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button
                          variant={localSettings.fontMode === "light" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateLocalSetting("fontMode", "light")}
                          className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                            localSettings.fontMode === "light"
                              ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                              : "border-gray-300 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 bg-gray-300 rounded-full border border-gray-400" />
                            <span>Light</span>
                          </div>
                        </Button>
                        <Button
                          variant={localSettings.fontMode === "dark" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateLocalSetting("fontMode", "dark")}
                          className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                            localSettings.fontMode === "dark"
                              ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                              : "border-gray-300 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 bg-gray-700 rounded-full border border-gray-600" />
                            <span>Dark</span>
                          </div>
                        </Button>
                        <Button
                          variant={localSettings.fontMode === "custom" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateLocalSetting("fontMode", "custom")}
                          className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                            localSettings.fontMode === "custom"
                              ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                              : "border-gray-300 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <div
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: localSettings.customColor }}
                            />
                            <span>Custom</span>
                          </div>
                        </Button>
                      </div>

                      {/* Custom Color Picker */}
                      {localSettings.fontMode === "custom" && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <ColorPicker
                            color={localSettings.customColor}
                            onChange={(color) => updateLocalSetting("customColor", color)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Image Settings */}
              {localSettings.type === "image" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                    <span>Size</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={localSettings.imageSize}
                        onChange={(e) => {
                          const value = Math.max(5, Math.min(50, Number(e.target.value) || 5))
                          updateLocalSetting("imageSize", value)
                        }}
                        className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                        min={5}
                        max={50}
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  </Label>
                  <Slider
                    value={[localSettings.imageSize]}
                    onValueChange={(value) => updateLocalSetting("imageSize", value[0])}
                    min={5}
                    max={50}
                    step={1}
                    className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                  />
                </div>
              )}

              {/* Position Presets */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Position Presets</Label>
                <PositionGrid
                  selectedPreset={localSettings.positionPreset}
                  onSelectPreset={handlePositionPresetSelect}
                />
              </div>

              {/* Advanced Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Advanced Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                      <span>Size</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={localSettings.fontSize}
                          onChange={(e) => {
                            const value = Math.max(5, Math.min(30, Number(e.target.value) || 5))
                            updateLocalSetting("fontSize", value)
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={5}
                          max={30}
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </Label>
                    <Slider
                      value={[localSettings.fontSize]}
                      onValueChange={(value) => updateLocalSetting("fontSize", value[0])}
                      min={5}
                      max={30}
                      step={1}
                      className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                      <span>Rotation</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={localSettings.rotation}
                          onChange={(e) => {
                            const value = Math.max(-180, Math.min(180, Number(e.target.value) || 0))
                            updateLocalSetting("rotation", value)
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={-180}
                          max={180}
                        />
                        <span className="text-xs text-gray-500">°</span>
                      </div>
                    </Label>
                    <Slider
                      value={[localSettings.rotation]}
                      onValueChange={(value) => updateLocalSetting("rotation", value[0])}
                      min={-180}
                      max={180}
                      step={5}
                      className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                      <span>Opacity</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={localSettings.opacity}
                          onChange={(e) => {
                            const value = Math.max(1, Math.min(100, Number(e.target.value) || 1))
                            updateLocalSetting("opacity", value)
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={1}
                          max={100}
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </Label>
                    <Slider
                      value={[localSettings.opacity]}
                      onValueChange={(value) => updateLocalSetting("opacity", value[0])}
                      min={1}
                      max={100}
                      step={1}
                      className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                      <span>Position X</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={localSettings.positionX}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(100, Number(e.target.value) || 0))
                            updateLocalSetting("positionX", value)
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={0}
                          max={100}
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </Label>
                    <Slider
                      value={[localSettings.positionX]}
                      onValueChange={(value) => updateLocalSetting("positionX", value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                      <span>Position Y</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={localSettings.positionY}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(100, Number(e.target.value) || 0))
                            updateLocalSetting("positionY", value)
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={0}
                          max={100}
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </Label>
                    <Slider
                      value={[localSettings.positionY]}
                      onValueChange={(value) => updateLocalSetting("positionY", value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end pt-6 border-t border-gray-200 mt-6">
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white">
                Apply Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom Hooks
const useImageBrightness = () => {
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null)

  const analyzeImageBrightness = useCallback((image: HTMLImageElement): "light" | "dark" => {
    const canvas = analysisCanvasRef.current
    if (!canvas) return "light"

    const ctx = canvas.getContext("2d")
    if (!ctx) return "light"

    canvas.width = ANALYSIS_SIZE
    canvas.height = ANALYSIS_SIZE

    ctx.drawImage(image, 0, 0, ANALYSIS_SIZE, ANALYSIS_SIZE)

    const imageData = ctx.getImageData(0, 0, ANALYSIS_SIZE, ANALYSIS_SIZE)
    const data = imageData.data

    let totalBrightness = 0
    const pixelCount = data.length / 4

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      totalBrightness += brightness
    }

    const averageBrightness = (totalBrightness / pixelCount) * 100
    return averageBrightness < 50 ? "light" : "dark"
  }, [])

  return { analyzeImageBrightness, analysisCanvasRef }
}

const useWatermarkCanvas = (globalSettings: WatermarkSettings, watermarkImage: HTMLImageElement | null) => {
  const drawWatermarkOnCanvas = useCallback(
    (image: HTMLImageElement, canvas: HTMLCanvasElement, customSettings?: WatermarkSettings) => {
      const settings = customSettings || globalSettings
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = image.width
      canvas.height = image.height

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0)

      if ((settings.type === "text" && settings.text.trim()) || (settings.type === "image" && watermarkImage)) {
        ctx.save()
        ctx.globalAlpha = settings.opacity / 100

        if (settings.type === "text" && settings.text.trim()) {
          const fontSize = (settings.fontSize / 100) * image.width
          const selectedFont = FONT_OPTIONS.find((f) => f.name === settings.font)
          const fontFamily = selectedFont ? selectedFont.family : "Inter, sans-serif"
          ctx.font = `bold ${fontSize}px ${fontFamily}`

          // Set color based on font mode
          if (settings.fontMode === "light") {
            ctx.fillStyle = "#D1D5DB"
          } else if (settings.fontMode === "dark") {
            ctx.fillStyle = "#374151"
          } else {
            ctx.fillStyle = settings.customColor
          }

          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          const x = (settings.positionX / 100) * image.width
          const y = (settings.positionY / 100) * image.height

          ctx.translate(x, y)
          ctx.rotate((settings.rotation * Math.PI) / 180)
          ctx.fillText(settings.text, 0, 0)
        } else if (settings.type === "image" && watermarkImage) {
          const watermarkWidth = (settings.imageSize / 100) * image.width
          const aspectRatio = watermarkImage.height / watermarkImage.width
          const watermarkHeight = watermarkWidth * aspectRatio

          const x = (settings.positionX / 100) * image.width - watermarkWidth / 2
          const y = (settings.positionY / 100) * image.height - watermarkHeight / 2

          ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight)
        }

        ctx.restore()
      }
    },
    [globalSettings, watermarkImage],
  )

  return { drawWatermarkOnCanvas }
}

// Utility Functions
const createImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error(`Failed to load image: ${file.name}`))
    }
    img.src = URL.createObjectURL(file)
  })
}

const downloadBlob = (blob: Blob, filename: string): Promise<void> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()

    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      resolve()
    }, 100)
  })
}

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error("Failed to create blob"))
        }
      },
      "image/png",
      1.0,
    )
  })
}

export default function WatermarkingTool() {
  // State
  const [mounted, setMounted] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [hasEditedSettings, setHasEditedSettings] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [editingImageId, setEditingImageId] = useState<string | null>(null)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Custom Hooks
  const { analyzeImageBrightness, analysisCanvasRef } = useImageBrightness()
  const { drawWatermarkOnCanvas } = useWatermarkCanvas(settings, watermarkImage)

  // Effects
  useEffect(() => {
    setMounted(true)
  }, [])

  // Memoized values
  const hasWatermark = useMemo(() => {
    return (settings.type === "text" && settings.text.trim()) || (settings.type === "image" && watermarkImage)
  }, [settings.type, settings.text, watermarkImage])

  // Handlers
  const handleFileUpload = useCallback(
    async (files: FileList) => {
      setIsProcessing(true)
      const validFiles = Array.from(files).filter((file) => ACCEPTED_FILE_TYPES.includes(file.type))

      if (validFiles.length === 0) {
        setIsProcessing(false)
        return
      }

      try {
        const imagePromises = validFiles.map(async (file, index) => {
          const image = await createImageFromFile(file)
          return {
            id: `${Date.now()}-${index}`,
            image,
            file,
          }
        })

        const newImages = await Promise.all(imagePromises)

        // Analyze brightness for the first image
        if (newImages.length > 0) {
          const fontMode = analyzeImageBrightness(newImages[0].image)
          setSettings((prev) => ({ ...prev, fontMode }))
        }

        setImages((prev) => [...prev, ...newImages])
      } catch (error) {
        console.error("Error processing images:", error)
      } finally {
        setIsProcessing(false)
      }
    },
    [analyzeImageBrightness],
  )

  const updateCanvases = useCallback(() => {
    setImages((prev) =>
      prev.map((imageItem) => {
        const canvas = document.createElement("canvas")
        drawWatermarkOnCanvas(imageItem.image, canvas, imageItem.customSettings)
        return { ...imageItem, canvas }
      }),
    )
  }, [drawWatermarkOnCanvas])

  useEffect(() => {
    if (images.length > 0 && hasWatermark) {
      updateCanvases()
    }
  }, [updateCanvases, images.length, hasWatermark])

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files) {
        handleFileUpload(files)
      }
    },
    [handleFileUpload],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files) {
        handleFileUpload(e.dataTransfer.files)
      }
    },
    [handleFileUpload],
  )

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  const goHome = useCallback(() => {
    setImages([])
    setShowSettings(false)
    setHasEditedSettings(false)
    setWatermarkImage(null)
    setEditingImageId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev)
    if (!showSettings) {
      setHasEditedSettings(true)
    }
  }, [showSettings])

  const downloadSingleImage = useCallback(async (imageItem: ImageItem) => {
    if (!imageItem.canvas) return

    try {
      const blob = await canvasToBlob(imageItem.canvas)
      const filename = `watermarked-${imageItem.file.name.split(".")[0]}.png`
      await downloadBlob(blob, filename)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }, [])

  const downloadAllAsZip = useCallback(async () => {
    if (images.length === 0) return

    setIsDownloading(true)

    try {
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      const blobPromises = images.map(async (imageItem) => {
        if (!imageItem.canvas) return

        const blob = await canvasToBlob(imageItem.canvas)
        const fileName = `watermarked-${imageItem.file.name.split(".")[0]}.png`
        zip.file(fileName, blob)
      })

      await Promise.all(blobPromises)

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const filename = `imagemark-watermarked-${Date.now()}.zip`
      await downloadBlob(zipBlob, filename)
    } catch (error) {
      console.error("Zip download failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }, [images])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const updateSetting = useCallback(<K extends keyof WatermarkSettings>(key: K, value: WatermarkSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))

    // If updating position manually, clear the preset selection
    if (key === "positionX" || key === "positionY") {
      setSettings((prev) => ({ ...prev, positionPreset: "custom" }))
    }
  }, [])

  const handlePositionPresetSelect = useCallback((preset: PositionPreset) => {
    setSettings((prev) => ({
      ...prev,
      positionX: preset.x,
      positionY: preset.y,
      positionPreset: preset.id,
    }))
  }, [])

  const handleWatermarkImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      createImageFromFile(file)
        .then(setWatermarkImage)
        .catch((error) => console.error("Failed to load watermark image:", error))
    }
  }, [])

  const openFullscreen = useCallback((canvas: HTMLCanvasElement) => {
    const dataUrl = canvas.toDataURL("image/png")
    setFullscreenImage(dataUrl)
  }, [])

  const closeFullscreen = useCallback(() => {
    setFullscreenImage(null)
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && fullscreenImage) {
        closeFullscreen()
      }
      if (event.key === "Escape" && editingImageId) {
        setEditingImageId(null)
      }
    },
    [fullscreenImage, editingImageId, closeFullscreen],
  )

  useEffect(() => {
    if (fullscreenImage || editingImageId) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    } else {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [fullscreenImage, editingImageId, handleKeyDown])

  const handleImageSettingsSave = useCallback(
    (imageId: string, newSettings: WatermarkSettings) => {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                customSettings: JSON.stringify(newSettings) === JSON.stringify(settings) ? undefined : newSettings,
              }
            : img,
        ),
      )

      // Immediately update the canvas for this specific image
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === imageId) {
            const canvas = document.createElement("canvas")
            const effectiveSettings = JSON.stringify(newSettings) === JSON.stringify(settings) ? undefined : newSettings
            drawWatermarkOnCanvas(img.image, canvas, effectiveSettings)
            return { ...img, canvas }
          }
          return img
        }),
      )
    },
    [settings, drawWatermarkOnCanvas],
  )

  const editingImage = useMemo(() => {
    return editingImageId ? images.find((img) => img.id === editingImageId) : null
  }, [editingImageId, images])

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Results view - after images are uploaded
  if (images.length > 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between">
            <button
              onClick={goHome}
              className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity"
              title="Go to home page"
            >
              <ImageMarkLogo className="w-6 h-6 sm:w-8 sm:h-8" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">ImageMark</h1>
            </button>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-gray-300 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                title="Add more images"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add More</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSettings}
                className="border-gray-300 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                title="Edit watermark settings"
              >
                <Settings className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{showSettings ? "Hide" : "Edit"}</span>
              </Button>
              <Button
                onClick={downloadAllAsZip}
                disabled={isDownloading || images.length === 0}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs sm:text-sm px-3 sm:px-6 h-8 sm:h-9"
                title="Download all images as zip"
              >
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{isDownloading ? "Creating..." : "Download All"}</span>
                <span className="sm:hidden">{isDownloading ? "..." : "ZIP"}</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
          {/* Watermark Notice */}
          {!showSettings && !hasEditedSettings && (
            <div className="mb-4 sm:mb-6 bg-teal-50 border border-teal-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Settings className="w-5 h-5 text-teal-600 mt-0.5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">Watermark applied!</span>{" "}
                    <button onClick={toggleSettings} className="underline hover:no-underline font-medium">
                      Click Edit
                    </button>{" "}
                    to customize your watermark text, position, and style.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <div className="mb-4 sm:mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Global Watermark Settings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                  {/* Type Selection */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Watermark Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={settings.type === "text" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting("type", "text")}
                        className={`h-10 font-medium transition-all ${
                          settings.type === "text"
                            ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                            : "border-gray-300 hover:border-teal-400 hover:text-teal-600"
                        }`}
                      >
                        Text
                      </Button>
                      <Button
                        variant={settings.type === "image" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting("type", "image")}
                        className={`h-10 font-medium transition-all ${
                          settings.type === "image"
                            ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                            : "border-gray-300 hover:border-teal-400 hover:text-teal-600"
                        }`}
                      >
                        Image
                      </Button>
                    </div>
                  </div>

                  {/* Text Settings */}
                  {settings.type === "text" && (
                    <>
                      <div className="sm:col-span-2 lg:col-span-1">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Watermark Text</Label>
                        <Input
                          value={settings.text}
                          onChange={(e) => updateSetting("text", e.target.value)}
                          placeholder="Enter your watermark text"
                          className="text-sm focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-1">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Font Family</Label>
                        <select
                          value={settings.font}
                          onChange={(e) => updateSetting("font", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white"
                        >
                          {FONT_OPTIONS.map((font) => (
                            <option key={font.name} value={font.name} style={{ fontFamily: font.family }}>
                              {font.name} ({font.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-2">
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">Text Color</Label>
                        <div className="space-y-4">
                          {/* Color Mode Buttons */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Button
                              variant={settings.fontMode === "light" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateSetting("fontMode", "light")}
                              className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                                settings.fontMode === "light"
                                  ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                                  : "border-gray-300 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                              }`}
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 bg-gray-300 rounded-full border border-gray-400" />
                                <span>Light</span>
                              </div>
                            </Button>
                            <Button
                              variant={settings.fontMode === "dark" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateSetting("fontMode", "dark")}
                              className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                                settings.fontMode === "dark"
                                  ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                                  : "border-gray-300 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                              }`}
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 bg-gray-700 rounded-full border border-gray-600" />
                                <span>Dark</span>
                              </div>
                            </Button>
                            <Button
                              variant={settings.fontMode === "custom" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateSetting("fontMode", "custom")}
                              className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                                settings.fontMode === "custom"
                                  ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                                  : "border-gray-300 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                              }`}
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <div
                                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: settings.customColor }}
                                />
                                <span>Custom</span>
                              </div>
                            </Button>
                          </div>

                          {/* Custom Color Picker */}
                          {settings.fontMode === "custom" && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <ColorPicker
                                color={settings.customColor}
                                onChange={(color) => updateSetting("customColor", color)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Image Settings */}
                  {settings.type === "image" && (
                    <>
                      <div className="sm:col-span-2 lg:col-span-1">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Upload Logo</Label>
                        <Input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={handleWatermarkImageUpload}
                          className="text-sm focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                          <span>Size</span>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={settings.imageSize}
                              onChange={(e) => {
                                const value = Math.max(5, Math.min(50, Number(e.target.value) || 5))
                                updateSetting("imageSize", value)
                              }}
                              className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                              min={5}
                              max={50}
                            />
                            <span className="text-xs text-gray-500">%</span>
                          </div>
                        </Label>
                        <Slider
                          value={[settings.imageSize]}
                          onValueChange={(value) => updateSetting("imageSize", value[0])}
                          min={5}
                          max={50}
                          step={1}
                          className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                        />
                      </div>
                    </>
                  )}

                  {/* Position Presets - Common for both text and image */}
                  <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Position Presets</Label>
                    <PositionGrid
                      selectedPreset={settings.positionPreset}
                      onSelectPreset={handlePositionPresetSelect}
                    />
                  </div>

                  {/* Advanced Settings */}
                  <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-600 p-0 hover:text-teal-600 mt-4">
                          Advanced Settings
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                              <span>Size</span>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={settings.fontSize}
                                  onChange={(e) => {
                                    const value = Math.max(5, Math.min(30, Number(e.target.value) || 5))
                                    updateSetting("fontSize", value)
                                  }}
                                  className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                  min={5}
                                  max={30}
                                />
                                <span className="text-xs text-gray-500">%</span>
                              </div>
                            </Label>
                            <Slider
                              value={[settings.fontSize]}
                              onValueChange={(value) => updateSetting("fontSize", value[0])}
                              min={5}
                              max={30}
                              step={1}
                              className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                              <span>Rotation</span>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={settings.rotation}
                                  onChange={(e) => {
                                    const value = Math.max(-180, Math.min(180, Number(e.target.value) || 0))
                                    updateSetting("rotation", value)
                                  }}
                                  className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                  min={-180}
                                  max={180}
                                />
                                <span className="text-xs text-gray-500">°</span>
                              </div>
                            </Label>
                            <Slider
                              value={[settings.rotation]}
                              onValueChange={(value) => updateSetting("rotation", value[0])}
                              min={-180}
                              max={180}
                              step={5}
                              className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                              <span>Opacity</span>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={settings.opacity}
                                  onChange={(e) => {
                                    const value = Math.max(1, Math.min(100, Number(e.target.value) || 1))
                                    updateSetting("opacity", value)
                                  }}
                                  className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                  min={1}
                                  max={100}
                                />
                                <span className="text-xs text-gray-500">%</span>
                              </div>
                            </Label>
                            <Slider
                              value={[settings.opacity]}
                              onValueChange={(value) => updateSetting("opacity", value[0])}
                              min={1}
                              max={100}
                              step={1}
                              className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                              <span>Position X</span>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={settings.positionX}
                                  onChange={(e) => {
                                    const value = Math.max(0, Math.min(100, Number(e.target.value) || 0))
                                    updateSetting("positionX", value)
                                  }}
                                  className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                  min={0}
                                  max={100}
                                />
                                <span className="text-xs text-gray-500">%</span>
                              </div>
                            </Label>
                            <Slider
                              value={[settings.positionX]}
                              onValueChange={(value) => updateSetting("positionX", value[0])}
                              min={0}
                              max={100}
                              step={1}
                              className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                              <span>Position Y</span>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={settings.positionY}
                                  onChange={(e) => {
                                    const value = Math.max(0, Math.min(100, Number(e.target.value) || 0))
                                    updateSetting("positionY", value)
                                  }}
                                  className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                  min={0}
                                  max={100}
                                />
                                <span className="text-xs text-gray-500">%</span>
                              </div>
                            </Label>
                            <Slider
                              value={[settings.positionY]}
                              onValueChange={(value) => updateSetting("positionY", value[0])}
                              min={0}
                              max={100}
                              step={1}
                              className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={resetSettings}
                          variant="outline"
                          size="sm"
                          className="mt-4 text-gray-600 border-gray-300 hover:border-teal-300 hover:text-teal-600"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Images Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {images.map((imageItem) => (
              <div key={imageItem.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(imageItem.id)}
                  className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white w-6 h-6 sm:w-8 sm:h-8 p-0"
                  title="Remove image"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>

                {/* Custom Settings Indicator */}
                {imageItem.customSettings && (
                  <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10 bg-teal-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    <span className="text-xs font-bold">•</span>
                  </div>
                )}

                {imageItem.canvas && (
                  <canvas
                    ref={(canvas) => {
                      if (canvas && imageItem.canvas && imageItem.canvas.width > 0 && imageItem.canvas.height > 0) {
                        const ctx = canvas.getContext("2d")
                        if (ctx) {
                          canvas.width = imageItem.canvas.width
                          canvas.height = imageItem.canvas.height
                          ctx.drawImage(imageItem.canvas, 0, 0)
                        }
                      }
                    }}
                    onClick={() => imageItem.canvas && openFullscreen(imageItem.canvas)}
                    className="w-full h-auto rounded-lg shadow-sm max-h-48 sm:max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    title="Click to view fullscreen"
                  />
                )}

                <div className="mt-2 sm:mt-3 flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600 truncate flex-1 mr-2" title={imageItem.file.name}>
                    {imageItem.file.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingImageId(imageItem.id)}
                      className="text-xs border-gray-300 hover:border-teal-300 hover:text-teal-600 px-2 sm:px-3 h-7 sm:h-8"
                      title="Customize watermark for this image"
                    >
                      <Edit3 className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadSingleImage(imageItem)}
                      className="text-xs border-gray-300 hover:border-teal-300 hover:text-teal-600 px-2 sm:px-3 h-7 sm:h-8"
                      title="Download this image"
                    >
                      <Download className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Individual Image Settings Modal */}
          {editingImage && (
            <ImageSettingsModal
              imageItem={editingImage}
              globalSettings={settings}
              watermarkImage={watermarkImage}
              onClose={() => setEditingImageId(null)}
              onSave={(newSettings) => handleImageSettingsSave(editingImage.id, newSettings)}
            />
          )}

          {/* Fullscreen Modal */}
          {fullscreenImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
              onClick={closeFullscreen}
            >
              <div className="relative max-w-full max-h-full">
                <button
                  onClick={closeFullscreen}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
                  title="Close fullscreen"
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={fullscreenImage || "/placeholder.svg"}
                  alt="Fullscreen preview"
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES.join(",")}
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        <canvas ref={analysisCanvasRef} style={{ display: "none" }} />
      </div>
    )
  }

  // Landing page - before image upload
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <ImageMarkLogo className="w-8 h-8" />
            <h1 className="text-xl font-semibold text-gray-900">ImageMark</h1>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Add Watermarks <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-semibold">Free</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Protect your images with custom watermarks. Fast, secure, and completely free.
          </p>
        </div>

        {/* Upload area */}
        <div className="mb-16">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 cursor-pointer ${
              dragActive
                ? "border-teal-400 bg-teal-50"
                : isProcessing
                  ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                  : "border-gray-300 hover:border-teal-400 hover:bg-teal-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES.join(",")}
              multiple
              onChange={handleInputChange}
              className="hidden"
              disabled={isProcessing}
            />

            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Processing your images...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-teal-600" />
                </div>
                <Button
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg font-semibold mb-4"
                >
                  Choose Images
                </Button>
                <p className="text-gray-500">
                  or drag and drop • JPG, PNG, GIF, WebP, BMP, TIFF, SVG • Multiple files supported
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600 text-sm">Process multiple images in seconds</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">100% Private</h3>
            <p className="text-gray-600 text-sm">Images never leave your browser</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Always Free</h3>
            <p className="text-gray-600 text-sm">No limits, no subscriptions</p>
          </div>
        </div>
      </main>

      <canvas ref={analysisCanvasRef} style={{ display: "none" }} />
    </div>
  )
}
