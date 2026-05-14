import Link from "next/link"

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-lynx-black px-4 py-12 text-lynx-chalk">
      <section className="mx-auto max-w-3xl border border-lynx-graphite bg-lynx-charcoal p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-lynx-granite">Lynx Climbing</p>
        <h1 className="mt-3 text-3xl font-bold uppercase tracking-wide">PayPal confirmation</h1>
        <p className="mt-4 text-sm leading-6 text-lynx-granite">Return to the Lynx Climbing checkout to view the paid order confirmation generated after PayPal capture.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/#cart" className="bg-lynx-forest px-5 py-3 text-xs uppercase tracking-wider">Return to cart</Link>
          <Link href="/#shop" className="border border-lynx-graphite px-5 py-3 text-xs uppercase tracking-wider">Continue shopping</Link>
        </div>
      </section>
    </main>
  )
}
