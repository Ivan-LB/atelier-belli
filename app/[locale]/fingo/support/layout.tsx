import type React from "react"

import { routeMetadata } from "../../_route-metadata"

export const generateMetadata = routeMetadata({
  path: "/fingo/support/",
  namespace: "support",
  titleKey: "fingo.metaTitle",
  descriptionKey: "fingo.metaDescription",
})

export default function FingoSupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
