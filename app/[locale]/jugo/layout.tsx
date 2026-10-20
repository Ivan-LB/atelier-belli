import type React from "react"

import { routeMetadata } from "../_route-metadata"

export const generateMetadata = routeMetadata({
  path: "/jugo/",
  namespace: "jugo",
  titleKey: "meta.title",
  descriptionKey: "meta.description",
  ogImage: { url: "/og-jugo.png", altKey: "meta.ogAlt" },
})

export default function JugoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
