"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import {
  MailIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  ClockIcon,
  SmartphoneIcon,
  MessageCircleIcon,
} from "lucide-react"

type Lang = "en" | "es"

const t = {
  en: {
    back: "Back to Home",
    heroTitle: "Savely Support",
    heroSubtitle:
      "We're here to help you take control of your finances and reach your savings goals.",
    contactTitle: "Contact Us",
    emailHeading: "Email Support",
    emailDesc: "For general questions, technical issues, or feedback, reach us at:",
    emailNote: "We reply to all emails within 24–48 business hours.",
    hoursTitle: "Support Hours",
    hoursDesc: "Monday – Friday · 9 AM – 5 PM (your local time)",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        q: "The app crashed or isn't loading — what should I do?",
        a: "Force-close the app, then reopen it. If the issue persists, uninstall and reinstall from the App Store. Make sure your iOS is up to date.",
      },
      {
        q: "How do I reset my budget or savings goals?",
        a: "Open Savely, go to Settings (gear icon), and tap \"Reset All Data\". This will clear your budgets, goals, and transaction history.",
      },
      {
        q: "Is my financial data secure?",
        a: "Yes. Savely uses bank-level encryption to protect all your data. Your information is stored securely on your device and never sold to third parties.",
      },
      {
        q: "Can I use Savely offline?",
        a: "Yes! You can log expenses and view your budgets offline. Smart alerts and sync features require an internet connection.",
      },
      {
        q: "How do I set up a savings goal?",
        a: "Tap the \"+\" button on the Goals tab, enter a goal name, target amount, and deadline. Savely will automatically calculate how much you need to save each week.",
      },
    ],
    infoTitle: "Info to Include When Contacting Support",
    infoItems: [
      "Savely version (Settings → About)",
      "Device model & iOS version",
      "Detailed description of the issue",
      "Steps to reproduce the problem",
      "Screenshots or screen recording (if possible)",
    ],
    footer: "Thank you for your patience and cooperation!",
    rights: "All rights reserved.",
    privacyPolicy: "Privacy Policy",
    terms: "Terms & Conditions",
  },
  es: {
    back: "Volver al Inicio",
    heroTitle: "Soporte para Savely",
    heroSubtitle:
      "Estamos aquí para ayudarte a tomar el control de tus finanzas y alcanzar tus metas de ahorro.",
    contactTitle: "Contáctanos",
    emailHeading: "Soporte por Email",
    emailDesc: "Para consultas generales, problemas técnicos o feedback, escríbenos a:",
    emailNote:
      "Intentamos responder a todos los correos en un plazo de 24–48 horas hábiles.",
    hoursTitle: "Horario de Atención",
    hoursDesc: "Lunes – Viernes · 9 AM – 5 PM (Tu zona horaria)",
    faqTitle: "Preguntas Frecuentes",
    faqs: [
      {
        q: "La app se cerró o no carga — ¿qué hago?",
        a: "Cierra y vuelve a abrir la app. Si el problema persiste, desinstala y reinstala desde el App Store. Asegúrate de que tu iOS está actualizado.",
      },
      {
        q: "¿Cómo reseteo mi presupuesto o metas de ahorro?",
        a: "Abre Savely, ve a Configuración (ícono de engranaje) y toca \"Restablecer Todo\". Esto borrará tus presupuestos, metas e historial de transacciones.",
      },
      {
        q: "¿Mis datos financieros están seguros?",
        a: "Sí. Savely usa cifrado de nivel bancario para proteger todos tus datos. Tu información se almacena de forma segura en tu dispositivo y nunca se vende a terceros.",
      },
      {
        q: "¿Puedo usar Savely sin conexión a internet?",
        a: "¡Sí! Puedes registrar gastos y ver tus presupuestos sin conexión. Las alertas inteligentes y funciones de sincronización requieren internet.",
      },
      {
        q: "¿Cómo creo una meta de ahorro?",
        a: "Toca el botón \"+\" en la pestaña Metas, ingresa el nombre de la meta, el monto objetivo y la fecha límite. Savely calculará automáticamente cuánto necesitas ahorrar cada semana.",
      },
    ],
    infoTitle: "Información a Incluir al Contactarnos",
    infoItems: [
      "Versión de Savely (Configuración → Acerca de)",
      "Modelo del dispositivo y versión de iOS",
      "Descripción detallada del problema",
      "Pasos para reproducir el error",
      "Capturas de pantalla o video del problema (si es posible)",
    ],
    footer: "¡Agradecemos tu paciencia y cooperación!",
    rights: "Todos los derechos reservados.",
    privacyPolicy: "Política de Privacidad",
    terms: "Términos y Condiciones",
  },
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`faq-answer-${question.slice(0, 20)}`}
        style={{ touchAction: "manipulation" }}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-slate-800 hover:bg-slate-700 active:bg-slate-600 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-inset"
      >
        <span className="font-medium text-gray-100 pr-4">{question}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-emerald-400 flex-shrink-0 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          id={`faq-answer-${question.slice(0, 20)}`}
          className="px-5 py-4 bg-slate-900 text-gray-300 text-sm leading-relaxed"
        >
          {answer}
        </div>
      )}
    </div>
  )
}

