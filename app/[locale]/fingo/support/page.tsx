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

const LANGUAGE_COOKIE = "preferred-language"

type Lang = "en" | "es"

const t = {
  en: {
    back: "Back to Home",
    heroTitle: "Fingo Support",
    heroSubtitle:
      "We're here to help you make every decision quick, fun & fair.",
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
        q: "How do I reset my preferences or saved choices?",
        a: 'Open Fingo, go to Settings (gear icon), and tap "Reset All Data". This will clear your saved categories and history.',
      },
      {
        q: "Can I use Fingo offline?",
        a: "Yes! All core features — wheels, coin flip, tap chooser, and spinning arrow — work fully offline.",
      },
    ],
    infoTitle: "Info to Include When Contacting Support",
    infoItems: [
      "Fingo version (Settings → About)",
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
    heroTitle: "Soporte para Fingo",
    heroSubtitle:
      "Estamos aquí para ayudarte a tomar cada decisión de forma rápida, divertida y justa.",
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
        q: "¿Cómo reseteo mis preferencias o historial?",
        a: 'Abre Fingo, ve a Configuración (ícono de engranaje) y toca "Restablecer Todo". Esto borrará tus categorías guardadas e historial.',
      },
      {
        q: "¿Puedo usar Fingo sin conexión a internet?",
        a: "¡Sí! Todas las funciones principales — ruedas, lanzamiento de moneda, toque y flecha giratoria — funcionan completamente sin internet.",
      },
    ],
    infoTitle: "Información a Incluir al Contactarnos",
    infoItems: [
      "Versión de Fingo (Configuración → Acerca de)",
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
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-slate-800 hover:bg-slate-700 transition-colors duration-200"
      >
        <span className="font-medium text-gray-100 pr-4">{question}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-pink-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="px-5 py-4 bg-slate-900 text-gray-300 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function FingoSupportPage() {
  const params = useParams()
  const locale = ((params?.locale as string) || "es") as Lang
  const strings = t[locale]

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="py-4 bg-gray-800/60 backdrop-blur-sm shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/Fingo-Logo.png"
              alt="Fingo Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-orange-400 bg-clip-text text-transparent">
              {strings.heroTitle}
            </h1>
          </div>
          <Link
            href={`/${locale}#inicio`}
            className="text-sm text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" aria-hidden="true" />
            {strings.back}
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex-grow">
        {/* Hero Banner */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-900/30 via-gray-900 to-orange-900/20" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex justify-center mb-6">
              <Image
                src="/Fingo-Logo.png"
                alt="Fingo"
                width={96}
                height={96}
                className="rounded-2xl shadow-2xl shadow-pink-500/30"
              />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance bg-gradient-to-r from-pink-400 via-red-400 to-orange-300 bg-clip-text text-transparent">
              {strings.heroTitle}
            </h2>
            <p className="text-gray-300 text-lg max-w-xl mx-auto text-balance">
              {strings.heroSubtitle}
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
          {/* Contact Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageCircleIcon className="w-6 h-6 text-pink-400" aria-hidden="true" />
              {strings.contactTitle}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Email card */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-pink-500/50 transition-colors duration-200">
                <div className="flex items-center gap-2 mb-3">
                  <MailIcon className="w-5 h-5 text-pink-400" aria-hidden="true" />
                  <h3 className="font-semibold text-white">{strings.emailHeading}</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">{strings.emailDesc}</p>
                <a
                  href="mailto:support.fingo@atelierbelli.com"
                  className="inline-block text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors break-all"
                >
                  support.fingo@atelierbelli.com
                </a>
                <p className="text-gray-500 text-xs mt-3">{strings.emailNote}</p>
              </div>

              {/* Hours card */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-pink-500/50 transition-colors duration-200">
                <div className="flex items-center gap-2 mb-3">
                  <ClockIcon className="w-5 h-5 text-pink-400" aria-hidden="true" />
                  <h3 className="font-semibold text-white">{strings.hoursTitle}</h3>
                </div>
                <p className="text-gray-300 text-sm">{strings.hoursDesc}</p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <SmartphoneIcon className="w-6 h-6 text-pink-400" aria-hidden="true" />
              {strings.faqTitle}
            </h2>
            <div className="space-y-3">
              {strings.faqs.map((faq) => (
                <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </section>

          {/* What to include */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-white">{strings.infoTitle}</h2>
            <ul className="space-y-2">
              {strings.infoItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex-shrink-0" aria-hidden="true" />
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
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Atelier Belli. {strings.rights}
          </p>
          <div className="space-x-3">
            <Link href={`/${locale}/privacy`} className="text-xs hover:text-pink-300 transition-colors">
              {strings.privacyPolicy}
            </Link>
            <Link href={`/${locale}/terms`} className="text-xs hover:text-pink-300 transition-colors">
              {strings.terms}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
