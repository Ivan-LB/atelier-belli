import type React from "react"

import { routeMetadata } from "../_route-metadata"

export const generateMetadata = routeMetadata({
  path: "/privacy/",
  namespace: "legal",
  titleKey: "privacy.title",
  descriptionKey: "privacy.metaDescription",
})

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
