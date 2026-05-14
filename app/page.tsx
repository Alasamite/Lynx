"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { CheckCircle, Globe2, Mail, Menu, Minus, Package, Search, ShoppingBag, Trash2, X } from "lucide-react"
import { calculateTotals, discounts, orderNumber, shippingMethods, type CartItem, type CustomerInfo, type Discount, type ShippingInfo, type ShippingMethodId, type Totals } from "@/lib/checkout"
import { getProductById, products, type Product, type ProductCategory, type ProductSize } from "@/lib/store-products"
import { locales, rtlLocales, translations, type Copy, type Locale } from "@/lib/i18n"

type SortOption = "featured" | "newest" | "price-asc" | "price-desc" | "name"
type StockFilter = "all" | "in-stock" | "low-stock"
type CheckoutStep = "customer" | "shipping" | "method" | "payment" | "review" | "confirmation"
type QuoteInfo = { name: string; email: string; company: string; country: string; orderType: string; quantity: string; categories: string; message: string; includeCart: boolean }
type ContactInfo = { name: string; email: string; message: string }
type PaidOrder = { orderNumber: string; paypalOrderId: string; paypalCaptureId: string; paymentStatus: string; customer: CustomerInfo; shipping: ShippingInfo; shippingMethod: ShippingMethodId; items: CartItem[]; totals: Totals; emailWarning?: string }
type PayPalActions = { order: { create: () => Promise<string>; capture: () => Promise<unknown> } }
type PayPalButtonsConfig = { createOrder: () => Promise<string>; onApprove: (data: { orderID: string }, actions: PayPalActions) => Promise<void>; onCancel: () => void; onError: (error: unknown) => void; style: Record<string, string> }

declare global {
  interface Window {
    paypal?: { Buttons: (config: PayPalButtonsConfig) => { render: (selector: string) => Promise<void>; close?: () => void } }
  }
}

