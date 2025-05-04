import { createWorker } from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import { BillData } from '../types/BillData';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function processImageToText(imagePath: string): Promise<string> {
  const worker = await createWorker('eng');
  try {
    const { data: { text } } = await worker.recognize(imagePath);
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to process image with OCR');
  } finally {
    await worker.terminate();
  }
}

export async function extractBillData(text: string): Promise<BillData> {
  const prompt = `
Extract the following information from this bill text and format it as JSON:

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

If you cannot find certain information, use null, empty strings, or empty arrays as appropriate.

Here is the bill text:
${text}
`;

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt);
  const response = result.response;
  const responseText = response.text();

  try {
    // Safely extract JSON from Markdown or plain string
    const jsonText = responseText
      .replace(/^```(?:json)?/, '')
      .replace(/```$/, '')
      .trim();

    const extractedData: BillData = JSON.parse(jsonText);
    return extractedData;
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    console.log('Gemini raw response:', responseText);
    throw new Error('Failed to extract structured data from bill');
  }
}

export async function findMatchingEntities(extractedData: BillData) {
  let matchingSuppliers = [];
  let matchingParties = [];

  if (extractedData.supplier?.name || extractedData.supplier?.gstin) {
    matchingSuppliers = await prisma.supplier.findMany({
      where: {
        OR: [
          {
            name: {
              contains: extractedData.supplier.name || '',
              mode: 'insensitive',
            },
          },
          { gstin: extractedData.supplier.gstin || '' },
        ],
      },
      include: {
        address: true,
        phone: true,
      },
    });
  }

  if (extractedData.party?.name || extractedData.party?.gstin) {
    matchingParties = await prisma.party.findMany({
      where: {
        OR: [
          {
            name: {
              contains: extractedData.party.name || '',
              mode: 'insensitive',
            },
          },
          { gstin: extractedData.party.gstin || '' },
        ],
      },
      include: {
        address: true,
        phone: true,
      },
    });
  }

  return {
    matchingSuppliers,
    matchingParties,
    extractedData,
  };
}

export async function processBillImage(imagePath: string) {
  try {
    const extractedText = await processImageToText(imagePath);
    const extractedData = await extractBillData(extractedText);
    const result = await findMatchingEntities(extractedData);

    // Optional cleanup
    try {
      if (fs.existsSync(imagePath) && imagePath.includes('tmp')) {
        fs.unlinkSync(imagePath);
      }
    } catch (err) {
      console.warn('Failed to delete temp file:', err);
    }

    return result;
  } catch (error) {
    console.error('Bill processing failed:', error);
    throw error;
  }
}
