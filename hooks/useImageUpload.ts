"use client"

import { useCallback, useState } from "react"
import type { ImageItem } from "@/types/watermark"
import { createImageFromFile, validateFileTypes } from "@/utils/image"

export const useImageUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false)

  const processFiles = useCallback(async (files: FileList): Promise<ImageItem[]> => {
    setIsProcessing(true)

    try {
      const validFiles = validateFileTypes(files)

      if (validFiles.length === 0) {
        return []
      }

      const imagePromises = validFiles.map(async (file, index) => {
        const image = await createImageFromFile(file)
        return {
          id: `${Date.now()}-${index}`,
          image,
          file,
        }
      })

      return await Promise.all(imagePromises)
    } catch (error) {
      console.error("Error processing images:", error)
      return []
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return {
    processFiles,
    isProcessing,
  }
}
