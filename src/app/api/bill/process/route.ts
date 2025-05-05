import { NextRequest, NextResponse } from 'next/server';
import { processImageWithGemini } from '@/services/ocrService';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const billImage = formData.get('billImage') as File;
    
    if (!billImage) {
      return NextResponse.json(
        { error: 'No bill image provided' },
        { status: 400 }
      );
    }
    
    // Save uploaded file to temp directory
    const bytes = await billImage.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `${uuidv4()}-${billImage.name}`);
    
    fs.writeFileSync(tempFilePath, buffer);
    
    // Process the image directly with Gemini Vision instead of Tesseract OCR
    const result = await processImageWithGemini(tempFilePath);
    
    return NextResponse.json({
      success: true,
      status: 200,
      message: 'Bill processed successfully',
      data: result,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Bill processing error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: 'Failed to process bill image',
        error: error.message,
      },
      { status: 500 }
    );
  }
}