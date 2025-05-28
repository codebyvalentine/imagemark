import type React from "react"
export interface WatermarkSettings {
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

export interface ImageItem {
  id: string
  image: HTMLImageElement
  file: File
  canvas?: HTMLCanvasElement
  customSettings?: WatermarkSettings
}

export interface VideoItem {
  id: string
  file: File
  canvas?: Promise<Blob>
  customSettings?: WatermarkSettings
}

export interface PositionPreset {
  id: string
  name: string
  x: number
  y: number
  icon: React.ReactNode
}

export interface FontOption {
  name: string
  family: string
  category: string
}

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm", 
  "video/quicktime",
  "video/x-msvideo"
] as const
