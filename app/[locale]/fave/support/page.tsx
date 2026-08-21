"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import SupportShell, { type SupportContent } from "@/components/support-shell"

const CONTACT_KINDS = ["email", "sync", "artwork", "bug"] as const

export default function FaveSupportPage() {
  const t = useTranslations("support.fave")

  const content = useMemo<SupportContent>(
    () => ({
      name: t("name"),
      navLabel: t("navLabel"),
      footMeta: t("footMeta"),

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

      facts: t.raw("facts") as Array<{ k: string; v: string; ok?: boolean }>,

      ctaTitle: t.raw("cta.titleHtml") as string,
      ctaSub: t("cta.sub"),
      ctaLabel: t("cta.label"),
      ctaHref: t("cta.href"),

      privacyLabel: t("privacyLabel"),
      privacyHref: "/fave/privacy",
      termsLabel: t("termsLabel"),
      backLabel: t("backLabel"),
    }),
    [t],
  )

  return <SupportShell appKey="fave" content={content} />
}
