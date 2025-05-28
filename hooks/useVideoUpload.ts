"use client"

import { useCallback, useState } from "react"
import type { VideoItem } from "@/types/watermark"
import { ACCEPTED_VIDEO_TYPES } from "@/constants/watermark"

export const useVideoUpload = () => {
  const [isProcessingVideos, setIsProcessingVideos] = useState(false)

  const processVideos = useCallback(async (files: FileList | File[]): Promise<VideoItem[]> => {
    setIsProcessingVideos(true)

    try {
      const fileArray = Array.from(files)
      const validFiles = fileArray.filter((file) => {
        // Check if file type is supported
        const isValidType = ACCEPTED_VIDEO_TYPES.includes(file.type as any)
        // Check if file is actually a video
        const isVideo = file.type.startsWith('video/')
        return isValidType && isVideo
      })

      if (validFiles.length === 0) {
        console.warn('No valid video files found')
        return []
      }

      const videoPromises = validFiles.map(async (file, index) => {
        try {
          return {
            id: `video-${Date.now()}-${index}`,
            file,
          }
        } catch (error) {
          console.error(`Error processing video file ${file.name}:`, error)
          return null
        }
      })

      const results = await Promise.all(videoPromises)
      return results.filter((item): item is VideoItem => item !== null)
    } catch (error) {
      console.error("Error processing videos:", error)
      return []
    } finally {
      setIsProcessingVideos(false)
    }
  }, [])

  return {
    processVideos,
    isProcessingVideos,
  }
}
