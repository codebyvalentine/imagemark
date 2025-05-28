"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Film, ArrowLeft, Plus, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ImageMarkLogo } from "@/components/ImageMarkLogo"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { VideoUploader } from "@/components/video/VideoUploader"
import { VideoProcessingCard } from "@/components/video/VideoProcessingCard"
import { VideoPreviewModal } from "@/components/video/VideoPreviewModal"
import { VideoWatermarkSettings } from "@/components/video/VideoWatermarkSettings"
import { DEFAULT_SETTINGS } from "@/constants/watermark"
import { createVideoItem, processVideo } from "@/utils/video"
import type { VideoItem, VideoProcessingOptions } from "@/types/video"
import type { WatermarkSettings } from "@/types/watermark"

export default function VideosPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS)
  const [processingOptions, setProcessingOptions] = useState<VideoProcessingOptions>({
    watermarkSettings: DEFAULT_SETTINGS,
    outputFormat: "mp4",
    quality: "high",
    frameRate: 30,
    resolution: {
      width: 1280,
      height: 720
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleVideosSelected = useCallback(async (files: File[]) => {
    setIsProcessing(true)
    
    try {
      const videoPromises = files.map(createVideoItem)
      const newVideos = await Promise.all(videoPromises)
      
      setVideos((prev) => [...prev, ...newVideos])
    } catch (error) {
      console.error("Error processing videos:", error)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleRemoveVideo = useCallback((id: string) => {
    setVideos((prev) => prev.filter((video) => video.id !== id))
  }, [])

  const handleDownloadVideo = useCallback((id: string) => {
    const video = videos.find((v) => v.id === id)
    if (!video || !video.outputUrl) return
    
    const link = document.createElement("a")
    link.href = video.outputUrl
    link.download = `watermarked-${video.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [videos])

  const handleProcessVideo = useCallback(async (id: string) => {
    const videoIndex = videos.findIndex((v) => v.id === id)
    if (videoIndex === -1) return
    
    const video = videos[videoIndex]
    
    // Update status to processing
    setVideos((prev) => 
      prev.map((v) => 
        v.id === id ? { ...v, status: "processing" } : v
      )
    )
    
    try {
      // Get the appropriate watermark settings
      const settings = video.customSettings || watermarkSettings
      
      // Process the video
      const outputUrl = await processVideo(
        video,
        settings,
        processingOptions,
        (progress) => {
          // Update progress
          setVideos((prev) => 
            prev.map((v) => 
              v.id === id ? { ...v, progress } : v
            )
          )
        }
      )
      
      // Update with completed status and output URL
      setVideos((prev) => 
        prev.map((v) => 
          v.id === id ? { ...v, status: "completed", outputUrl, progress: 100 } : v
        )
      )
    } catch (error) {
      console.error("Error processing video:", error)
      
      // Update with error status
      setVideos((prev) => 
        prev.map((v) => 
          v.id === id ? { ...v, status: "error", errorMessage: "Processing failed" } : v
        )
      )
    }
  }, [videos, watermarkSettings, processingOptions])

  const handleProcessAll = useCallback(() => {
    videos
      .filter((v) => v.status === "idle" || v.status === "error")
      .forEach((v) => handleProcessVideo(v.id))
  }, [videos, handleProcessVideo])

  const handleSaveSettings = useCallback((
    id: string, 
    newSettings: WatermarkSettings, 
    newOptions: VideoProcessingOptions
  ) => {
    setVideos((prev) => 
      prev.map((v) => 
        v.id === id ? { 
          ...v, 
          customSettings: JSON.stringify(newSettings) === JSON.stringify(watermarkSettings) 
            ? undefined 
            : newSettings 
        } : v
      )
    )
    
    // If this is the first video, also update the global settings
    if (videos.length === 1) {
      setWatermarkSettings(newSettings)
      setProcessingOptions(newOptions)
    }
  }, [videos, watermarkSettings])

  const previewVideo = videos.find((v) => v.id === previewVideoId)
  const editingVideo = videos.find((v) => v.id === editingVideoId)

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span>Back</span>
            </Button>
            <div className="flex items-
