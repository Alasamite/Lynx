import { getProductById } from "@/lib/store-products"

export type CartItem = { productId: string; qty: number }
export type ShippingMethodId = "standard" | "express" | "pickup"
export type Discount = { code: string; type: "percent" | "shipping"; value: number }
export type Totals = { subtotal: number; discount: number; vat: number; shipping: number; total: number }
export type CustomerInfo = { email: string; firstName: string; lastName: string; phone: string; company: string; vatNumber: string }
export type ShippingInfo = { address1: string; address2: string; postalCode: string; city: string; country: string }
export type CheckoutPayload = {
  cart: CartItem[]
  customer: CustomerInfo
  shipping: ShippingInfo
  shippingMethod: ShippingMethodId
  discountCode?: string | null
  language?: string
  orderNumber?: string
}

export const discounts: Record<string, Discount> = {
  LYNX10: { code: "LYNX10", type: "percent", value: 10 },
  GYM20: { code: "GYM20", type: "percent", value: 20 },
  FREESHIP: { code: "FREESHIP", type: "shipping", value: 0 },
}

export const shippingMethods: { id: ShippingMethodId; price: number }[] = [
  { id: "standard", price: 4.9 },
  { id: "express", price: 9.9 },
  { id: "pickup", price: 0 },
]

export function getDiscount(code: string | null | undefined) {
  if (!code) return null
  return discounts[code.trim().toUpperCase()] ?? null
}

export function calculateTotals(cart: CartItem[], discount: Discount | null, shippingMethod: ShippingMethodId): Totals {
  const subtotal = cart.reduce((sum, item) => sum + (getProductById(item.productId)?.price ?? 0) * item.qty, 0)
  const discountValue = discount?.type === "percent" ? subtotal * (discount.value / 100) : 0
  const shippingBase = shippingMethods.find((method) => method.id === shippingMethod)?.price ?? 0
  const subtotalAfterDiscount = Math.max(0, subtotal - discountValue)
  const freeStandard = subtotalAfterDiscount >= 100 && shippingMethod === "standard"
  const freeByCode = discount?.type === "shipping"
  const shipping = freeByCode || freeStandard ? 0 : shippingBase
  const vat = subtotalAfterDiscount * 0.23
  return roundTotals({ subtotal, discount: discountValue, vat, shipping, total: subtotalAfterDiscount + vat + shipping })
}

function roundTotals(totals: Totals): Totals {
  return {
    subtotal: roundMoney(totals.subtotal),
    discount: roundMoney(totals.discount),
    vat: roundMoney(totals.vat),
    shipping: roundMoney(totals.shipping),
    total: roundMoney(totals.total),
  }
}

export function roundMoney(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

export function validateCart(cart: CartItem[]) {
  if (!Array.isArray(cart) || cart.length === 0) return { ok: false as const, error: "Cart is empty." }
  const validated: CartItem[] = []
  const seen = new Set<string>()
  for (const item of cart) {
    const product = getProductById(item.productId)
    if (!product) return { ok: false as const, error: "Invalid product in cart." }
    if (seen.has(product.id)) return { ok: false as const, error: "Duplicate cart item." }
    if (!Number.isInteger(item.qty) || item.qty < 1) return { ok: false as const, error: "Invalid cart quantity." }
    if (item.qty > product.stockQty) return { ok: false as const, error: "Requested quantity exceeds stock." }
    seen.add(product.id)
    validated.push({ productId: product.id, qty: item.qty })
  }
  return { ok: true as const, cart: validated }
}

export function validateCheckoutPayload(payload: CheckoutPayload) {
  const cart = validateCart(payload.cart)
  if (!cart.ok) return { ok: false as const, error: cart.error }
  if (!payload.customer?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customer.email)) return { ok: false as const, error: "A valid email is required." }
  if (!payload.customer.firstName || !payload.customer.lastName) return { ok: false as const, error: "Customer name is required." }
  if (!["standard", "express", "pickup"].includes(payload.shippingMethod)) return { ok: false as const, error: "Invalid shipping method." }
  if (payload.shippingMethod !== "pickup") {
    if (!payload.shipping?.address1 || !payload.shipping?.postalCode || !payload.shipping?.city || !payload.shipping?.country) {
      return { ok: false as const, error: "Shipping address is incomplete." }
    }
  }
  const discount = getDiscount(payload.discountCode)
  const totals = calculateTotals(cart.cart, discount, payload.shippingMethod)
  if (totals.total <= 0) return { ok: false as const, error: "Invalid total." }
  return { ok: true as const, cart: cart.cart, discount, totals }
}

export function orderNumber() {
  return `LYNX-${new Date().getFullYear()}-${Date.now()}`
}

export function eur(amount: number) {
  return amount.toFixed(2)
}
