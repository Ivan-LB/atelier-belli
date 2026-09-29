import type React from "react"

import { routeMetadata } from "../../_route-metadata"

export const generateMetadata = routeMetadata({
  path: "/alisio/support/",
  namespace: "support",
  titleKey: "alisio.metaTitle",
  descriptionKey: "alisio.metaDescription",
})

export default function AlisioSupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
