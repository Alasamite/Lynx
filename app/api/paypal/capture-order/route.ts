import { NextResponse } from "next/server"
import { capturePayPalOrder } from "@/lib/paypal"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderID?: string }
    if (!body.orderID) return NextResponse.json({ ok: false, error: "Missing PayPal order ID." }, { status: 400 })
    const capture = await capturePayPalOrder(body.orderID)
    return NextResponse.json({ ok: true, ...capture })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "PayPal capture failed." }, { status: 502 })
  }
}
