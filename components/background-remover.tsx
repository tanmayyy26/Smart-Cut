// React component for background removal UI and logic
"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Upload, Download, Loader2, ImageIcon, Sparkles, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ProcessingState = "idle" | "uploading" | "processing" | "complete" | "error"

export function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [processingState, setProcessingState] = useState<ProcessingState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height
          
          // Increased max size for better quality
          const maxSize = 2048
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width)
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height)
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            reject(new Error("Failed to compress image"))
            return
          }
          
          ctx.drawImage(img, 0, 0, width, height)
          // Use PNG format with high quality for background removal
          resolve(canvas.toDataURL("image/png"))
        }
        img.onerror = () => reject(new Error("Failed to load image"))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    if (file.size > 200 * 1024 * 1024) {
      setError("File size must be less than 200MB")
      return
    }

    setError(null)
    setProcessedImage(null)
    setProcessingState("uploading")

    compressImage(file)
      .then((compressedImage) => {
        setOriginalImage(compressedImage)
        setProcessingState("idle")
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to process image")
        setProcessingState("idle")
      })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect],
  )

  const removeBackground = async () => {
    if (!originalImage) return

    setProcessingState("processing")
    setError(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    try {
      const response = await fetch(originalImage, { signal: controller.signal })
      const blob = await response.blob()

      const formData = new FormData()
      formData.append("image", blob, "image.png")
      formData.append("quality", "full")

      const result = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!result.ok) {
        let errorMessage = "Failed to remove background"
        try {
          const contentType = result.headers.get("content-type")
          if (contentType?.includes("application/json")) {
            const errorData = await result.json()
            errorMessage = errorData.error || errorMessage
          } else {
            errorMessage = `Server error: ${result.statusText}`
          }
        } catch {
          errorMessage = `Server error: ${result.statusText}`
        }
        throw new Error(errorMessage)
      }

      const processedBlob = await result.blob()
      const processedUrl = URL.createObjectURL(processedBlob)
      setProcessedImage(processedUrl)
      setProcessingState("complete")
    } catch (err) {
      clearTimeout(timeoutId)
      
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Request timed out. Please try again with a faster connection.")
        } else {
          setError(err.message)
        }
      } else {
        setError("An error occurred")
      }
      setProcessingState("error")
    }
  }

  const downloadImage = () => {
    if (!processedImage) return
    const link = document.createElement("a")
    link.href = processedImage
    link.download = "background-removed.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const reset = () => {
    setOriginalImage(null)
    setProcessedImage(null)
    setProcessingState("idle")
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-24">
      {!originalImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300",
            "bg-gradient-to-br from-[#A3C9A8]/5 to-[#C7E8C5]/5 backdrop-blur-sm w-[28rem] h-60 md:w-[40rem] md:h-72 flex flex-col justify-center items-center mx-auto",
            isDragOver
              ? "border-[#A3C9A8]/70 bg-[#A3C9A8]/10 scale-105 shadow-2xl shadow-[#A3C9A8]/40"
              : "border-[#A3C9A8]/30 hover:border-[#A3C9A8]/60 hover:bg-[#A3C9A8]/8 hover:shadow-xl hover:shadow-[#A3C9A8]/20",
          )}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#A3C9A8]/40 to-[#C7E8C5]/30 flex items-center justify-center shadow-2xl shadow-[#A3C9A8]/50 animate-pulse-glow">
              <Upload className="w-8 h-8 text-[#A3C9A8]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#A3C9A8] mb-2">Drop image here</h3>
              <p className="text-[#b0d4a8] text-sm">or click to browse • PNG, JPG, WEBP (up to 200MB)</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Original Image */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-xl border border-[#A3C9A8]/20 shadow-2xl shadow-[#A3C9A8]/10">
              <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-gradient-to-r from-[#A3C9A8]/80 to-[#C7E8C5]/80 backdrop-blur text-xs font-bold text-[#0a0a0a] uppercase tracking-wider">
                Original
              </div>
              <button
                onClick={reset}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-[#A3C9A8]/20 backdrop-blur hover:bg-[#A3C9A8]/40 transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5 text-[#A3C9A8]" />
              </button>
              <div className="aspect-square p-6 flex items-center justify-center">
                <img
                  src={originalImage || "/placeholder.svg"}
                  alt="Original"
                  className="max-w-full max-h-full object-contain rounded-2xl"
                  crossOrigin="anonymous"
                />
              </div>
            </div>

            {/* Processed Image */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-xl border border-[#A3C9A8]/20 shadow-2xl shadow-[#A3C9A8]/10">
              <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-gradient-to-r from-[#A3C9A8]/80 to-[#C7E8C5]/80 backdrop-blur text-xs font-bold text-[#0a0a0a] uppercase tracking-wider">
                Result
              </div>
              <div
                className="aspect-square p-6 flex items-center justify-center"
                style={{
                  backgroundImage: processedImage ? "repeating-conic-gradient(#2a3a3a 0% 25%, #1a2a2a 0% 50%)" : "none",
                  backgroundSize: "20px 20px",
                }}
              >
                {processedImage ? (
                  <img
                    src={processedImage || "/placeholder.svg"}
                    alt="Processed"
                    className="max-w-full max-h-full object-contain rounded-2xl"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <ImageIcon className="w-20 h-20 opacity-20" />
                    <p className="text-sm font-medium">Result will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-5 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive text-center font-medium shadow-lg">
              ❌ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {processingState !== "complete" && (
              <Button
                onClick={removeBackground}
                disabled={processingState === "processing"}
                size="lg"
                className="w-full sm:w-auto min-w-[240px] bg-gradient-to-r from-[#A3C9A8] via-[#C7E8C5] to-[#A3C9A8] hover:shadow-2xl hover:shadow-[#A3C9A8]/50 transition-all duration-300 text-[#0a0a0a] font-bold shadow-lg border-0 text-base py-6 rounded-xl"
              >
                {processingState === "processing" ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Remove Background
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}

            {processedImage && (
              <Button onClick={downloadImage} size="lg" className="w-full sm:w-auto min-w-[240px] bg-gradient-to-r from-[#A3C9A8] via-[#C7E8C5] to-[#A3C9A8] hover:shadow-2xl hover:shadow-[#A3C9A8]/50 transition-all duration-300 text-[#0a0a0a] font-bold shadow-lg border-0 text-base py-6 rounded-xl">
                <Download className="w-5 h-5 mr-2" />
                Download PNG
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
