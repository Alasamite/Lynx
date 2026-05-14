import { NextResponse } from "next/server"
import { web3Forms } from "@/lib/integrations"

type Web3FormRequest = {
  subject: string
  name?: string
  email?: string
  message: string
  fields?: Record<string, unknown>
}

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status })
}

async function safeJson(response: Response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as { success?: boolean; message?: string }
  } catch (error) {
    console.error("Web3Forms returned a non-JSON response", { status: response.status, text: text.slice(0, 240), error })
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Web3FormRequest
    if (!body.subject || !body.message) return json({ ok: false, error: "FORM_VALIDATION_FAILED" }, 400)
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return json({ ok: false, error: "FORM_VALIDATION_FAILED" }, 400)

    const payload = {
      access_key: web3Forms.accessKey,
      subject: body.subject,
      from_name: body.name || "Lynx Climbing website",
      name: body.name || "Lynx Climbing website",
      email: body.email || web3Forms.ordersEmail,
      replyto: body.email || web3Forms.ordersEmail,
      message: body.message,
      ccemail: body.subject.includes("Paid Order") ? web3Forms.ordersEmail : web3Forms.formsEmail,
      ...body.fields,
    }

    const response = await fetch(web3Forms.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    })
    const data = await safeJson(response)
    if (!response.ok || data?.success !== true) {
      console.error("Web3Forms submission failed", { status: response.status, message: data?.message })
      return json({ ok: false, error: "FORM_SEND_FAILED", data }, 502)
    }
    return json({ ok: true, data })
  } catch (error) {
    console.error("Web3Forms route failed", error)
    return json({ ok: false, error: "FORM_SEND_FAILED" }, 500)
  }
}
