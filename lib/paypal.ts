import { eur, type CheckoutPayload } from "@/lib/checkout"
import { paypal } from "@/lib/integrations"
import { getProductById } from "@/lib/store-products"

type PayPalLink = { href: string; rel: string; method: string }

async function getAccessToken() {
  const credentials = Buffer.from(`${paypal.clientId}:${paypal.clientSecret}`).toString("base64")
  const response = await fetch(`${paypal.baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  })
  const data = await response.json()
  if (!response.ok || !data.access_token) throw new Error(data.error_description ?? "PayPal authentication failed.")
  return data.access_token as string
}

export async function createPayPalOrder(payload: CheckoutPayload, totals: { total: number }, cart: { productId: string; qty: number }[]) {
  const accessToken = await getAccessToken()
  const description = cart
    .map((item) => {
      const product = getProductById(item.productId)
      return product ? `${product.sku} x ${item.qty}` : item.productId
    })
    .join(", ")
    .slice(0, 120)

  const response = await fetch(`${paypal.baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: payload.orderNumber,
          description: description || "Lynx Climbing order",
          amount: {
            currency_code: "EUR",
            value: eur(totals.total),
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            brand_name: "Lynx Climbing",
            locale: "en-PT",
            shipping_preference: payload.shippingMethod === "pickup" ? "NO_SHIPPING" : "SET_PROVIDED_ADDRESS",
            user_action: "PAY_NOW",
          },
        },
      },
    }),
    cache: "no-store",
  })
  const data = await response.json()
  if (!response.ok || !data.id) throw new Error(data.message ?? "PayPal order creation failed.")
  const approveUrl = (data.links as PayPalLink[] | undefined)?.find((link) => link.rel === "approve")?.href ?? null
  return { id: data.id as string, status: data.status as string, approveUrl }
}

export async function capturePayPalOrder(orderID: string) {
  const accessToken = await getAccessToken()
  const response = await fetch(`${paypal.baseUrl}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    cache: "no-store",
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message ?? "PayPal capture failed.")
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0]
  if (data.status !== "COMPLETED" || capture?.status !== "COMPLETED") throw new Error(`PayPal capture status: ${capture?.status ?? data.status}`)
  return {
    id: data.id as string,
    status: data.status as string,
    captureId: capture.id as string,
    captureStatus: capture.status as string,
  }
}
