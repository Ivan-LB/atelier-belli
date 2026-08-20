import type React from "react"

import { routeMetadata } from "../../_route-metadata"

export const generateMetadata = routeMetadata({
  path: "/fingo/privacy/",
  namespace: "legal",
  titleKey: "fingoPrivacy.title",
  descriptionKey: "fingoPrivacy.metaDescription",
})

export default function FingoPrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
