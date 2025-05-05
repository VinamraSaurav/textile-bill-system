import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import { BillData } from '../types/BillData';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Use Gemini Vision for image processing instead of Tesseract
export async function processImageWithGemini(imagePath: string): Promise<BillData> {
  try {
    // Read image file as base64
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Create a prompt for Gemini Vision model to extract bill data
    const prompt = `
    Extract the following information from this bill image and format it as valid JSON:
    
    {
      "bill_number": "",
      "bill_date": "YYYY-MM-DD",
      "location": "",
      "total_billed_amount": 0,
      "supplier": {
        "name": "",
        "gstin": "",
        "address": {
          "street": "",
          "city": "",
          "state": "",
          "pincode": ""
        },
        "phone": {
          "office": [],
          "mobile": []
        }
      },
      "party": {
        "name": "",
        "gstin": "",
        "address": {
          "street": "",
          "city": "",
          "state": "",
          "pincode": ""
        },
        "phone": {
          "office": [],
          "mobile": []
        }
      },
      "items": [
        {
          "name": "",
          "hsn": "",
          "quantity": 0,
          "rate": 0,
          "amount": 0
        }
      ]
    }
    
    Look at the image carefully and extract all visible text. For any fields you cannot find data for, use null, empty strings, or empty arrays as appropriate. Make sure the JSON format is valid.
    `;

    // Use Gemini-Pro-Vision model for image analysis (instead of OCR + text processing)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Convert image to base64 and prepare the content parts
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg', // Adjust based on actual image type
      },
    };
    
    // Generate content with both text prompt and image
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const responseText = response.text();
    
    // Parse JSON response
    try {
      // Safely extract JSON from Markdown or plain string
      const jsonText = responseText
        .replace(/^```(?:json)?/, '')
        .replace(/```$/, '')
        .trim();

      const extractedData: BillData = JSON.parse(jsonText);
      return extractedData;
    } catch (error: any) {
      console.error('Failed to parse Gemini response:', error);
      console.log('Gemini raw response:', responseText);
      throw new Error('Failed to extract structured data from bill image');
    }
    
  } catch (error: any) {
    console.error('Bill image processing error:', error);
    throw new Error(`Failed to process bill image: ${error.message}`);
  } finally {
    // Optional cleanup
    try {
      if (fs.existsSync(imagePath) && imagePath.includes('tmp')) {
        fs.unlinkSync(imagePath);
      }
    } catch (err) {
      console.warn('Failed to delete temp file:', err);
    }
  }
}