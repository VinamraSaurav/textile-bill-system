import { NextRequest, NextResponse } from 'next/server';
import { processBillImage } from '@/services/ocrService';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

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
    
    // Process the image
    const result = await processBillImage(tempFilePath);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Bill processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process bill' },
      { status: 500 }
    );
  }
}