const PAYPAL_CLIENT_ID = "Af6bRHz_K2gLQ8a5umufq8OU0T4G221rgD6mhL07731229--mZzfYhg1vhtcrq8tFRdWo4EzrkF2_EgP"
const categories: ("all" | ProductCategory)[] = ["all", "Macros", "Jugs", "Crimps"]
const sizes: ("all" | ProductSize)[] = ["all", "XS", "S", "M", "L", "XL"]
const LynxHeroScene = dynamic(() => import("@/components/LynxHeroScene"), { ssr: false })

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [locale, setLocale] = useState<Locale>("en")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<"all" | ProductCategory>("all")
  const [size, setSize] = useState<"all" | ProductSize>("all")
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [sort, setSort] = useState<SortOption>("featured")
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productQty, setProductQty] = useState(1)
  const [discountInput, setDiscountInput] = useState("")
  const [discount, setDiscount] = useState<Discount | null>(null)
  const [discountError, setDiscountError] = useState("")
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("customer")
  const [customer, setCustomer] = useState<CustomerInfo>({ email: "", firstName: "", lastName: "", phone: "", company: "", vatNumber: "" })
  const [shipping, setShipping] = useState<ShippingInfo>({ address1: "", address2: "", postalCode: "", city: "", country: "" })
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>("standard")
  const [checkoutErrors, setCheckoutErrors] = useState<Record<string, string>>({})
  const [quoteErrors, setQuoteErrors] = useState<Record<string, string>>({})
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({})
  const [paymentError, setPaymentError] = useState("")
  const [order, setOrder] = useState<PaidOrder | null>(null)
  const [quote, setQuote] = useState<QuoteInfo>({ name: "", email: "", company: "", country: "", orderType: "", quantity: "", categories: "", message: "", includeCart: false })
  const [quoteSent, setQuoteSent] = useState(false)
  const [quoteSending, setQuoteSending] = useState(false)
  const [contact, setContact] = useState<ContactInfo>({ name: "", email: "", message: "" })
  const [contactSent, setContactSent] = useState(false)
  const [contactSending, setContactSending] = useState(false)

  const t = translations[locale]
  const dir = rtlLocales.includes(locale) ? "rtl" : "ltr"
  const money = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }), [locale])
  const totals = useMemo(() => calculateTotals(cart, discount, shippingMethod), [cart, discount, shippingMethod])
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  useEffect(() => {
    setMounted(true)
    const savedLocale = localStorage.getItem("lynx_locale") as Locale | null
    if (savedLocale && translations[savedLocale]) setLocale(savedLocale)
    const savedCart = localStorage.getItem("lynx_cart")
    const savedDiscount = localStorage.getItem("lynx_discount")
    if (savedCart) setCart(JSON.parse(savedCart) as CartItem[])
    if (savedDiscount && discounts[savedDiscount]) setDiscount(discounts[savedDiscount])
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem("lynx_locale", locale)
    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [dir, locale, mounted])

  useEffect(() => {
    if (mounted) localStorage.setItem("lynx_cart", JSON.stringify(cart))
  }, [cart, mounted])

  useEffect(() => {
    if (!mounted) return
    if (discount) localStorage.setItem("lynx_discount", discount.code)
    else localStorage.removeItem("lynx_discount")
  }, [discount, mounted])

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase()
    const list = products.filter((product) => {
      const haystack = [product.name, product.sku, product.category, product.size, product.collection, product.gripType, product.material, product.finish, product.recommendedUse, product.shortDescription, product.longDescription].join(" ").toLowerCase()
      return (!search || haystack.includes(search)) && (category === "all" || product.category === category) && (size === "all" || product.size === size) && (stockFilter === "all" || (stockFilter === "in-stock" ? product.stockQty > 0 : product.stockQty <= 15))
    })
    return list.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price
      if (sort === "price-desc") return b.price - a.price
      if (sort === "name") return a.name.localeCompare(b.name)
      if (sort === "newest") return Number(Boolean(b.newArrival)) - Number(Boolean(a.newArrival))
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    })
  }, [category, query, size, sort, stockFilter])

  function addToCart(product: Product, qty = 1) {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id)
      if (!existing) return [...current, { productId: product.id, qty: Math.min(qty, product.stockQty) }]
      return current.map((item) => (item.productId === product.id ? { ...item, qty: Math.min(product.stockQty, item.qty + qty) } : item))
    })
  }

  function updateQty(id: string, qty: number) {
    const product = getProductById(id)
    if (!product) return
    setCart((current) => current.map((item) => (item.productId === id ? { ...item, qty: Math.max(1, Math.min(product.stockQty, qty)) } : item)))
  }

  function removeItem(id: string) {
    setCart((current) => current.filter((item) => item.productId !== id))
  }

  function applyDiscount() {
    const code = discountInput.trim().toUpperCase()
    if (!code) {
      setDiscount(null)
      setDiscountError("")
      return
    }
    if (discounts[code]) {
      setDiscount(discounts[code])
      setDiscountInput(code)
      setDiscountError("")
    } else {
      setDiscount(null)
      setDiscountError(t.cart.invalid)
    }
  }

  function removeDiscount() {
    setDiscount(null)
    setDiscountInput("")
    setDiscountError("")
  }

  async function safeApiJson(response: Response) {
    const text = await response.text()
    if (!text) return null
    try {
      return JSON.parse(text) as Record<string, unknown>
    } catch (error) {
      console.error("API returned non-JSON response", { status: response.status, text: text.slice(0, 240), error })
      return null
    }
  }

  function validateStep(step = checkoutStep) {
    const nextErrors: Record<string, string> = {}
    if (step === "customer") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) nextErrors.email = t.validation.email
      if (!customer.firstName.trim()) nextErrors.firstName = t.validation.firstName
      if (!customer.lastName.trim()) nextErrors.lastName = t.validation.lastName
    }
    if (step === "shipping" && shippingMethod !== "pickup") {
      if (!shipping.address1.trim()) nextErrors.address1 = t.validation.address1
      if (!shipping.postalCode.trim()) nextErrors.postalCode = t.validation.postalCode
      if (!shipping.city.trim()) nextErrors.city = t.validation.city
      if (!shipping.country.trim()) nextErrors.country = t.validation.country
    }
    setCheckoutErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function nextStep() {
    if (!validateStep()) return
    const order: CheckoutStep[] = ["customer", "shipping", "method", "payment", "review"]
    setCheckoutStep(order[Math.min(order.indexOf(checkoutStep) + 1, order.length - 1)])
  }

  function backStep() {
    const order: CheckoutStep[] = ["customer", "shipping", "method", "payment", "review"]
    setCheckoutStep(order[Math.max(order.indexOf(checkoutStep) - 1, 0)])
  }

  async function submitWeb3Form(payload: { subject: string; name?: string; email?: string; message: string; fields?: Record<string, unknown> }) {
    try {
      const response = await fetch("/api/web3forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const data = await safeApiJson(response)
      if (response.ok && (data?.ok === true || data?.success === true)) return { ok: true as const }
      console.error("Web3Forms local route returned failure", { status: response.status, data })
      return { ok: false as const, error: "FORM_SEND_FAILED" }
    } catch (error) {
      console.error("Web3Forms request failed", error)
      return { ok: false as const, error: "FORM_SEND_FAILED" }
    }
  }

  async function handlePayPalComplete(paypalOrderId: string, paypalCaptureId: string) {
    const paid: PaidOrder = { orderNumber: orderNumber(), paypalOrderId, paypalCaptureId, paymentStatus: "COMPLETED", customer, shipping, shippingMethod, items: cart, totals }
    try {
      const result = await submitWeb3Form({
        subject: "Lynx Climbing New Paid Order",
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        message: orderMessage(paid, locale),
        fields: { language: locale, timestamp: new Date().toISOString(), source: "checkout" },
      })
      if (!result.ok) paid.emailWarning = t.checkout.notificationWarning
    } catch (error) {
      console.error("Paid order notification failed", error)
      paid.emailWarning = t.checkout.notificationWarning
    }
    setOrder(paid)
    setCart([])
    setDiscount(null)
    setDiscountInput("")
    setCheckoutStep("confirmation")
  }

  async function submitQuote() {
    const nextErrors: Record<string, string> = {}
    if (!quote.name.trim()) nextErrors.name = t.validation.name
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quote.email)) nextErrors.email = t.validation.email
    if (!quote.company.trim()) nextErrors.company = t.validation.company
    if (!quote.country.trim()) nextErrors.country = t.validation.country
    if (!quote.orderType.trim()) nextErrors.orderType = t.validation.orderType
    if (!quote.quantity.trim()) nextErrors.quantity = t.validation.quantity
    if (!quote.categories.trim()) nextErrors.categories = t.validation.categories
    if (!quote.message.trim()) nextErrors.message = t.validation.message
    setQuoteErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setQuoteSending(true)
    try {
      const result = await submitWeb3Form({ subject: "Lynx Climbing B2B Quote Request", name: quote.name, email: quote.email, message: quoteMessage(quote, cart, locale), fields: { language: locale, timestamp: new Date().toISOString(), source: "b2b", company: quote.company, country: quote.country } })
      if (!result.ok) {
        setQuoteErrors({ message: t.validation.form })
        return
      }
      setQuoteSent(true)
      setQuote({ name: "", email: "", company: "", country: "", orderType: "", quantity: "", categories: "", message: "", includeCart: false })
    } catch (error) {
      console.error("B2B form submission failed", error)
      setQuoteErrors({ message: t.validation.form })
    } finally {
      setQuoteSending(false)
    }
  }

  async function submitContact() {
    const nextErrors: Record<string, string> = {}
    if (!contact.name.trim()) nextErrors.name = t.validation.name
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) nextErrors.email = t.validation.email
    if (!contact.message.trim()) nextErrors.message = t.validation.message
    setContactErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setContactSending(true)
    try {
      const result = await submitWeb3Form({ subject: "Lynx Climbing Contact Form", name: contact.name, email: contact.email, message: contact.message, fields: { language: locale, timestamp: new Date().toISOString(), source: "contact" } })
      if (!result.ok) {
        setContactErrors({ message: t.validation.form })
        return
      }
      setContactSent(true)
      setContact({ name: "", email: "", message: "" })
    } catch (error) {
      console.error("Contact form submission failed", error)
      setContactErrors({ message: t.validation.form })
    } finally {
      setContactSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-lynx-black text-lynx-chalk" dir={dir}>
      <JsonLd />
      <Header t={t} locale={locale} setLocale={setLocale} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} cartCount={cartCount} openCart={() => setCartOpen(true)} />
      <section id="top" className="relative min-h-[88vh] overflow-hidden border-b border-lynx-graphite">
        <Image src="/images/sintra/boulder-hero.jpg" alt="Serra de Sintra granite landscape for Lynx Climbing" fill priority className="object-cover opacity-35" sizes="100vw" />
        <PremiumHeroField />
        <LynxHeroScene />
        <div className="absolute inset-0 bg-gradient-to-b from-lynx-black/30 via-lynx-black/50 to-lynx-black" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 pb-20 pt-28">
          <Logo variant="full" size="hero" className="mb-8 hero-logo" />
          <p className="text-xs uppercase tracking-[0.28em] text-lynx-stone">{t.hero.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-bold uppercase tracking-normal md:text-7xl">{t.hero.value}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-lynx-chalk/82">{t.hero.line}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })} className="bg-lynx-forest px-7 py-4 text-xs font-medium uppercase tracking-wider transition-all duration-200 hover:bg-[#174936] hover:shadow-lg hover:shadow-lynx-forest/25">{t.hero.shop}</button>
            <button onClick={() => document.getElementById("brand")?.scrollIntoView({ behavior: "smooth" })} className="border border-lynx-granite px-7 py-4 text-xs font-medium uppercase tracking-wider transition-all duration-200 hover:border-lynx-stone hover:bg-lynx-charcoal/50">{t.hero.brand}</button>
          </div>
        </div>
      </section>
      <InfoSections t={t} />
      <ShopSection t={t} money={(amount) => money.format(amount)} filteredProducts={filteredProducts} query={query} setQuery={setQuery} category={category} setCategory={setCategory} size={size} setSize={setSize} stockFilter={stockFilter} setStockFilter={setStockFilter} sort={sort} setSort={setSort} onView={(product) => { setSelectedProduct(product); setProductQty(1) }} onAdd={addToCart} onBuy={(product) => { addToCart(product); setCheckoutOpen(true); setCheckoutStep("customer") }} />
      <CartPanel cart={cart} t={t} money={(amount) => money.format(amount)} totals={totals} discount={discount} discountInput={discountInput} discountError={discountError} setDiscountInput={setDiscountInput} applyDiscount={applyDiscount} removeDiscount={removeDiscount} updateQty={updateQty} removeItem={removeItem} openCheckout={() => { setCheckoutOpen(true); setCheckoutStep("customer") }} />
      <FormsSection t={t} quote={quote} setQuote={setQuote} contact={contact} setContact={setContact} cart={cart} quoteSent={quoteSent} quoteSending={quoteSending} submitQuote={submitQuote} contactSent={contactSent} contactSending={contactSending} submitContact={submitContact} quoteErrors={quoteErrors} contactErrors={contactErrors} />
      <Footer t={t} />
      {selectedProduct && <ProductModal product={selectedProduct} t={t} money={(amount) => money.format(amount)} qty={productQty} setQty={setProductQty} onClose={() => setSelectedProduct(null)} onAdd={() => addToCart(selectedProduct, productQty)} onBuy={() => { addToCart(selectedProduct, productQty); setSelectedProduct(null); setCheckoutOpen(true); setCheckoutStep("customer") }} onRelated={(product) => { setSelectedProduct(product); setProductQty(1) }} />}
      {cartOpen && <CartDrawer cart={cart} t={t} money={(amount) => money.format(amount)} totals={totals} discount={discount} discountInput={discountInput} discountError={discountError} setDiscountInput={setDiscountInput} applyDiscount={applyDiscount} removeDiscount={removeDiscount} updateQty={updateQty} removeItem={removeItem} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); setCheckoutStep("customer") }} />}
      {checkoutOpen && <CheckoutModal step={checkoutStep} t={t} money={(amount) => money.format(amount)} cart={cart} totals={totals} customer={customer} shipping={shipping} errors={checkoutErrors} paymentError={paymentError} setPaymentError={setPaymentError} shippingMethod={shippingMethod} order={order} locale={locale} discount={discount} setCustomer={setCustomer} setShipping={setShipping} setShippingMethod={setShippingMethod} nextStep={nextStep} backStep={backStep} onPayPalComplete={handlePayPalComplete} onClose={() => setCheckoutOpen(false)} onFinish={() => { setCheckoutOpen(false); setOrder(null) }} />}
    </main>
  )
}

