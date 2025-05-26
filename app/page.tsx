"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Download, Settings, ChevronDown, RotateCcw, X, Plus, Upload, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Types
interface WatermarkSettings {
  type: "text" | "image"
  text: string
  fontSize: number
  fontMode: "light" | "dark"
  opacity: number
  rotation: number
  positionX: number
  positionY: number
  imageSize: number
}

interface ImageItem {
  id: string
  image: HTMLImageElement
  file: File
  canvas?: HTMLCanvasElement
}

// Constants
const DEFAULT_SETTINGS: WatermarkSettings = {
  type: "text",
  text: "Enter text",
  fontSize: 14,
  fontMode: "light",
  opacity: 10,
  rotation: -45,
  positionX: 50,
  positionY: 50,
  imageSize: 25,
}

const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png"]
const ANALYSIS_SIZE = 100

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

const useWatermarkCanvas = (settings: WatermarkSettings, watermarkImage: HTMLImageElement | null) => {
  const drawWatermarkOnCanvas = useCallback(
    (image: HTMLImageElement, canvas: HTMLCanvasElement) => {
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
          ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
          ctx.fillStyle = settings.fontMode === "light" ? "#D1D5DB" : "#374151"
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
    [settings, watermarkImage],
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
        drawWatermarkOnCanvas(imageItem.image, canvas)
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
    },
    [fullscreenImage, closeFullscreen],
  )

  useEffect(() => {
    if (fullscreenImage) {
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
  }, [fullscreenImage, handleKeyDown])

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
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Watermark Settings</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {/* Type Selection */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={settings.type === "text" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting("type", "text")}
                        className={`h-9 ${settings.type === "text" ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                      >
                        Text
                      </Button>
                      <Button
                        variant={settings.type === "image" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting("type", "image")}
                        className={`h-9 ${settings.type === "image" ? "bg-teal-600 hover:bg-teal-700" : ""}`}
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

                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Size: {settings.fontSize}%
                        </Label>
                        <Slider
                          value={[settings.fontSize]}
                          onValueChange={(value) => updateSetting("fontSize", value[0])}
                          min={5}
                          max={30}
                          step={1}
                          className="[&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-teal-600"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Color</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={settings.fontMode === "light" ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateSetting("fontMode", "light")}
                            className={`h-8 text-xs ${settings.fontMode === "light" ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                          >
                            Light
                          </Button>
                          <Button
                            variant={settings.fontMode === "dark" ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateSetting("fontMode", "dark")}
                            className={`h-8 text-xs ${settings.fontMode === "dark" ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                          >
                            Dark
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Rotation: {settings.rotation}°
                        </Label>
                        <Slider
                          value={[settings.rotation]}
                          onValueChange={(value) => updateSetting("rotation", value[0])}
                          min={-180}
                          max={180}
                          step={5}
                          className="[&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-teal-600"
                        />
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

                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Size: {settings.imageSize}%
                        </Label>
                        <Slider
                          value={[settings.imageSize]}
                          onValueChange={(value) => updateSetting("imageSize", value[0])}
                          min={5}
                          max={50}
                          step={1}
                          className="[&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-teal-600"
                        />
                      </div>
                    </>
                  )}

                  {/* Advanced Settings */}
                  <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-600 p-0 hover:text-teal-600">
                          Advanced Settings
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Opacity: {settings.opacity}%
                            </Label>
                            <Slider
                              value={[settings.opacity]}
                              onValueChange={(value) => updateSetting("opacity", value[0])}
                              min={1}
                              max={100}
                              step={1}
                              className="[&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-teal-600"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Position X: {settings.positionX}%
                            </Label>
                            <Slider
                              value={[settings.positionX]}
                              onValueChange={(value) => updateSetting("positionX", value[0])}
                              min={0}
                              max={100}
                              step={1}
                              className="[&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-teal-600"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Position Y: {settings.positionY}%
                            </Label>
                            <Slider
                              value={[settings.positionY]}
                              onValueChange={(value) => updateSetting("positionY", value[0])}
                              min={0}
                              max={100}
                              step={1}
                              className="[&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-teal-600"
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

                {imageItem.canvas && (
                  <canvas
                    ref={(canvas) => {
                      if (canvas && imageItem.canvas) {
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
            ))}
          </div>

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
                <p className="text-gray-500">or drag and drop • JPG, PNG • Multiple files supported</p>
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
