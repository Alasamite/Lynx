import { NextResponse } from "next/server"
import { orderNumber, validateCheckoutPayload, type CheckoutPayload } from "@/lib/checkout"
import { createPayPalOrder } from "@/lib/paypal"

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CheckoutPayload
    const withOrderNumber = { ...payload, orderNumber: payload.orderNumber || orderNumber() }
    const validation = validateCheckoutPayload(withOrderNumber)
    if (!validation.ok) return NextResponse.json({ ok: false, error: validation.error }, { status: 400 })
    const order = await createPayPalOrder(withOrderNumber, validation.totals, validation.cart)
    return NextResponse.json({ ok: true, orderID: order.id, status: order.status, approveUrl: order.approveUrl, orderNumber: withOrderNumber.orderNumber, totals: validation.totals })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "PayPal order creation failed." }, { status: 502 })
  }
}
