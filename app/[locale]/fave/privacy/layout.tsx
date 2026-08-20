import type React from "react"

import { routeMetadata } from "../../_route-metadata"

export const generateMetadata = routeMetadata({
  path: "/fave/privacy/",
  namespace: "legal",
  titleKey: "favePrivacy.title",
  descriptionKey: "favePrivacy.metaDescription",
})

export default function FavePrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
