import type React from "react"

import { routeMetadata } from "../../_route-metadata"

export const generateMetadata = routeMetadata({
  path: "/privacy/choices/",
  namespace: "legal",
  titleKey: "privacyChoices.title",
  descriptionKey: "privacyChoices.metaDescription",
})

export default function PrivacyChoicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
