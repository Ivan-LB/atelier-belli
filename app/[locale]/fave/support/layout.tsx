import type React from "react"

import { routeMetadata } from "../../_route-metadata"

export const generateMetadata = routeMetadata({
  path: "/fave/support/",
  namespace: "support",
  titleKey: "fave.metaTitle",
  descriptionKey: "fave.metaDescription",
})

export default function FaveSupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
