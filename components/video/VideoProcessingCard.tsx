"use client"

import React, { useState } from "react"
import { Play, Download, Settings, Trash2, CheckCircle, AlertCircle, Pause } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatFileSize, formatDuration } from "@/utils/format"
import type { VideoItem } from "@/types/video"

interface VideoProcessingCardProps {
  video: VideoItem
  onRemove: (id: string) => void
  onDownload: (id: string) => void
  onSettings: (id: string) => void
  onPreview: (id: string) => void
}

export const VideoProcessingCard: React.FC<VideoProcessingCardProps> = ({
  video,
  onRemove,
  onDownload,
  onSettings,
  onPreview,
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const renderStatusIndicator = () => {
    switch (video.status) {
      case "completed":
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-1.5" />
            <span className="text-xs font-medium">Completed</span>
          </div>
        )
      case "processing":
        return (
          <div className="flex flex-col w-full space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Processing...</span>
              <span className="text-xs text-gray-500">{video.progress}%</span>
            </div>
            <Progress value={video.progress} className="h-1.5" />
          </div>
        )
      case "error":
        return (
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-4 h-4 mr-1.5" />
            <span className="text-xs font-medium">Error</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center text-gray-500">
            <Pause className="w-4 h-4 mr-1.5" />
            <span className="text-xs font-medium">Ready to process</span>
          </div>
        )
    }
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video thumbnail */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {video.thumbnail ? (
          <img
            src={video.thumbnail || "/placeholder.svg"}
            alt={video.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No preview</span>
          </div>
        )}
        
        {/* Play button overlay */}
        {video.status === "completed" && (
          <div 
            className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => onPreview(video.id)}
          >
            <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center cursor-pointer hover:bg-opacity-100 transition-all">
              <Play className="w-6 h-6 text-gray-800 ml-1" />
            </div>
          </div>
        )}
        
        {/* Video info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex justify-between items-center">
            <div className="text-white text-xs">
              {formatDuration(video.duration)}
            </div>
            <div className="text-white text-xs">
              {formatFileSize(video.size)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Video details */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-800 mb-1 truncate" title={video.name}>
          {video.name}
        </h3>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex-1">
            {renderStatusIndicator()}
          </div>
          
          <div className="flex space-x-1">
            {video.status === "completed" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload(video.id)}
                className="h-8 w-8 p-0"
                title="Download"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSettings(video.id)}
              className="h-8 w-8 p-0"
              title="Settings"
              disabled={video.status === "processing"}
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(video.id)}
              className="h-8 w-8 p-0"
              title="Remove"
              disabled={video.status === "processing"}
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
