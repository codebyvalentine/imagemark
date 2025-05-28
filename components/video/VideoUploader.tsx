"use client"

import React, { useState, useRef, useCallback } from "react"
import { Upload, X, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { ACCEPTED_VIDEO_TYPES, VIDEO_EXTENSIONS } from "@/types/video"
import { formatFileSize } from "@/utils/format"

interface VideoUploaderProps {
  onVideosSelected: (files: File[]) => void
  isProcessing: boolean
  maxFileSize?: number // in bytes
  maxFiles?: number
  className?: string
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onVideosSelected,
  isProcessing,
  maxFileSize = 500 * 1024 * 1024, // 500MB default
  maxFiles = 5,
  className = "",
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      setError(null)

      // Check file count
      if (files.length > maxFiles) {
        setError(`You can only upload up to ${maxFiles} videos at once.`)
        return files.slice(0, maxFiles)
      }

      // Filter by file type and size
      const validFiles = files.filter((file) => {
        // Check file type
        if (!ACCEPTED_VIDEO_TYPES.includes(file.type as any)) {
          setError(`Only ${VIDEO_EXTENSIONS.join(", ")} video formats are supported.`)
          return false
        }

        // Check file size
        if (file.size > maxFileSize) {
          const maxSizeFormatted = formatFileSize(maxFileSize)
          setError(`File size exceeds the maximum limit of ${maxSizeFormatted}.`)
          return false
        }

        return true
      })

      return validFiles
    },
    [maxFileSize, maxFiles]
  )

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        const filesArray = Array.from(event.target.files)
        const validFiles = validateFiles(filesArray)
        
        if (validFiles.length > 0) {
          onVideosSelected(validFiles)
        }
        
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    },
    [onVideosSelected, validateFiles]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const filesArray = Array.from(e.dataTransfer.files)
        const validFiles = validateFiles(filesArray)
        
        if (validFiles.length > 0) {
          onVideosSelected(validFiles)
        }
      }
    },
    [onVideosSelected, validateFiles]
  )

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 transition-all duration-200 ${
          dragActive
            ? "border-teal-400 bg-teal-50"
            : isProcessing
            ? "border-gray-300 bg-gray-50 cursor-not-allowed"
            : "border-gray-300 hover:border-teal-400 hover:bg-teal-50 cursor-pointer"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={isProcessing ? undefined : handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_VIDEO_TYPES.join(",")}
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-gray-600">Processing your videos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-teal-600" />
            </div>
            <Button
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg font-semibold mb-4"
            >
              Choose Videos
            </Button>
            <p className="text-gray-500">
              or drag and drop • MP4, WebM, MOV, AVI, MKV • Up to {formatFileSize(maxFileSize)}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