function Logo({ variant = "full", size = "header", clickable = true, className = "" }: { variant?: "full" | "symbol"; size?: "header" | "hero" | "footer" | "mark"; clickable?: boolean; className?: string }) {
  const src = variant === "symbol" ? "/images/lynx-logo_no_letters.png" : "/images/lynx-logo.png"
  const sizeClass = size === "hero" ? "h-32 w-80 max-w-[78vw]" : size === "footer" ? "h-20 w-56" : size === "mark" ? "h-12 w-12" : "h-14 w-48"
  const image = <span className={`logo-${variant} relative block shrink-0 ${sizeClass} ${className}`}><Image src={src} alt={variant === "symbol" ? "Lynx Climbing lynx head symbol" : "Lynx Climbing premium climbing holds logo"} fill className="object-contain" sizes={size === "hero" ? "320px" : "224px"} /></span>
  if (!clickable) return image
  return <a href="#top" aria-label="Lynx Climbing home" className="inline-flex items-center">{image}</a>
}

function PremiumHeroField() {
  return (
    <div aria-hidden="true" className="hero-mineral-field">
      <span className="hero-shard hero-shard-a" />
      <span className="hero-shard hero-shard-b" />
      <span className="hero-shard hero-shard-c" />
    </div>
  )
}

function Header({ t, locale, setLocale, mobileOpen, setMobileOpen, cartCount, openCart }: { t: Copy; locale: Locale; setLocale: (locale: Locale) => void; mobileOpen: boolean; setMobileOpen: (value: boolean) => void; cartCount: number; openCart: () => void }) {
  const nav = [["shop", t.nav.shop], ["collection", t.nav.collection], ["brand", t.nav.brand], ["b2b", t.nav.b2b], ["support", t.nav.support]]
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-lynx-graphite bg-lynx-black/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        <a href="#top" className="group flex items-center gap-3" aria-label="Lynx Climbing home">
          <span className="relative block h-11 w-11 shrink-0 transition-transform duration-200 group-hover:scale-105">
            <Image src="/images/lynx-logo_no_letters.png" alt="Lynx Climbing" fill className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]" sizes="44px" />
          </span>
          <span className="hidden flex-col sm:flex">
            <span className="text-sm font-bold uppercase tracking-[0.24em] text-lynx-chalk">Lynx</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.32em] text-lynx-granite">Climbing</span>
          </span>
          <span className="text-sm font-bold uppercase tracking-[0.24em] text-lynx-chalk sm:hidden">Lynx</span>
        </a>
        <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-wider lg:flex">
          {nav.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="relative text-lynx-granite transition-colors hover:text-lynx-chalk after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-lynx-stone after:transition-all hover:after:w-full">{label}</a>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <LanguageSelect locale={locale} setLocale={setLocale} />
          <button onClick={openCart} className="relative border border-lynx-graphite p-3 transition-colors hover:border-lynx-stone hover:bg-lynx-charcoal" aria-label={t.nav.cart}>
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-lynx-stone px-1 text-[10px] font-semibold text-lynx-black">{cartCount}</span>}
          </button>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 md:hidden" aria-label={t.nav.menu}><Menu className="h-6 w-6" /></button>
      </div>
      {mobileOpen && (
        <div className="border-t border-lynx-graphite bg-lynx-black p-4 md:hidden">
          <div className="mb-4 flex items-center justify-between">
            <LanguageSelect locale={locale} setLocale={setLocale} />
            <button onClick={() => setMobileOpen(false)} className="p-2" aria-label={t.nav.close}><X className="h-5 w-5" /></button>
          </div>
          {nav.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setMobileOpen(false)} className="block border-b border-lynx-graphite py-4 text-sm font-medium uppercase tracking-wider transition-colors hover:text-lynx-stone">{label}</a>
          ))}
          <button onClick={() => { setMobileOpen(false); openCart() }} className="mt-4 flex w-full items-center justify-between border border-lynx-graphite p-4 text-sm font-medium uppercase tracking-wider transition-colors hover:border-lynx-stone hover:bg-lynx-charcoal">
            <span>{t.nav.cart}</span>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-lynx-stone text-xs text-lynx-black">{cartCount}</span>
          </button>
        </div>
      )}
    </header>
  )
}

function LanguageSelect({ locale, setLocale }: { locale: Locale; setLocale: (locale: Locale) => void }) {
  return <label className="flex items-center gap-2 text-xs text-lynx-granite"><Globe2 className="h-4 w-4" /><select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} className="bg-lynx-black text-lynx-chalk outline-none">{locales.map((item) => <option key={item.locale} value={item.locale}>{item.label}</option>)}</select></label>
}

function InfoSections({ t }: { t: Copy }) {
  return <><section id="collection" className="border-b border-lynx-graphite py-16"><div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-[0.85fr_1.15fr]"><div className="relative min-h-80 overflow-hidden"><Image src="/images/sintra/collection-cover.jpg" alt="Sintra Granite Collection climbing hold atmosphere" fill className="object-cover" sizes="(min-width: 768px) 45vw, 100vw" /></div><div className="flex flex-col justify-center"><p className="text-xs uppercase tracking-[0.28em] text-lynx-stone">{t.sections.launch}</p><h2 className="mt-3 text-4xl font-bold uppercase tracking-normal">{t.sections.collectionTitle}</h2><p className="mt-5 text-lg leading-8 text-lynx-chalk/78">{t.sections.collectionText}</p><p className="mt-5 leading-7 text-lynx-granite">{t.sections.cultureText}</p></div></div></section><section id="brand" className="border-b border-lynx-graphite py-16"><div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-3"><Feature title={t.sections.philosophyTitle} text={t.sections.philosophyText} /><Feature title={t.sections.brandTitle} text={t.sections.brandText} logo /><Feature title={t.sections.cultureTitle} text={t.sections.cultureText} /></div></section></>
}

