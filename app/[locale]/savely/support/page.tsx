"use client"

import { useParams } from "next/navigation"
import SupportShell, { type SupportContent } from "@/components/support-shell"

type Lang = "en" | "es"

const CONTENT: Record<Lang, SupportContent> = {
  en: {
    name: "Savely",
    crest: "S",
    navLabel: "Savely · Support",
    footMeta: "Savely — Support desk · 2025",

    heroEye: "Support · v1.8",
    heroTitle: "A calm <em>answer</em> to every question.",
    heroLede:
      "Savely is a quiet place for your money. If something looks off — a missing transaction, a chart that won't load, a bank that dropped — tell us. We'll sort it out, patiently.",

    contactTitle: "Reach <em>us.</em>",
    contactSub:
      "Questions about your account, a bank connection, or something simpler. All roads lead to the same desk.",
    contacts: [
      {
        kind: "email",
        label: "Email",
        value: "ivanlorenzana@outlook.com",
        hint: "Mon–Fri · Replies within 24h.",
        href: "mailto:ivanlorenzana@outlook.com",
      },
      {
        kind: "bank",
        label: "Bank connection",
        value: "Can't <em>link</em> a bank?",
        hint: "Most issues are fixed in under an hour.",
        href: "mailto:ivanlorenzana@outlook.com?subject=Bank%20connection%20help",
      },
      {
        kind: "security",
        label: "Security concern",
        value: "See something <em>odd?</em>",
        hint: "Reported within 2 hours. 24/7.",
        href: "mailto:ivanlorenzana@outlook.com",
      },
      {
        kind: "docs",
        label: "Help centre",
        value: "Guides &amp; articles",
        hint: "Setup, budgets, categories, exports.",
        href: "#",
      },
    ],

    faqTitle: "Common <em>questions.</em>",
    faqSub: "If yours isn't here, write in. We answer each one by hand.",
    faq: [
      {
        q: "Is my bank data safe with Savely?",
        a: "Yes. Savely uses read-only bank connections via regulated aggregators. We never see or store your banking credentials. All data at rest is encrypted, and we never sell or share information with third parties.",
      },
      {
        q: "Why can't I connect my bank?",
        a: "Most often it's a temporary outage at the aggregator. Try again in ~30 minutes. If it persists, <a href='mailto:ivanlorenzana@outlook.com'>email us</a> with your bank name and country — we'll chase it down.",
      },
      {
        q: "Can I export my data?",
        a: "Yes. <em>Settings → Data → Export</em>. You'll get a CSV of all your transactions, categories, and budgets. Nothing is kept hostage.",
      },
      {
        q: "How do budgets roll over at month end?",
        a: "Unspent amounts either carry to next month or reset — your call. Set it per budget in <em>Budget → Options → Rollover</em>. The default is reset.",
      },
      {
        q: "Does Savely work outside Europe?",
        a: "Partial. EU, UK, and US banks work well. Canada and Australia are in public beta. Other regions — get in touch and we'll tell you honestly whether we can connect.",
      },
    ],

    statusTitle: "Current <em>state.</em>",
    statusSub: "Version, platform, response times, and system status.",
    status: [
      { k: "Version", v: "1.8.0" },
      { k: "Platform", v: "iOS 16+" },
      { k: "Reply time", v: "~ 14 hours" },
      { k: "Systems", v: "All good", ok: true },
    ],

    ctaTitle: "Still <em>stuck?</em>",
    ctaSub: "Write to us directly. A small team, real replies, patient answers.",
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
    name: "Savely",
    crest: "S",
    navLabel: "Savely · Soporte",
    footMeta: "Savely — Mesa de soporte · 2025",

    heroEye: "Soporte · v1.8",
    heroTitle: "Una respuesta <em>serena</em> a cada pregunta.",
    heroLede:
      "Savely es un lugar tranquilo para tu dinero. Si algo no cuadra — una transacción faltante, una gráfica que no carga, un banco que se desconectó — dinos. Lo resolvemos, con paciencia.",

    contactTitle: "Háblanos.",
    contactSub:
      "Preguntas sobre tu cuenta, una conexión bancaria, o algo más simple. Todos los caminos llegan al mismo escritorio.",
    contacts: [
      {
        kind: "email",
        label: "Correo",
        value: "ivanlorenzana@outlook.com",
        hint: "Lun–Vie · Respondemos en 24h.",
        href: "mailto:ivanlorenzana@outlook.com",
      },
      {
        kind: "bank",
        label: "Conexión bancaria",
        value: "¿No puedes <em>vincular</em> un banco?",
        hint: "La mayoría se resuelve en menos de una hora.",
        href: "mailto:ivanlorenzana@outlook.com?subject=Bank%20connection%20help",
      },
      {
        kind: "security",
        label: "Asunto de seguridad",
        value: "¿Viste algo <em>extraño?</em>",
        hint: "Reportado en menos de 2 horas. 24/7.",
        href: "mailto:ivanlorenzana@outlook.com",
      },
      {
        kind: "docs",
        label: "Centro de ayuda",
        value: "Guías y artículos",
        hint: "Configuración, presupuestos, categorías, exportaciones.",
        href: "#",
      },
    ],

    faqTitle: "Preguntas <em>comunes.</em>",
    faqSub: "Si la tuya no está, escríbenos. Respondemos cada una a mano.",
    faq: [
      {
        q: "¿Están seguros mis datos bancarios con Savely?",
        a: "Sí. Savely usa conexiones de solo lectura vía agregadores regulados. Nunca vemos ni almacenamos tus credenciales bancarias. Todos los datos en reposo están cifrados, y nunca vendemos ni compartimos información con terceros.",
      },
      {
        q: "¿Por qué no puedo conectar mi banco?",
        a: "La mayoría de las veces es una caída temporal del agregador. Intenta de nuevo en ~30 minutos. Si persiste, <a href='mailto:ivanlorenzana@outlook.com'>escríbenos</a> con el nombre de tu banco y país — lo perseguimos.",
      },
      {
        q: "¿Puedo exportar mis datos?",
        a: "Sí. <em>Ajustes → Datos → Exportar</em>. Obtendrás un CSV con todas tus transacciones, categorías y presupuestos. Nada queda de rehén.",
      },
      {
        q: "¿Cómo funcionan los presupuestos al fin de mes?",
        a: "Los montos sin usar pueden trasladarse al siguiente mes o resetearse — tú decides. Configúralo por presupuesto en <em>Presupuesto → Opciones → Rollover</em>. El default es resetear.",
      },
      {
        q: "¿Funciona Savely fuera de Europa?",
        a: "Parcialmente. Bancos de la UE, Reino Unido y EE.UU. funcionan bien. Canadá y Australia están en beta. Otras regiones — escríbenos y te decimos honestamente si podemos conectar.",
      },
    ],

    statusTitle: "Estado <em>actual.</em>",
    statusSub: "Versión, plataforma, tiempos de respuesta y estado de sistemas.",
    status: [
      { k: "Versión", v: "1.8.0" },
      { k: "Plataforma", v: "iOS 16+" },
      { k: "Respuesta", v: "~ 14 horas" },
      { k: "Sistemas", v: "Todo bien", ok: true },
    ],

    ctaTitle: "¿Sigues <em>atorado?</em>",
    ctaSub: "Escríbenos directo. Un equipo pequeño, respuestas reales, con paciencia.",
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

export default function SavelySupportPage() {
  const params = useParams()
  const locale = (((params?.locale as string) || "en") === "es" ? "es" : "en") as Lang
  return <SupportShell appKey="savely" locale={locale} content={CONTENT[locale]} />
}
