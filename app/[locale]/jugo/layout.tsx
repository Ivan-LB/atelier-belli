import type React from "react"

import { routeMetadata } from "../_route-metadata"

export const generateMetadata = routeMetadata({
  path: "/jugo/",
  namespace: "jugo",
  titleKey: "meta.title",
  descriptionKey: "meta.description",
})

export default function JugoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