function Feature({ title, text, logo }: { title: string; text: string; logo?: boolean }) {
  return <article className="brand-card border border-lynx-graphite bg-lynx-charcoal p-6">{logo && <Logo variant="symbol" size="mark" clickable={false} className="mb-6" />}<h2 className="text-xl font-semibold uppercase tracking-wide">{title}</h2><p className="mt-4 text-sm leading-7 text-lynx-granite">{text}</p></article>
}

function ShopSection(props: { t: Copy; money: (amount: number) => string; filteredProducts: Product[]; query: string; setQuery: (value: string) => void; category: "all" | ProductCategory; setCategory: (value: "all" | ProductCategory) => void; size: "all" | ProductSize; setSize: (value: "all" | ProductSize) => void; stockFilter: StockFilter; setStockFilter: (value: StockFilter) => void; sort: SortOption; setSort: (value: SortOption) => void; onView: (product: Product) => void; onAdd: (product: Product) => void; onBuy: (product: Product) => void }) {
  const { t, money, filteredProducts, query, setQuery, category, setCategory, size, setSize, stockFilter, setStockFilter, sort, setSort, onView, onAdd, onBuy } = props
  return <section id="shop" className="border-b border-lynx-graphite py-16"><div className="mx-auto max-w-7xl px-4"><p className="text-xs uppercase tracking-[0.28em] text-lynx-stone">{t.nav.shop}</p><h2 className="mt-3 text-4xl font-bold uppercase tracking-normal">{t.sections.shopTitle}</h2><p className="mt-4 max-w-3xl text-lynx-granite">{t.sections.shopText}</p><div className="mt-8 grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_1fr_auto]"><label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-lynx-granite" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.shop.search} className="h-11 w-full bg-lynx-charcoal pl-10 pr-3 text-sm outline-none ring-1 ring-lynx-graphite focus:ring-lynx-granite" /></label><Select value={category} onChange={(value) => setCategory(value as "all" | ProductCategory)} options={categories.map((item) => [item, item === "all" ? t.shop.all : t.categories[item]])} /><Select value={size} onChange={(value) => setSize(value as "all" | ProductSize)} options={sizes.map((item) => [item, t.sizes[item]])} /><Select value={stockFilter} onChange={(value) => setStockFilter(value as StockFilter)} options={[["all", t.shop.all], ["in-stock", t.shop.inStock], ["low-stock", t.shop.lowStock]]} /><Select value={sort} onChange={(value) => setSort(value as SortOption)} options={[["featured", t.shop.sortFeatured], ["newest", t.shop.sortNewest], ["price-asc", t.shop.sortLow], ["price-desc", t.shop.sortHigh], ["name", t.shop.sortName]]} /><button onClick={() => { setQuery(""); setCategory("all"); setSize("all"); setStockFilter("all"); setSort("featured") }} className="border border-lynx-graphite px-4 text-xs uppercase tracking-wider">{t.shop.clear}</button></div>{filteredProducts.length === 0 ? <p className="mt-10 border border-lynx-graphite p-8 text-center text-lynx-granite">{t.shop.empty}</p> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} t={t} money={money} onView={() => onView(product)} onAdd={() => onAdd(product)} onBuy={() => onBuy(product)} />)}</div>}</div></section>
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[][] }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 bg-lynx-charcoal px-3 text-sm outline-none ring-1 ring-lynx-graphite focus:ring-lynx-granite">{options.map(([option, label]) => <option key={option} value={option}>{label}</option>)}</select>
}

function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  const altByCategory: Record<ProductCategory, string> = {
    Macros: `${product.name} granite resin macro climbing hold for indoor bouldering walls`,
    Jugs: `${product.name} resin jug climbing hold for indoor climbing walls`,
    Crimps: `${product.name} technical crimp climbing hold for route setting`,
  }
  return <div className={`relative aspect-square bg-[#0d0d0d] ${className}`}><Image src={product.images[0]} alt={altByCategory[product.category]} fill className="object-contain p-6" sizes="(min-width: 1024px) 25vw, 50vw" /></div>
}

function ProductCard({ product, t, money, onView, onAdd, onBuy }: { product: Product; t: Copy; money: (amount: number) => string; onView: () => void; onAdd: () => void; onBuy: () => void }) {
  return <article className="product-card border border-lynx-graphite bg-lynx-charcoal"><button onClick={onView} className="w-full"><ProductImage product={product} /></button><div className="p-4"><p className="text-[10px] uppercase tracking-[0.22em] text-lynx-granite">{product.sku}</p><h3 className="mt-1 min-h-10 text-sm font-semibold">{product.name}</h3><p className="mt-2 text-xs text-lynx-granite">{t.categories[product.category]} / {t.shop.size} {product.size}</p><p className="mt-2 text-xs text-emerald-300">{product.stockQty <= 15 ? t.shop.stockLow : t.shop.stockIn}</p><p className="mt-4 text-lg font-semibold">{money(product.price)}</p><p className="mt-2 min-h-10 text-xs leading-5 text-lynx-granite">{t.productText[product.category].short}</p><div className="mt-5 grid grid-cols-3 gap-2"><button onClick={onView} className="border border-lynx-graphite px-2 py-3 text-[11px] uppercase tracking-wider">{t.shop.view}</button><button onClick={onAdd} className="bg-lynx-forest px-2 py-3 text-[11px] uppercase tracking-wider">{t.shop.add}</button><button onClick={onBuy} className="border border-lynx-stone px-2 py-3 text-[11px] uppercase tracking-wider text-lynx-chalk">{t.shop.buy}</button></div></div></article>
}

function ProductModal({ product, t, money, qty, setQty, onClose, onAdd, onBuy, onRelated }: { product: Product; t: Copy; money: (amount: number) => string; qty: number; setQty: (qty: number) => void; onClose: () => void; onAdd: () => void; onBuy: () => void; onRelated: (product: Product) => void }) {
  const specs = [[t.shop.material, product.material], [t.shop.finish, product.finish], [t.shop.gripType, product.gripType], [t.shop.mounting, product.mounting], [t.shop.recommendedUse, product.recommendedUse], [t.shop.weight, product.weight ?? "-"], [t.shop.colors, product.colors.join(", ")], [t.shop.stockQty, String(product.stockQty)]]
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4"><div className="mx-auto max-w-6xl border border-lynx-graphite bg-lynx-black"><div className="flex items-center justify-between border-b border-lynx-graphite p-4"><p className="text-xs uppercase tracking-wider text-lynx-granite">{t.shop.productDetail}</p><button onClick={onClose} className="p-2 text-lynx-granite hover:text-lynx-chalk" aria-label={t.nav.close}><X className="h-5 w-5" /></button></div><div className="grid gap-8 p-4 md:grid-cols-2 md:p-8"><ProductImage product={product} /><div><p className="text-xs uppercase tracking-[0.25em] text-lynx-granite">{product.collection}</p><h2 className="mt-3 text-3xl font-bold uppercase tracking-normal">{product.name}</h2><p className="mt-2 text-sm text-lynx-granite">{product.sku} / {t.categories[product.category]} / {t.shop.size} {product.size}</p><p className="mt-5 text-2xl font-semibold">{money(product.price)}</p><p className="mt-6 leading-7 text-lynx-chalk/80">{t.productText[product.category].long}</p><div className="mt-6 flex items-center gap-3"><button onClick={() => setQty(Math.max(1, qty - 1))} className="border border-lynx-graphite p-3" aria-label="Decrease"><Minus className="h-4 w-4" /></button><span className="w-10 text-center">{qty}</span><button onClick={() => setQty(Math.min(product.stockQty, qty + 1))} className="border border-lynx-graphite px-4 py-3" aria-label="Increase">+</button></div><div className="mt-6 grid grid-cols-2 gap-3"><button onClick={onAdd} className="bg-lynx-forest py-3 text-xs uppercase tracking-wider">{t.shop.add}</button><button onClick={onBuy} className="border border-lynx-granite py-3 text-xs uppercase tracking-wider">{t.shop.buy}</button></div><h3 className="mt-8 text-sm uppercase tracking-wider text-lynx-granite">{t.shop.specs}</h3><dl className="mt-4 grid gap-3 text-sm">{specs.map(([label, value]) => <div key={label} className="grid grid-cols-[0.42fr_1fr] gap-4 border-b border-lynx-graphite pb-3"><dt className="text-lynx-granite">{label}</dt><dd>{value}</dd></div>)}</dl><p className="mt-5 border border-lynx-graphite p-4 text-sm text-lynx-granite"><strong className="text-lynx-chalk">{t.shop.shippingReturns}: </strong>{t.shop.shippingNote}</p><h3 className="mt-8 text-sm uppercase tracking-wider text-lynx-granite">{t.shop.related}</h3><div className="mt-3 flex gap-3">{products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3).map((item) => <button key={item.id} onClick={() => onRelated(item)} className="w-24 border border-lynx-graphite" aria-label={item.name}><ProductImage product={item} /></button>)}</div></div></div></div></div>
}

