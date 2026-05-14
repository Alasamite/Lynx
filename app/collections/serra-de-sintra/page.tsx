import type { Metadata } from "next"
import HomePage from "@/app/page"
import { collectionDescription } from "@/lib/store-products"

export const metadata: Metadata = {
  title: "Sintra Granite Collection | Lynx Climbing Holds",
  description: collectionDescription,
}

export default function SintraGraniteCollectionPage() {
  return <HomePage />
}
