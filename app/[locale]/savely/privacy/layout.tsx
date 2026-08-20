import type React from "react"

import { routeMetadata } from "../../_route-metadata"

export const generateMetadata = routeMetadata({
  path: "/savely/privacy/",
  namespace: "legal",
  titleKey: "savelyPrivacy.title",
  descriptionKey: "savelyPrivacy.metaDescription",
})

export default function SavelyPrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