function CartPanel(props: { cart: CartItem[]; t: Copy; money: (amount: number) => string; totals: Totals; discount: Discount | null; discountInput: string; discountError: string; setDiscountInput: (value: string) => void; applyDiscount: () => void; removeDiscount: () => void; updateQty: (id: string, qty: number) => void; removeItem: (id: string) => void; openCheckout: () => void }) {
  return <section id="cart" className="border-b border-lynx-graphite bg-lynx-charcoal/40 py-16"><CartContent {...props} drawer={false} /></section>
}

function CartDrawer(props: { cart: CartItem[]; t: Copy; money: (amount: number) => string; totals: Totals; discount: Discount | null; discountInput: string; discountError: string; setDiscountInput: (value: string) => void; applyDiscount: () => void; removeDiscount: () => void; updateQty: (id: string, qty: number) => void; removeItem: (id: string) => void; onClose: () => void; onCheckout: () => void }) {
  return <div className="fixed inset-0 z-50 bg-black/70"><aside className="ml-auto flex h-full w-full max-w-xl flex-col border-l border-lynx-graphite bg-lynx-black"><div className="flex items-center justify-between border-b border-lynx-graphite p-5"><h2 className="text-lg font-bold uppercase tracking-wide">{props.t.cart.title}</h2><button onClick={props.onClose} aria-label={props.t.nav.close}><X className="h-5 w-5" /></button></div><div className="overflow-y-auto"><CartContent {...props} openCheckout={props.onCheckout} drawer /></div></aside></div>
}

function CartContent(props: { cart: CartItem[]; t: Copy; money: (amount: number) => string; totals: Totals; discount: Discount | null; discountInput: string; discountError: string; setDiscountInput: (value: string) => void; applyDiscount: () => void; removeDiscount: () => void; updateQty: (id: string, qty: number) => void; removeItem: (id: string) => void; openCheckout: () => void; drawer?: boolean }) {
  const { cart, t, money, totals, discount, discountInput, discountError, setDiscountInput, applyDiscount, removeDiscount, updateQty, removeItem, openCheckout, drawer } = props
  return <div className={`mx-auto grid max-w-7xl gap-8 px-4 ${drawer ? "py-5" : "lg:grid-cols-[1.15fr_0.85fr]"}`}><div><h2 className="text-3xl font-bold uppercase tracking-normal">{t.cart.title}</h2><div className="mt-6 border border-lynx-graphite bg-lynx-black">{cart.length === 0 ? <div className="p-10 text-center text-lynx-granite"><Package className="mx-auto mb-4 h-10 w-10" /><p>{t.cart.empty}</p></div> : <div className="divide-y divide-lynx-graphite">{cart.map((item) => { const product = getProductById(item.productId); if (!product) return null; return <div key={item.productId} className="grid gap-4 p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center"><ProductImage product={product} /><div><h3 className="font-semibold">{product.name}</h3><p className="mt-1 text-xs text-lynx-granite">{product.sku} / {t.shop.size} {product.size}</p><p className="mt-2 text-sm">{money(product.price)}</p></div><div className="flex items-center justify-between gap-4 sm:justify-end"><div className="flex items-center border border-lynx-graphite"><button onClick={() => updateQty(product.id, item.qty - 1)} className="px-3 py-2">-</button><span className="w-8 text-center text-sm">{item.qty}</span><button onClick={() => updateQty(product.id, item.qty + 1)} className="px-3 py-2">+</button></div><p className="w-24 text-right text-sm">{money(product.price * item.qty)}</p><button onClick={() => removeItem(product.id)} className="text-lynx-granite hover:text-lynx-chalk" aria-label={t.cart.remove}><Trash2 className="h-4 w-4" /></button></div>{item.qty >= product.stockQty && <p className="text-xs text-yellow-300 sm:col-start-2">{t.cart.stockLimit}</p>}</div> })}</div>}</div></div><div className="border border-lynx-graphite bg-lynx-black p-5"><div className="mb-4 flex gap-2"><input value={discountInput} onChange={(event) => setDiscountInput(event.target.value)} placeholder={t.cart.discountCode} className="min-w-0 flex-1 bg-lynx-charcoal px-3 text-sm outline-none ring-1 ring-lynx-graphite" /><button onClick={applyDiscount} className="bg-lynx-forest px-4 py-2 text-xs uppercase tracking-wider">{t.cart.apply}</button></div>{discountError && <p className="mb-3 text-xs text-red-400">{discountError}</p>}{discount && <div className="mb-3 flex items-center justify-between gap-3 text-xs text-emerald-300"><span>{discount.code} {t.cart.valid}</span><button onClick={removeDiscount} className="text-lynx-granite underline underline-offset-4 hover:text-lynx-chalk">{t.cart.remove}</button></div>}<TotalsView t={t} money={money} totals={totals} /><p className="mt-3 text-xs leading-5 text-lynx-granite">{t.cart.vatNote}</p><button disabled={cart.length === 0} onClick={openCheckout} className="mt-6 w-full bg-lynx-forest px-5 py-3 text-xs uppercase tracking-wider disabled:opacity-50">{t.cart.checkout}</button><button onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })} className="mt-3 w-full border border-lynx-graphite px-5 py-3 text-xs uppercase tracking-wider">{t.cart.continueShopping}</button></div></div>
}

