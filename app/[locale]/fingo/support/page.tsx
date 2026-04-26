"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import SupportShell, { type SupportContent } from "@/components/support-shell"

const CONTACT_KINDS = ["email", "bug", "feature", "docs"] as const

export default function FingoSupportPage() {
  const t = useTranslations("support.fingo")
  const params = useParams()
  const locale = (params?.locale as string) === "es" ? "es" : "en"

  const content = useMemo<SupportContent>(
    () => ({
      name: t("name"),
      crest: t("crest"),
      navLabel: t("navLabel"),
      footMeta: t("footMeta"),

      heroEye: t("hero.eye"),
      heroTitle: t.raw("hero.titleHtml") as string,
      heroLede: t("hero.lede"),

      contactTitle: t.raw("contact.titleHtml") as string,
      contactSub: t("contact.sub"),
      contacts: CONTACT_KINDS.map((kind) => ({
        kind,
        label: t(`contact.cards.${kind}.label`),
        value: t.raw(`contact.cards.${kind}.valueHtml`) as string,
        hint: t(`contact.cards.${kind}.hint`),
        href: t(`contact.cards.${kind}.href`),
      })),

      faqTitle: t.raw("faq.titleHtml") as string,
      faqSub: t("faq.sub"),
      faq: (t.raw("faq.items") as Array<{ q: string; aHtml: string }>).map(
        ({ q, aHtml }) => ({ q, a: aHtml }),
      ),

      statusTitle: t.raw("status.titleHtml") as string,
      statusSub: t("status.sub"),
      status: t.raw("status.rows") as Array<{ k: string; v: string; ok?: boolean }>,

      ctaTitle: t.raw("cta.titleHtml") as string,
      ctaSub: t("cta.sub"),
      ctaLabel: t("cta.label"),
      ctaHref: t("cta.href"),

      sectionLabels: {
        contact: t("sectionLabels.contact"),
        faq: t("sectionLabels.faq"),
        status: t("sectionLabels.status"),
      },

      privacyLabel: t("privacyLabel"),
      termsLabel: t("termsLabel"),
      backLabel: t("backLabel"),
    }),
    [t],
  )

  return <SupportShell appKey="fingo" locale={locale} content={content} />
}
