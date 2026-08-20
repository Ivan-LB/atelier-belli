import type React from "react"

import { routeMetadata } from "../_route-metadata"

export const generateMetadata = routeMetadata({
  path: "/terms/",
  namespace: "legal",
  titleKey: "terms.title",
  descriptionKey: "terms.metaDescription",
})

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
