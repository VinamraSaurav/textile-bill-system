"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, RefreshCw, Upload, FileUp } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ScanBillPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("camera")

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
      console.warn("Error accessing camera:", error)
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const resetUpload = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const processImage = async (imageSource: "camera" | "upload") => {
    setProcessing(true)
    try {
      const imageToProcess = imageSource === "camera" ? capturedImage : uploadedImage
  
      if (!imageToProcess) {
        toast.error("No image to process.")
        return
      }
  
      const response = await fetch("/api/bill/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ billImage: imageToProcess }),
      })
  
      if (!response.ok) {
        throw new Error("Server error")
      }
  
      const result = await response.json()
      
  
      if (!result.success) {
        toast.error("Failed to extract data from the bill.")
        return
      }
  
      // Save the data to local storage or state management
      console.log("Extracted data:", result)
      localStorage.setItem("billData", JSON.stringify(result.data))
  
      toast.success("Bill processed successfully")
      router.push("/scan-bill/form")
    } catch (error) {
      console.error("Error processing image:", error)
      toast.error("Failed to process image. Please try again.")
    } finally {
      setProcessing(false)
    }
  }
  

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    // Stop camera when switching to upload tab
    if (value === "upload" && cameraActive) {
      stopCamera()
    }
    
    // Reset images when switching tabs
    setCapturedImage(null)
    setUploadedImage(null)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scan Bill</h1>
        <p className="text-muted-foreground">Take a photo or upload an image of your bill to automatically extract information</p>
      </div>

      <Card className="overflow-hidden max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Bill Scanner</CardTitle>
          <CardDescription>Choose how you want to provide your bill</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="camera" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 mx-4 my-2">
              <TabsTrigger value="camera">Camera</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="camera" className="mt-0">
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
                    src={capturedImage}
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
                    <Button onClick={() => processImage("camera")} disabled={processing} className="gap-2">
                      {processing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Process
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="mt-0">
              <div className="relative aspect-[4/3] w-full bg-muted">
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Uploaded bill"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-6">
                    <FileUp className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-center text-muted-foreground mb-4">
                      Upload an image of your bill
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="bill-upload"
                    />
                    <label htmlFor="bill-upload">
                      <Button variant="outline" className="gap-2" asChild>
                        <span>
                          <FileUp className="h-4 w-4" />
                          Browse Files...
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4 p-4">
                {uploadedImage && (
                  <>
                    <Button onClick={resetUpload} variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Choose Another
                    </Button>
                    <Button onClick={() => processImage("upload")} disabled={processing} className="gap-2">
                      {processing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Process
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm max-w-2xl mx-auto">
        <h3 className="mb-2 font-medium">Tips for best results:</h3>
        <ul className="ml-6 list-disc text-sm text-muted-foreground">
          <li>Ensure good lighting</li>
          <li>Place the bill on a flat surface</li>
          <li>Make sure all text is clearly visible</li>
          <li>Avoid shadows and glare</li>
          <li>For uploaded files, ensure image is clear and not blurry</li>
        </ul>
      </div>
      <LoadingOverlay isLoading={processing} text="Processing image..." />
    </div>
  )
}