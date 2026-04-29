import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const { type, message } = body;
  const apiUrl = process.env.WHATSAPP_BUSINESS_API_URL;
  const token = process.env.WHATSAPP_BUSINESS_TOKEN;
  const deliveryGroup = process.env.WHATSAPP_DELIVERY_GROUP_ID;
  const salesGroup = process.env.WHATSAPP_SALES_GROUP_ID;

  if (!apiUrl || !token) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'WhatsApp Business Cloud API is not configured. Set WHATSAPP_BUSINESS_API_URL and WHATSAPP_BUSINESS_TOKEN in .env to enable group messaging.',
      },
      { status: 200 }
    );
  }

  const groupMap = {
    delivery: deliveryGroup,
    sales: salesGroup,
  };

  const destination = groupMap[type];
  if (!destination) {
    return NextResponse.json({ ok: false, message: 'Invalid WhatsApp destination type.' }, { status: 400 });
  }

  try {
    const response = await fetch(`${apiUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: destination,
        type: 'text',
        text: { body: message },
      }),
    });

    const data = await response.json();
    return NextResponse.json({ ok: response.ok, message: data.error?.message || 'Message request sent', data }, { status: response.status });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}