function CheckoutModal(props: { step: CheckoutStep; t: Copy; money: (amount: number) => string; cart: CartItem[]; totals: Totals; customer: CustomerInfo; shipping: ShippingInfo; errors: Record<string, string>; paymentError: string; setPaymentError: (value: string) => void; shippingMethod: ShippingMethodId; order: PaidOrder | null; locale: Locale; discount: Discount | null; setCustomer: React.Dispatch<React.SetStateAction<CustomerInfo>>; setShipping: React.Dispatch<React.SetStateAction<ShippingInfo>>; setShippingMethod: (method: ShippingMethodId) => void; nextStep: () => void; backStep: () => void; onPayPalComplete: (paypalOrderId: string, paypalCaptureId: string) => Promise<void>; onClose: () => void; onFinish: () => void }) {
  const { step, t, money, cart, totals, customer, shipping, errors, paymentError, setPaymentError, shippingMethod, order, locale, discount, setCustomer, setShipping, setShippingMethod, nextStep, backStep, onPayPalComplete, onClose, onFinish } = props
  const stepTitle = step === "shipping" ? t.checkout.shippingAddress : step === "method" ? t.checkout.shippingMethod : step === "payment" ? t.checkout.paymentMethod : step === "review" ? t.checkout.review : t.checkout.customer
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4"><div className="mx-auto max-w-4xl border border-lynx-graphite bg-lynx-black"><div className="flex items-center justify-between border-b border-lynx-graphite p-5"><h2 className="text-lg font-bold uppercase tracking-wide">{t.checkout.title}</h2><button onClick={onClose} aria-label={t.nav.close}><X className="h-5 w-5" /></button></div><div className="p-5 md:p-8">{step !== "confirmation" && <p className="mb-6 text-xs uppercase tracking-wider text-lynx-granite">{stepTitle}</p>}{step === "customer" && <Fields fields={[["email", t.checkout.email, customer.email, "email"], ["firstName", t.checkout.firstName, customer.firstName, "text"], ["lastName", t.checkout.lastName, customer.lastName, "text"], ["phone", t.checkout.phone, customer.phone, "tel"], ["company", t.checkout.company, customer.company, "text"], ["vatNumber", t.checkout.vatNumber, customer.vatNumber, "text"]]} errors={errors} onChange={(key, value) => setCustomer((current) => ({ ...current, [key]: value }))} />}{step === "shipping" && <Fields fields={[["address1", t.checkout.address1, shipping.address1, "text"], ["address2", t.checkout.address2, shipping.address2, "text"], ["postalCode", t.checkout.postalCode, shipping.postalCode, "text"], ["city", t.checkout.city, shipping.city, "text"], ["country", t.checkout.country, shipping.country, "text"]]} errors={errors} onChange={(key, value) => setShipping((current) => ({ ...current, [key]: value }))} />}{step === "method" && <ShippingMethodPicker t={t} money={money} subtotal={totals.subtotal - totals.discount} shippingMethod={shippingMethod} setShippingMethod={setShippingMethod} />}{step === "payment" && <div className="border border-lynx-graphite p-5"><h3 className="font-semibold">{t.checkout.paypal}</h3><p className="mt-2 text-sm text-lynx-granite">{t.checkout.paypalText}</p></div>}{step === "review" && <><OrderReview t={t} money={money} customer={customer} shipping={shipping} shippingMethod={shippingMethod} cart={cart} totals={totals} /><div className="mt-6 border border-lynx-graphite p-4"><PayPalButton t={t} cart={cart} customer={customer} shipping={shipping} shippingMethod={shippingMethod} discount={discount} locale={locale} setPaymentError={setPaymentError} onComplete={onPayPalComplete} /></div></>}{step === "confirmation" && order && <OrderConfirmation order={order} t={t} money={money} onFinish={onFinish} />}{paymentError && <p className="mt-4 text-xs text-red-300">{paymentError}</p>}{step !== "confirmation" && <div className="mt-8 flex justify-between border-t border-lynx-graphite pt-5"><button onClick={backStep} className="border border-lynx-graphite px-5 py-3 text-xs uppercase tracking-wider">{t.checkout.back}</button>{step !== "review" && <button onClick={nextStep} className="bg-lynx-forest px-5 py-3 text-xs uppercase tracking-wider">{t.checkout.continue}</button>}</div>}</div></div></div>
}

