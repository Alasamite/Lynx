import type { Metadata } from "next"
import HomePage from "@/app/page"
import { getProductBySlug, products } from "@/lib/store-products"

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)
  return {
    title: product ? `${product.name} | Lynx Climbing` : "Product | Lynx Climbing",
    description: product?.shortDescription ?? "Lynx Climbing product detail.",
  }
}

export default function ProductPage() {
  return <HomePage />
}
