import type React from "react"

import { routeMetadata } from "../../_route-metadata"

export const generateMetadata = routeMetadata({
  path: "/savely/support/",
  namespace: "support",
  titleKey: "savely.metaTitle",
  descriptionKey: "savely.metaDescription",
})

export default function SavelySupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
