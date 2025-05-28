"use client"

import React, { useRef, useEffect } from "react"
import { X, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import type { VideoItem } from "@/types/video"

interface VideoPreviewModalProps {
  video: VideoItem
  onClose: () => void
  onDownload: (id: string) => void
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({ video, onClose, onDownload }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "auto"
    }
  }, [onClose])

  if (!video.outputUrl) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium text-lg text-gray-800 truncate" title={video.name}>
            {video.name}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 bg-black min-h-[300px] overflow-hidden">
          <video
            ref={videoRef}
            src={video.outputUrl}
            className="w-full h-full"
            controls
            autoPlay
            controlsList="nodownload"
          />
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <Button
            onClick={() => onDownload(video.id)}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Video
          </Button>
        </div>
      </div>
    </div>
  )
}
