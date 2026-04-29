import { NextResponse } from 'next/server';

export async function POST(request) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Determine media type
    let mediaType = 'application/octet-stream';
    if (file.type.startsWith('image/')) {
      mediaType = file.type;
    } else if (file.type === 'application/pdf') {
      mediaType = 'application/pdf';
    } else if (file.type.includes('sheet') || file.type === 'text/csv') {
      // For Excel/CSV, we'll try to read as text
      const text = await file.text();
      return sendToGPTForExtraction(OPENAI_API_KEY, text, 'text');
    }

    // Send image or PDF to ChatGPT with vision
    return sendToGPTForExtraction(OPENAI_API_KEY, base64, 'file', mediaType);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function sendToGPTForExtraction(apiKey, content, type, mediaType = null) {
  const systemPrompt = `You are an invoice extraction specialist for Makro Food. Your task is to extract invoice data from images, PDFs, or text.

Extract and return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "vendorName": "string",
  "invoiceNumber": "string",
  "invoiceDate": "string (YYYY-MM-DD format if possible)",
  "notes": "string (any special notes or instructions)",
  "lines": [
    {
      "productName": "string",
      "quantity": "number or string",
      "caseCount": "number or string or null",
      "price": "number or string or null",
      "cost": "number or string or null"
    }
  ]
}

Rules:
- Extract prices and costs but indicate they should NOT appear on packing slips
- If a field is missing, use empty string or null
- Be precise with quantities and case counts
- Return ONLY the JSON, nothing else`;

  let messageContent;

  if (type === 'file') {
    messageContent = [
      {
        type: 'image',
        image: {
          data: content,
          media_type: mediaType,
        },
      },
      {
        type: 'text',
        text: 'Extract the invoice data from this image/document.',
      },
    ];
  } else if (type === 'text') {
    messageContent = [
      {
        type: 'text',
        text: `Extract invoice data from this text content:\n\n${content}`,
      },
    ];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: messageContent,
          },
        ],
        max_tokens: 1024,
        temperature: 0,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const content = data.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(content);

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Extraction failed: ${error.message}` },
      { status: 500 }
    );
  }
}
