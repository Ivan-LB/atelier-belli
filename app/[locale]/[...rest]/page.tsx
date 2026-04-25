import { notFound } from "next/navigation"
import { unstable_setRequestLocale } from "next-intl/server"

export default async function CatchAllNotFound({
  params,
}: {
  params: Promise<{ locale: string; rest: string[] }>
}) {
  const { locale } = await params
  unstable_setRequestLocale(locale)
  notFound()
}
