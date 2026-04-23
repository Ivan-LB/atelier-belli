"use client"

import { useParams } from "next/navigation"
import SupportShell, { type SupportContent } from "@/components/support-shell"

type Lang = "en" | "es"

const CONTENT: Record<Lang, SupportContent> = {
  en: {
    name: "Fingo",
    crest: "F",
    navLabel: "Fingo · Support",
    footMeta: "Fingo — Support desk · 2025",

    heroEye: "Support · v2.1.0",
    heroTitle: "How can we <em>help?</em>",
    heroLede:
      "Fingo is a tiny app for deciding who pays, who goes first, who picks the music. If something doesn't work the way it should — write to us. A real person reads every message.",

    contactTitle: "Get in <em>touch.</em>",
    contactSub: "Choose what suits you best. Everything routes to the same desk.",
    contacts: [
      {
        kind: "email",
        label: "Email",
        value: "ivanlorenzana@outlook.com",
        hint: "Replies within 24h, usually sooner.",
        href: "mailto:ivanlorenzana@outlook.com",
      },
      {
        kind: "bug",
        label: "Report a bug",
        value: "<em>Something</em> broken?",
        hint: "A short note + screenshot goes a long way.",
        href: "mailto:ivanlorenzana@outlook.com?subject=Fingo%20bug%20report",
      },
      {
        kind: "feature",
        label: "Request a feature",
        value: "Imagine <em>better.</em>",
        hint: "We read all of them. Some ship.",
        href: "mailto:ivanlorenzana@outlook.com?subject=Fingo%20wishlist",
      },
      {
        kind: "docs",
        label: "Help centre",
        value: "Guides &amp; tips",
        hint: "Quick guides for the most common flows.",
        href: "#",
      },
    ],

    faqTitle: "Questions <em>we hear.</em>",
    faqSub: "The ones that come up most. If yours isn't here, just write.",
    faq: [
      {
        q: "Does Fingo share my contacts or data?",
        a: "No. Fingo doesn't ship your contacts, choices, or results anywhere. Everything lives on your device; there's no account and no server to leak. If you delete the app, nothing stays behind.",
      },
      {
        q: "Why do I need to enable haptics?",
        a: "Because half of Fingo's joy is the click. You can turn them off in <em>Settings → Feedback</em>, but we'd suggest trying a spin with them on at least once.",
      },
      {
        q: "Can I use Fingo without an internet connection?",
        a: "Yes — completely. Fingo is fully offline. The only time the internet is touched is if you share a result as a card via Messages or Mail.",
      },
      {
        q: "Where do I restore a purchase?",
        a: "Settings → About → Restore Purchases. You'll need to be signed into the same Apple ID you used when buying. If it still doesn't work, <a href='mailto:ivanlorenzana@outlook.com'>email us</a>.",
      },
      {
        q: "Is there an Android version?",
        a: "Not yet. Fingo is SwiftUI-native and we want to keep the animation and haptic quality at the standard it is. An Android port is on the table but not promised.",
      },
    ],

    statusTitle: "Everything <em>running.</em>",
    statusSub: "Current version, platform, and how quickly we get back.",
    status: [
      { k: "Version", v: "2.1.0" },
      { k: "Platform", v: "iOS 26+" },
      { k: "Reply time", v: "~ 18 hours" },
      { k: "Systems", v: "All good", ok: true },
    ],

    ctaTitle: "Still <em>stuck?</em>",
    ctaSub: "Write to us directly.",
    ctaLabel: "ivanlorenzana@outlook.com",
    ctaHref: "mailto:ivanlorenzana@outlook.com",

    sectionLabels: {
      contact: "01 — Contact",
      faq: "02 — Frequent questions",
      status: "03 — Status",
    },

    privacyLabel: "Privacy",
    termsLabel: "Terms",
    backLabel: "Atelier Belli",
  },
  es: {
    name: "Fingo",
    crest: "F",
    navLabel: "Fingo · Soporte",
    footMeta: "Fingo — Mesa de soporte · 2025",

    heroEye: "Soporte · v2.1.0",
    heroTitle: "¿Cómo podemos <em>ayudar?</em>",
    heroLede:
      "Fingo es una pequeña app para decidir quién paga, quién empieza, quién escoge la música. Si algo no funciona como debería — escríbenos. Una persona real lee cada mensaje.",

    contactTitle: "Estamos <em>aquí.</em>",
    contactSub: "Elige el canal que mejor te funcione. Todo llega al mismo escritorio.",
    contacts: [
      {
        kind: "email",
        label: "Correo",
        value: "ivanlorenzana@outlook.com",
        hint: "Respondemos en 24h, normalmente antes.",
        href: "mailto:ivanlorenzana@outlook.com",
      },
      {
        kind: "bug",
        label: "Reportar un error",
        value: "¿<em>Algo</em> se rompió?",
        hint: "Una nota breve y una captura ayudan mucho.",
        href: "mailto:ivanlorenzana@outlook.com?subject=Fingo%20bug%20report",
      },
      {
        kind: "feature",
        label: "Sugerir función",
        value: "Imagina <em>mejor.</em>",
        hint: "Las leemos todas. Algunas se publican.",
        href: "mailto:ivanlorenzana@outlook.com?subject=Fingo%20wishlist",
      },
      {
        kind: "docs",
        label: "Centro de ayuda",
        value: "Guías y consejos",
        hint: "Guías rápidas para los flujos más comunes.",
        href: "#",
      },
    ],

    faqTitle: "Preguntas <em>frecuentes.</em>",
    faqSub: "Las que más nos llegan. Si la tuya no está, solo escribe.",
    faq: [
      {
        q: "¿Fingo comparte mis contactos o datos?",
        a: "No. Fingo no envía tus contactos, elecciones, ni resultados a ningún lado. Todo vive en tu dispositivo; no hay cuenta ni servidor que filtre nada. Si borras la app, no queda rastro.",
      },
      {
        q: "¿Por qué necesito activar los háptics?",
        a: "Porque la mitad de la gracia de Fingo es el click. Puedes apagarlos en <em>Ajustes → Feedback</em>, pero te sugerimos probar al menos un giro con ellos.",
      },
      {
        q: "¿Puedo usar Fingo sin conexión a internet?",
        a: "Sí — completamente. Fingo es totalmente offline. Lo único que toca internet es cuando compartes un resultado como tarjeta por Mensajes o Mail.",
      },
      {
        q: "¿Dónde restauro una compra?",
        a: "Ajustes → Acerca de → Restaurar compras. Necesitas estar con el mismo Apple ID con el que compraste. Si aún así no funciona, <a href='mailto:ivanlorenzana@outlook.com'>escríbenos</a>.",
      },
      {
        q: "¿Hay versión para Android?",
        a: "Aún no. Fingo es nativo en SwiftUI y queremos mantener la calidad de animación y háptics al nivel que está. Un puerto a Android está sobre la mesa, pero no prometido.",
      },
    ],

    statusTitle: "Todo <em>funcionando.</em>",
    statusSub: "Versión actual, plataforma, y cuán rápido respondemos.",
    status: [
      { k: "Versión", v: "2.1.0" },
      { k: "Plataforma", v: "iOS 26+" },
      { k: "Respuesta", v: "~ 18 horas" },
      { k: "Sistemas", v: "Todo bien", ok: true },
    ],

    ctaTitle: "¿Sigues <em>atorado?</em>",
    ctaSub: "Escríbenos directo.",
    ctaLabel: "ivanlorenzana@outlook.com",
    ctaHref: "mailto:ivanlorenzana@outlook.com",

    sectionLabels: {
      contact: "01 — Contacto",
      faq: "02 — Preguntas frecuentes",
      status: "03 — Estado",
    },

    privacyLabel: "Privacidad",
    termsLabel: "Términos",
    backLabel: "Atelier Belli",
  },
}

export default function FingoSupportPage() {
  const params = useParams()
  const locale = (((params?.locale as string) || "en") === "es" ? "es" : "en") as Lang
  return <SupportShell appKey="fingo" locale={locale} content={CONTENT[locale]} />
}