export default function SavelySupportPage() {
  const params = useParams()
  const locale = ((params?.locale as string) || "es") as Lang
  const strings = t[locale]

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-white focus:rounded-md focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="py-4 bg-gray-800/60 backdrop-blur-sm shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/Savely-Logo.png"
              alt="Savely Logo"
              width={32}
              height={32}
              className="rounded-lg"
              priority
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              {strings.heroTitle}
            </h1>
          </div>
          <Link
            href={`/${locale}#inicio`}
            className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" aria-hidden="true" />
            {strings.back}
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex-grow">
        {/* Hero Banner */}
        <section aria-labelledby="hero-heading" className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-gray-900 to-teal-900/20" aria-hidden="true" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex justify-center mb-6">
              <Image
                src="/Savely-Logo.png"
                alt="Savely"
                width={96}
                height={96}
                className="rounded-2xl shadow-2xl shadow-emerald-500/30"
                priority
              />
            </div>
            <h2
              id="hero-heading"
              className="text-4xl sm:text-5xl font-bold mb-4 text-balance bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-300 bg-clip-text text-transparent"
            >
              {strings.heroTitle}
            </h2>
            <p className="text-gray-300 text-lg max-w-xl mx-auto text-pretty">
              {strings.heroSubtitle}
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
          {/* Contact Section */}
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageCircleIcon className="w-6 h-6 text-emerald-400" aria-hidden="true" />
              {strings.contactTitle}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Email card */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-colors duration-200">
                <div className="flex items-center gap-2 mb-3">
                  <MailIcon className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                  <h3 className="font-semibold text-white">{strings.emailHeading}</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">{strings.emailDesc}</p>
                <a
                  href="mailto:support.savely@atelierbelli.com"
                  className="inline-block text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors duration-200 break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-sm"
                >
                  support.savely@atelierbelli.com
                </a>
                <p className="text-gray-500 text-xs mt-3">{strings.emailNote}</p>
              </div>

              {/* Hours card */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-colors duration-200">
                <div className="flex items-center gap-2 mb-3">
                  <ClockIcon className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                  <h3 className="font-semibold text-white">{strings.hoursTitle}</h3>
                </div>
                <p className="text-gray-300 text-sm">{strings.hoursDesc}</p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl font-bold mb-6 flex items-center gap-2">
              <SmartphoneIcon className="w-6 h-6 text-emerald-400" aria-hidden="true" />
              {strings.faqTitle}
            </h2>
            <div className="space-y-3">
              {strings.faqs.map((faq) => (
                <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </section>

          {/* What to include */}
          <section
            aria-labelledby="info-heading"
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
          >
            <h2 id="info-heading" className="text-xl font-bold mb-4 text-white">
              {strings.infoTitle}
            </h2>
            <ul className="space-y-2">
              {strings.infoItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span
                    className="mt-0.5 h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-gray-400 text-sm italic">{strings.footer}</p>
          </section>
        </div>
      </main>

      <footer className="bg-slate-900 text-gray-500 py-6 text-center border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-xs mb-1">
            &copy;{" "}
            <span suppressHydrationWarning>{new Date().getFullYear()}</span> Atelier
            Belli. {strings.rights}
          </p>
          <div className="space-x-3">
            <Link
              href={`/${locale}/privacy`}
              className="text-xs hover:text-emerald-300 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-sm"
            >
              {strings.privacyPolicy}
            </Link>
            <Link
              href={`/${locale}/terms`}
              className="text-xs hover:text-emerald-300 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-sm"
            >
              {strings.terms}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
