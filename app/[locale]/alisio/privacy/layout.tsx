import type React from "react"

import { routeMetadata } from "../../_route-metadata"

export const generateMetadata = routeMetadata({
  path: "/alisio/privacy/",
  namespace: "legal",
  titleKey: "alisioPrivacy.title",
  descriptionKey: "alisioPrivacy.metaDescription",
})

export default function AlisioPrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