function PayPalButton({ t, cart, customer, shipping, shippingMethod, discount, locale, setPaymentError, onComplete }: { t: Copy; cart: CartItem[]; customer: CustomerInfo; shipping: ShippingInfo; shippingMethod: ShippingMethodId; discount: Discount | null; locale: Locale; setPaymentError: (value: string) => void; onComplete: (paypalOrderId: string, paypalCaptureId: string) => Promise<void> }) {
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let closed = false
    const id = "paypal-sdk"
    const render = () => {
      if (!window.paypal || !containerRef.current || closed) return
      containerRef.current.innerHTML = ""
      window.paypal.Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
        createOrder: async () => {
          setPaymentError("")
          const response = await fetch("/api/paypal/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cart, customer, shipping, shippingMethod, discountCode: discount?.code ?? null, language: locale }) })
          const data = await response.text().then((text) => {
            try { return text ? JSON.parse(text) as { ok?: boolean; orderID?: string } : null } catch (error) { console.error("PayPal create-order returned non-JSON", error); return null }
          })
          if (!response.ok || data?.ok !== true || !data.orderID) throw new Error(t.validation.paypal)
          return data.orderID
        },
        onApprove: async (data) => {
          const response = await fetch("/api/paypal/capture-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderID: data.orderID }) })
          const capture = await response.text().then((text) => {
            try { return text ? JSON.parse(text) as { ok?: boolean; id?: string; captureId?: string } : null } catch (error) { console.error("PayPal capture returned non-JSON", error); return null }
          })
          if (!response.ok || capture?.ok !== true || !capture.id || !capture.captureId) throw new Error(t.validation.paypal)
          await onComplete(capture.id, capture.captureId)
        },
        onCancel: () => setPaymentError(""),
        onError: (error) => {
          console.error("PayPal button error", error)
          setPaymentError(t.validation.paypal)
        },
      }).render(`#${containerRef.current.id}`)
    }
    if (window.paypal) render()
    else if (!document.getElementById(id)) {
      const script = document.createElement("script")
      script.id = id
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR&intent=capture`
      script.onload = render
      script.onerror = () => setPaymentError(t.validation.paypal)
      document.body.appendChild(script)
    } else {
      const existing = document.getElementById(id) as HTMLScriptElement
      existing.addEventListener("load", render)
    }
    return () => { closed = true }
  }, [cart, customer, shipping, shippingMethod, discount, locale, onComplete, setPaymentError, t.validation.paypal])
  return <div><p className="mb-3 text-sm text-lynx-granite">{t.checkout.payWithPaypal}</p><div id="paypal-buttons" ref={containerRef} /></div>
}

function ShippingMethodPicker({ t, money, subtotal, shippingMethod, setShippingMethod }: { t: Copy; money: (amount: number) => string; subtotal: number; shippingMethod: ShippingMethodId; setShippingMethod: (method: ShippingMethodId) => void }) {
  return <div className="grid gap-3">{shippingMethods.map((method) => <button key={method.id} onClick={() => setShippingMethod(method.id)} className={`border p-4 text-left ${shippingMethod === method.id ? "border-lynx-chalk" : "border-lynx-graphite"}`}><span className="font-semibold">{t.checkout[method.id]}</span><span className="float-right">{subtotal >= 100 && method.id === "standard" ? t.checkout.free : money(method.price)}</span><p className="mt-1 text-sm text-lynx-granite">{t.checkout[`${method.id}Desc` as "standardDesc" | "expressDesc" | "pickupDesc"]}</p></button>)}</div>
}

function OrderReview({ t, money, customer, shipping, shippingMethod, cart, totals }: { t: Copy; money: (amount: number) => string; customer: CustomerInfo; shipping: ShippingInfo; shippingMethod: ShippingMethodId; cart: CartItem[]; totals: Totals }) {
  return <div className="grid gap-6 text-sm"><div className="grid gap-4 md:grid-cols-3"><ReviewBox title={t.checkout.customer} text={`${customer.firstName} ${customer.lastName}\n${customer.email}`} /><ReviewBox title={t.checkout.shippingAddress} text={shippingMethod === "pickup" ? t.checkout.pickup : `${shipping.address1}\n${shipping.postalCode} ${shipping.city}\n${shipping.country}`} /><ReviewBox title={t.checkout.paymentMethod} text={`${t.checkout.paypal}\n${t.checkout[shippingMethod]}`} /></div><div className="border border-lynx-graphite p-4"><h3 className="mb-3 font-semibold">{t.nav.shop}</h3>{cart.map((item) => { const product = getProductById(item.productId); if (!product) return null; return <div key={item.productId} className="grid grid-cols-[64px_1fr_auto] items-center gap-3 border-b border-lynx-graphite py-3 last:border-0"><ProductImage product={product} /><div><p>{product.name} x {item.qty}</p><p className="text-xs text-lynx-granite">{product.sku} / {t.shop.size} {product.size}</p></div><span>{money(product.price * item.qty)}</span></div> })}</div><div className="ml-auto w-full max-w-sm"><TotalsView t={t} money={money} totals={totals} /><p className="mt-3 text-xs text-lynx-granite">{t.cart.vatNote}</p></div></div>
}

function ReviewBox({ title, text }: { title: string; text: string }) {
  return <div className="border border-lynx-graphite p-4"><h3 className="mb-2 font-semibold">{title}</h3><p className="whitespace-pre-line text-lynx-granite">{text}</p></div>
}

function OrderConfirmation({ order, t, money, onFinish }: { order: PaidOrder; t: Copy; money: (amount: number) => string; onFinish: () => void }) {
  return <div className="text-center"><CheckCircle className="mx-auto mb-5 h-12 w-12 text-emerald-300" /><h3 className="text-2xl font-bold uppercase tracking-wide">{t.checkout.orderConfirmed}</h3>{order.emailWarning && <p className="mx-auto mt-4 max-w-xl border border-yellow-500/40 p-3 text-sm text-yellow-200">{t.checkout.notificationWarning}</p>}<div className="mx-auto mt-8 max-w-2xl border border-lynx-graphite p-5 text-left text-sm"><div className="grid gap-2 md:grid-cols-2"><p>{t.checkout.order}: {order.orderNumber}</p><p>{t.checkout.payment}: {order.paymentStatus}</p><p>{t.checkout.paypalOrder}: {order.paypalOrderId}</p><p>{t.checkout.paypalCapture}: {order.paypalCaptureId}</p><p>{t.checkout.email}: {order.customer.email}</p><p>{t.checkout.shippingMethod}: {t.checkout[order.shippingMethod]}</p></div><p className="mt-4 text-lynx-granite"><strong className="text-lynx-chalk">{t.checkout.nextSteps}: </strong>{t.checkout.nextStepsText}</p><div className="mt-5 space-y-3 border-t border-lynx-graphite pt-4">{order.items.map((item) => { const product = getProductById(item.productId); if (!product) return null; return <div key={item.productId} className="grid grid-cols-[64px_1fr_auto] items-center gap-3"><ProductImage product={product} /><div><p className="font-semibold">{product.name}</p><p className="text-xs text-lynx-granite">{product.sku} / {t.shop.size} {product.size}</p></div><p>x {item.qty}</p></div> })}</div><div className="mt-5 border-t border-lynx-graphite pt-4"><TotalsView t={t} money={money} totals={order.totals} /></div></div><button onClick={onFinish} className="mt-8 bg-lynx-forest px-6 py-3 text-xs uppercase tracking-wider">{t.checkout.clearOrder}</button></div>
}

function Fields({ fields, errors, onChange }: { fields: [string, string, string, string, string?][]; errors: Record<string, string>; onChange: (key: string, value: string) => void }) {
  return <div className="grid gap-4 md:grid-cols-2">{fields.map(([key, label, value, type, name]) => <label key={key} className="text-sm text-lynx-granite">{label}<input name={name ?? key} required={["name", "email", "company", "country", "orderType", "quantity", "categories", "firstName", "lastName", "address1", "postalCode", "city"].includes(key)} type={type} value={value} onChange={(event) => onChange(key, event.target.value)} className="mt-2 h-11 w-full bg-lynx-charcoal px-3 text-lynx-chalk outline-none ring-1 ring-lynx-graphite focus:ring-lynx-granite" />{errors[key] && <span className="mt-1 block text-xs text-red-400">{errors[key]}</span>}</label>)}</div>
}

function TotalsView({ t, money, totals }: { t: Copy; money: (amount: number) => string; totals: Totals }) {
  return <div className="space-y-2 text-sm"><div className="flex justify-between"><span>{t.cart.subtotal}</span><span>{money(totals.subtotal)}</span></div><div className="flex justify-between"><span>{t.cart.discount}</span><span>-{money(totals.discount)}</span></div><div className="flex justify-between"><span>{t.cart.vat}</span><span>{money(totals.vat)}</span></div><div className="flex justify-between"><span>{t.cart.shipping}</span><span>{money(totals.shipping)}</span></div><div className="flex justify-between border-t border-lynx-graphite pt-3 text-lg font-semibold"><span>{t.cart.total}</span><span>{money(totals.total)}</span></div></div>
}

function FormsSection(props: { t: Copy; quote: QuoteInfo; setQuote: React.Dispatch<React.SetStateAction<QuoteInfo>>; contact: ContactInfo; setContact: React.Dispatch<React.SetStateAction<ContactInfo>>; cart: CartItem[]; quoteSent: boolean; quoteSending: boolean; submitQuote: () => void; contactSent: boolean; contactSending: boolean; submitContact: () => void; quoteErrors: Record<string, string>; contactErrors: Record<string, string> }) {
  const { t, quote, setQuote, contact, setContact, cart, quoteSent, quoteSending, submitQuote, contactSent, contactSending, submitContact, quoteErrors, contactErrors } = props
  const cartText = quote.includeCart ? cart.map((item) => { const product = getProductById(item.productId); return product ? `${product.sku} x ${item.qty}` : `${item.productId} x ${item.qty}` }).join(", ") : ""
  return (
    <>
      <section id="b2b" className="border-b border-lynx-graphite py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold uppercase tracking-normal">{t.sections.b2bTitle}</h2>
          <p className="mt-4 max-w-3xl text-lynx-granite">{t.sections.b2bText}</p>
          {quoteSent ? (
            <Sent t={t} />
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); submitQuote() }} className="mt-8 grid gap-4 md:grid-cols-2">
              <Fields 
                fields={[
                  ["name", t.b2b.name, quote.name, "text", "name"], 
                  ["email", t.b2b.email, quote.email, "email", "email"], 
                  ["company", t.b2b.company, quote.company, "text", "company"], 
                  ["country", t.b2b.country, quote.country, "text", "country"], 
                  ["orderType", t.b2b.orderType, quote.orderType, "text", "order_type"], 
                  ["quantity", t.b2b.quantity, quote.quantity, "number", "estimated_quantity"], 
                  ["categories", t.b2b.categories, quote.categories, "text", "product_categories"]
                ]} 
                errors={quoteErrors} 
                onChange={(key, value) => setQuote((current) => ({ ...current, [key]: value }))} 
              />
              <label className="text-sm text-lynx-granite md:col-span-2">
                {t.b2b.message}
                <textarea 
                  required 
                  name="message" 
                  value={quote.message} 
                  onChange={(event) => setQuote((current) => ({ ...current, message: event.target.value }))} 
                  className="mt-2 min-h-28 w-full bg-lynx-charcoal p-3 text-lynx-chalk outline-none ring-1 ring-lynx-graphite focus:ring-lynx-granite" 
                />
                {quoteErrors.message && <span className="mt-1 block text-xs text-red-400">{quoteErrors.message}</span>}
              </label>
              <label className="flex items-center gap-3 text-sm text-lynx-granite md:col-span-2">
                <input 
                  type="checkbox" 
                  checked={quote.includeCart} 
                  onChange={(event) => setQuote((current) => ({ ...current, includeCart: event.target.checked }))} 
                  className="h-4 w-4 accent-lynx-forest"
                />
                {t.b2b.includeCart} ({cart.length})
              </label>
              {quote.includeCart && cartText && (
                <input type="hidden" name="cart_items" value={cartText} />
              )}
              <button 
                type="submit" 
                disabled={quoteSending} 
                className="bg-lynx-forest px-5 py-3 text-xs uppercase tracking-wider hover:bg-[#174936] disabled:opacity-60 md:col-span-2"
              >
                {quoteSending ? t.b2b.sending : t.b2b.submit}
              </button>
            </form>
          )}
        </div>
      </section>
      <section id="support" className="border-b border-lynx-graphite py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold uppercase tracking-normal">{t.sections.supportTitle}</h2>
          <p className="mt-4 max-w-3xl text-lynx-granite">{t.sections.supportText}</p>
          {contactSent ? (
            <Sent t={t} />
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); submitContact() }} className="mt-8 grid max-w-xl gap-4">
              <label className="text-sm text-lynx-granite">
                {t.b2b.name}
                <input 
                  type="text" 
                  name="name"
                  required 
                  value={contact.name} 
                  onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))} 
                  className="mt-2 h-11 w-full bg-lynx-charcoal px-3 text-lynx-chalk outline-none ring-1 ring-lynx-graphite focus:ring-lynx-granite" 
                />
                {contactErrors.name && <span className="mt-1 block text-xs text-red-400">{contactErrors.name}</span>}
              </label>
              <label className="text-sm text-lynx-granite">
                {t.b2b.email}
                <input 
                  type="email" 
                  name="email"
                  required 
                  value={contact.email} 
                  onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))} 
                  className="mt-2 h-11 w-full bg-lynx-charcoal px-3 text-lynx-chalk outline-none ring-1 ring-lynx-graphite focus:ring-lynx-granite" 
                />
                {contactErrors.email && <span className="mt-1 block text-xs text-red-400">{contactErrors.email}</span>}
              </label>
              <label className="text-sm text-lynx-granite">
                {t.b2b.message}
                <textarea 
                  name="message"
                  required 
                  value={contact.message} 
                  onChange={(event) => setContact((current) => ({ ...current, message: event.target.value }))} 
                  className="mt-2 min-h-28 w-full bg-lynx-charcoal p-3 text-lynx-chalk outline-none ring-1 ring-lynx-graphite focus:ring-lynx-granite" 
                />
                {contactErrors.message && <span className="mt-1 block text-xs text-red-400">{contactErrors.message}</span>}
              </label>
              <button 
                type="submit" 
                disabled={contactSending} 
                className="bg-lynx-forest px-5 py-3 text-xs uppercase tracking-wider hover:bg-[#174936] disabled:opacity-60"
              >
                {contactSending ? t.b2b.sending : t.b2b.submit}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}

function Sent({ t }: { t: Copy }) {
  return <div className="mt-6 border border-lynx-graphite bg-lynx-charcoal p-6"><CheckCircle className="mb-4 h-9 w-9 text-emerald-300" /><h3 className="text-lg font-semibold uppercase tracking-wide">{t.b2b.success}</h3></div>
}

function Footer({ t }: { t: Copy }) {
  const links = [["shop", t.nav.shop], ["collection", t.nav.collection], ["brand", t.nav.brand], ["b2b", t.nav.b2b], ["support", t.nav.support]]
  return <footer className="py-10"><div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-[auto_1fr_auto] md:items-center"><Logo variant="full" size="footer" /><p className="max-w-2xl text-sm leading-6 text-lynx-granite">{t.sections.footerText}</p><nav className="flex flex-wrap gap-4 text-xs uppercase tracking-wider text-lynx-granite">{links.map(([id, label]) => <a key={id} href={`#${id}`} className="hover:text-lynx-chalk">{label}</a>)}</nav></div></footer>
}

function orderMessage(order: PaidOrder, language: string) {
  const items = order.items.map((item) => { const product = getProductById(item.productId); return product ? `${product.name} (${product.sku}) x ${item.qty} @ EUR ${product.price}` : `${item.productId} x ${item.qty}` }).join("\n")
  return `Order number: ${order.orderNumber}
PayPal order ID: ${order.paypalOrderId}
PayPal capture ID: ${order.paypalCaptureId}
Customer: ${order.customer.firstName} ${order.customer.lastName} <${order.customer.email}>
Shipping: ${order.shippingMethod} ${order.shipping.address1} ${order.shipping.postalCode} ${order.shipping.city} ${order.shipping.country}
Items:
${items}
Subtotal: EUR ${order.totals.subtotal}
Discount: EUR ${order.totals.discount}
Shipping: EUR ${order.totals.shipping}
VAT estimate: EUR ${order.totals.vat}
Total: EUR ${order.totals.total}
Language: ${language}
Timestamp: ${new Date().toISOString()}`
}

function quoteMessage(quote: QuoteInfo, cart: CartItem[], language: string) {
  const cartText = quote.includeCart ? cart.map((item) => { const product = getProductById(item.productId); return product ? `${product.sku} x ${item.qty}` : `${item.productId} x ${item.qty}` }).join(", ") : "Not included"
  return `Name: ${quote.name}
Email: ${quote.email}
Company/gym: ${quote.company}
Country: ${quote.country}
Order type: ${quote.orderType}
Estimated quantity: ${quote.quantity}
Selected product categories: ${quote.categories}
Message: ${quote.message}
Current cart items: ${cartText}
Language: ${language}
Timestamp: ${new Date().toISOString()}`
}

function JsonLd() {
  const siteUrl = "https://lynxclimbing.com"
  const productSchemas = products.map((product) => ({
    "@type": "Product",
    "@id": `${siteUrl}/products/${product.slug}#product`,
    name: product.name,
    sku: product.sku,
    image: product.images.map((image) => `${siteUrl}${image}`),
    description: product.shortDescription,
    category: `${product.category} climbing holds`,
    brand: { "@type": "Brand", name: "Lynx Climbing" },
    url: `${siteUrl}/products/${product.slug}`,
    offers: { "@type": "Offer", price: product.price.toFixed(2), priceCurrency: "EUR", availability: product.stockQty > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", itemCondition: "https://schema.org/NewCondition", url: `${siteUrl}/products/${product.slug}` },
  }))
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: "Lynx Climbing", url: siteUrl, logo: `${siteUrl}/images/lynx-logo.png`, email: "nuno.pereira.prof@gmail.com", description: "Premium technical climbing holds inspired by the Iberian lynx and Serra de Sintra granite." },
      { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: "Lynx Climbing", url: siteUrl, description: "Premium resin climbing holds, bouldering holds and route setting equipment.", publisher: { "@id": `${siteUrl}/#organization` }, potentialAction: { "@type": "SearchAction", target: `${siteUrl}/#shop?q={search_term_string}`, "query-input": "required name=search_term_string" } },
      { "@type": "BreadcrumbList", "@id": `${siteUrl}/#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Sintra Granite Collection", item: `${siteUrl}/collections/serra-de-sintra` }] },
      { "@type": "ItemList", "@id": `${siteUrl}/#sintra-products`, name: "Sintra Granite Collection", numberOfItems: products.length, itemListElement: products.map((product, index) => ({ "@type": "ListItem", position: index + 1, url: `${siteUrl}/products/${product.slug}`, item: { "@id": `${siteUrl}/products/${product.slug}#product`, name: product.name, sku: product.sku } })) },
      ...productSchemas,
    ],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}







