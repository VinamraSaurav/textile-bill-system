import { NextRequest, NextResponse } from 'next/server';
import { processImageWithGemini } from '@/services/ocrService';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    const base64Image = formData.billImage;

    if (!base64Image) {
      return NextResponse.json({
        success: false,
        message: 'No bill image provided',
        status: 400,
      }, { status: 400 });
    }

    // Convert base64 to buffer
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Save to temp file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `${uuidv4()}.png`);
    fs.writeFileSync(tempFilePath, buffer);

    // Process the image using Gemini
    const result = await processImageWithGemini(tempFilePath);

    return NextResponse.json({
      success: true,
      status: 200,
      message: 'Bill processed successfully',
      data: result,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Bill processing error:', error);
    return NextResponse.json({
      success: false,
      status: 500,
      message: 'Failed to process bill image',
      error: error.message,
    }, { status: 500 });
  }
}
