import type { WatermarkSettings } from "@/types/watermark"
import type { VideoItem, VideoProcessingOptions } from "@/types/video"
import { generateId } from "@/utils/format"

/**
 * Creates a VideoItem from a File
 */
export const createVideoItem = async (file: File): Promise<VideoItem> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.muted = true

    video.onloadedmetadata = () => {
      // Create thumbnail
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)

        const thumbnail = canvas.toDataURL("image/jpeg", 0.7)

        resolve({
          id: generateId(),
          file,
          name: file.name,
          duration: video.duration,
          size: file.size,
          thumbnail,
          progress: 0,
          status: "idle",
        })
      } else {
        resolve({
          id: generateId(),
          file,
          name: file.name,
          duration: 0,
          size: file.size,
          progress: 0,
          status: "idle",
        })
      }

      URL.revokeObjectURL(video.src)
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error(`Failed to load video: ${file.name}`))
    }

    video.src = URL.createObjectURL(file)
  })
}

/**
 * Processes a video with watermark settings
 */
export const processVideo = async (
  video: VideoItem,
  settings: WatermarkSettings,
  options: VideoProcessingOptions,
  onProgress?: (progress: number) => void,
): Promise<string> => {
  // Simulate video processing
  return new Promise((resolve, reject) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress > 100) progress = 100

      if (onProgress) {
        onProgress(Math.floor(progress))
      }

      if (progress >= 100) {
        clearInterval(interval)
        // Create a blob URL for the processed video (simulation)
        const outputUrl = URL.createObjectURL(video.file)
        resolve(outputUrl)
      }
    }, 200)

    // Simulate potential errors
    setTimeout(() => {
      if (Math.random() < 0.1) {
        // 10% chance of error
        clearInterval(interval)
        reject(new Error("Processing failed"))
      }
    }, 1000)
  })
}

/**
 * Creates a video from file with watermark processing
 * This applies watermarks to the video using canvas processing
 */
export const createVideoFromFile = async (
  file: File,
  settings?: WatermarkSettings,
  watermarkImage?: HTMLImageElement | null,
): Promise<Blob> => {
  try {
    // Validate that the file is actually a video
    if (!file.type.startsWith("video/")) {
      throw new Error("Invalid file type: not a video file")
    }

    // If no settings provided, return original file
    if (!settings) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new Blob([file], { type: "video/mp4" }))
        }, 1000)
      })
    }

    // Apply watermark processing
    return await processVideoWithWatermark(file, settings, watermarkImage)
  } catch (error) {
    console.error("Error in createVideoFromFile:", error)
    // Fallback to original file
    return new Blob([file], { type: "video/mp4" })
  }
}

/**
 * Applies watermark to video using canvas and MediaRecorder API
 * This is a simplified implementation for demonstration
 */
export const processVideoWithWatermark = async (
  videoFile: File,
  settings: WatermarkSettings,
  watermarkImage?: HTMLImageElement | null,
  onProgress?: (progress: number) => void,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    // Create object URL for the video
    const videoUrl = URL.createObjectURL(videoFile)
    video.src = videoUrl
    video.muted = true
    video.playsInline = true
    video.crossOrigin = "anonymous"

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480

      // Check if we need to apply watermark
      const hasTextWatermark = settings.type === "text" && settings.text.trim()
      const hasImageWatermark = settings.type === "image" && watermarkImage

      if (!hasTextWatermark && !hasImageWatermark) {
        // No watermark needed, return original file
        URL.revokeObjectURL(videoUrl)
        resolve(new Blob([videoFile], { type: "video/mp4" }))
        return
      }

      // Set up MediaRecorder for output
      const stream = canvas.captureStream(30) // 30 FPS

      // Try different codec options
      let mimeType = "video/webm;codecs=vp9"
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm;codecs=vp8"
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm"
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/mp4" })
        URL.revokeObjectURL(videoUrl)
        resolve(blob)
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        URL.revokeObjectURL(videoUrl)
        reject(new Error("Recording failed"))
      }

      // Start recording
      mediaRecorder.start(100) // Record in 100ms chunks

      let frameCount = 0
      const maxFrames = Math.floor(video.duration * 30) // Estimate total frames

      // Process video frame by frame
      const processFrame = () => {
        if (video.ended || video.paused) {
          mediaRecorder.stop()
          return
        }

        try {
          // Draw video frame
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          // Apply watermark
          if (hasTextWatermark) {
            drawTextWatermark(ctx, canvas, settings)
          } else if (hasImageWatermark && watermarkImage) {
            drawImageWatermark(ctx, canvas, settings, watermarkImage)
          }

          // Report progress
          if (onProgress && maxFrames > 0) {
            const progress = (frameCount / maxFrames) * 100
            onProgress(Math.min(progress, 100))
          }

          frameCount++
          requestAnimationFrame(processFrame)
        } catch (error) {
          console.error("Frame processing error:", error)
          mediaRecorder.stop()
        }
      }

      video.onplay = () => {
        processFrame()
      }

      video.onended = () => {
        mediaRecorder.stop()
      }

      // Start playback
      video.currentTime = 0
      video.play().catch((error) => {
        console.error("Video play error:", error)
        reject(error)
      })
    }

    video.onerror = (error) => {
      console.error("Video loading error:", error)
      URL.revokeObjectURL(videoUrl)
      reject(new Error("Error loading video"))
    }
  })
}

/**
 * Draws text watermark on canvas
 */
const drawTextWatermark = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, settings: WatermarkSettings) => {
  ctx.save()
  ctx.globalAlpha = settings.opacity / 100

  const fontSize = (settings.fontSize / 100) * canvas.width
  ctx.font = `bold ${fontSize}px ${settings.font}`

  // Set color based on font mode
  switch (settings.fontMode) {
    case "light":
      ctx.fillStyle = "#D1D5DB"
      break
    case "dark":
      ctx.fillStyle = "#374151"
      break
    default:
      ctx.fillStyle = settings.customColor
  }

  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const x = (settings.positionX / 100) * canvas.width
  const y = (settings.positionY / 100) * canvas.height

  ctx.translate(x, y)
  ctx.rotate((settings.rotation * Math.PI) / 180)
  ctx.fillText(settings.text, 0, 0)
  ctx.restore()
}

/**
 * Draws image watermark on canvas
 */
const drawImageWatermark = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  settings: WatermarkSettings,
  watermarkImage: HTMLImageElement,
) => {
  ctx.save()

  // Apply opacity setting
  ctx.globalAlpha = settings.opacity / 100

  // Calculate watermark size based on imageSize setting
  const watermarkWidth = (settings.imageSize / 100) * canvas.width
  const aspectRatio = watermarkImage.height / watermarkImage.width
  const watermarkHeight = watermarkWidth * aspectRatio

  // Calculate position
  const x = (settings.positionX / 100) * canvas.width - watermarkWidth / 2
  const y = (settings.positionY / 100) * canvas.height - watermarkHeight / 2

  // Apply rotation if needed
  if (settings.rotation !== 0) {
    const centerX = (settings.positionX / 100) * canvas.width
    const centerY = (settings.positionY / 100) * canvas.height
    ctx.translate(centerX, centerY)
    ctx.rotate((settings.rotation * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)
  }

  // Draw the watermark image
  ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight)

  ctx.restore()
}
