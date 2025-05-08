"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, RefreshCw, Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingOverlay } from "@/components/ui/loading-overlay"

export default function ScanBillPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setCameraActive(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast.error("Could not access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageDataUrl = canvas.toDataURL("image/png")
        setCapturedImage(imageDataUrl)
        stopCamera()
      }
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const processImage = async () => {
    setProcessing(true)

    try {
      // In a real app, you would send the image to your backend for processing
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success("Bill processed successfully")
      router.push("/scan-bill/form")
    } catch (error) {
      console.error("Error processing image:", error)
      toast.error("Failed to process image. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scan Bill</h1>
        <p className="text-muted-foreground">Take a photo of your bill to automatically extract information</p>
      </div>

      <Card className="overflow-hidden max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Bill Scanner</CardTitle>
          <CardDescription>Position the bill clearly in the frame and take a photo</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative aspect-[4/3] w-full bg-muted">
            {!capturedImage && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`}
              />
            )}

            {capturedImage && (
              <img
                src={capturedImage || "/placeholder.svg"}
                alt="Captured bill"
                className="h-full w-full object-contain"
              />
            )}

            {!cameraActive && !capturedImage && (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <Camera className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-center text-muted-foreground">
                  Camera is not active. Click the button below to start.
                </p>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex justify-center gap-4 p-4">
            {!cameraActive && !capturedImage && (
              <Button onClick={startCamera} className="gap-2">
                <Camera className="h-4 w-4" />
                Start Camera
              </Button>
            )}

            {cameraActive && !capturedImage && (
              <Button onClick={captureImage} variant="default" className="gap-2">
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>
            )}

            {capturedImage && (
              <>
                <Button onClick={retakePhoto} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retake
                </Button>
                <Button onClick={processImage} disabled={processing} className="gap-2">
                  {processing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload & Process
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm max-w-2xl mx-auto">
        <h3 className="mb-2 font-medium">Tips for best results:</h3>
        <ul className="ml-6 list-disc text-sm text-muted-foreground">
          <li>Ensure good lighting</li>
          <li>Place the bill on a flat surface</li>
          <li>Make sure all text is clearly visible</li>
          <li>Avoid shadows and glare</li>
        </ul>
      </div>
      <LoadingOverlay isLoading={processing} text="Processing image..." />
    </div>
  )
}