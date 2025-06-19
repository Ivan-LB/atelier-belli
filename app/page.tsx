"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { GithubIcon, LinkedinIcon, ArrowRightIcon, DownloadIcon, MenuIcon, XIcon, InstagramIcon } from "lucide-react"
import { motion, type Variants, easeOut } from "framer-motion"
import Tilt from "react-parallax-tilt"
import { cn } from "@/lib/utils" // Asegúrate de que cn esté importado

import HeroBackground from "@/components/hero-background"

// Componente GradientButton corregido y mejorado
const GradientButton = ({
  href,
  children,
  className,
  target,
  gradientClasses, // Prop para clases de gradiente específicas
}: {
  href: string
  children: React.ReactNode
  className?: string
  target?: string
  gradientClasses?: string // Clases de Tailwind para el background gradient
}) => {
  // Gradiente por defecto si no se proporciona uno específico
  const defaultGradient = "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600"
  // Efectos de hover que no alteran el color del gradiente base
  const hoverVisualEffects = "hover:shadow-xl transform hover:-translate-y-0.5"

  return (
    <a
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={cn(
        "inline-flex items-center justify-center px-6 py-3 text-white font-semibold transition-all duration-300 ease-in-out shadow-lg",
        "rounded-full", // Para botones completamente redondeados (forma de píldora)
        gradientClasses || defaultGradient, // Aplica el gradiente específico o el por defecto
        hoverVisualEffects, // Aplica efectos visuales de hover (sombra, transformación)
        className,
      )}
    >
      {children}
    </a>
  )
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
}

export default function PortfolioPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const navLinks = [
    { name: "Inicio", href: "#inicio" },
    { name: "Sobre mí", href: "#sobre-mi" },
    { name: "Apps", href: "#apps" },
    { name: "Privacidad", href: "#privacidad" },
    { name: "Contacto", href: "#contacto" },
  ]

  // Datos de las apps con sus gradientes para botones y para el glow de la tarjeta
  const appsData = [
    {
      logo: "/Fingo-Logo.png",
      alt: "Logo Fingo",
      title: "Fingo",
      description:
        "Fingo es la app definitiva para tomar decisiones en grupo al instante: elige con toques, ruletas, flechas giratorias o lanzamientos de moneda. Totalmente personalizable, con háptics que hacen cada elección rápida, divertida y justa.",
      supportLink: "https://ivanlorenzanabelli.github.io/fingo-support/",
      appStoreLink: "https://apps.apple.com/mx/app/fingo-group-choice-made-easy/id6747301883?l=en-GB",
      buttonGradient: "bg-gradient-to-r from-pink-500 via-red-500 to-orange-400",
      cardGlowGradient: "linear-gradient(100deg, rgba(236, 72, 153, 0.35), rgba(239, 68, 68, 0.35), rgba(249, 115, 22, 0.35))",
    },
    {
      logo: "/Savely-Logo.png",
      alt: "Logo Savely",
      title: "Savely",
      description:
        "Savely es tu asistente de finanzas personales: controla tus gastos, ahorra con metas personalizadas y recibe alertas inteligentes para mantener tu presupuesto en orden. Diseño intuitivo y seguridad bancaria garantizada.",
      supportLink: "https://ivanlorenzanabelli.github.io/savely-support/",
      appStoreLink: "https://apps.apple.com/app/idSAVELY_APP_ID",
      buttonGradient: "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600",
      cardGlowGradient: "linear-gradient(100deg, rgba(67,163,71,0.35), rgba(34,197,94,0.35), rgba(6,182,212,0.35))",
    },
    {
      logo: "/LogoMezcal.png",
      alt: "Logo Mi Mezcal",
      title: "Mi Mezcal",
      description:
        "Descubre Mi Mezcal, el sitio web de mi marca de mezcal artesanal: conoce nuestra historia, explora variedades y haz tu pedido directo. Diseño elegante y experiencia de usuario auténtica.",
      siteLink: "https://www.destilerialorenzana.com/",
      buttonGradient: "bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500",
      cardGlowGradient: "linear-gradient(100deg, rgba(245,158,11,0.35), rgba(249,186,14,0.35), rgba(249,168,21,0.35))",
    },
  ]

  const scrollMarginTop = "scroll-mt-16"

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
                    ${isScrolled ? "bg-gray-900/80 backdrop-blur-md border-b border-slate-700/50 shadow-lg" : "bg-transparent border-transparent"}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="#inicio"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 text-xl font-semibold text-white"
            >
              <Image src="/AtelierBelli.png" alt="Logo Atelier Belli" width={32} height={32} className="h-8 w-8" />
              <span>Atelier Belli</span>
            </Link>
            <nav className="hidden md:flex">
              <ul className="flex items-center space-x-8">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="nav-link-underline text-sm text-gray-200 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="md:hidden">
              <button onClick={toggleMobileMenu} aria-label="Abrir menú" className="text-gray-200 hover:text-white p-2">
                {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-gray-900/95 backdrop-blur-md shadow-lg pb-4 border-b border-slate-700/50"
          >
            <nav>
              <ul className="flex flex-col items-center space-y-3 pt-3">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={closeMobileMenu}
                      className="text-gray-200 hover:text-pink-400 transition-colors text-base py-2 block w-full text-center"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </header>

      <main className="flex-grow">
        <section
          id="inicio"
          className={`relative min-h-screen flex flex-col justify-center items-center text-center px-4 ${scrollMarginTop} pt-16`}
        >
          <HeroBackground />
          <div className="relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold"
            >
              <span className="text-gradient">Atelier Belli</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-4 text-lg sm:text-xl text-gray-300 max-w-2xl"
            >
              Desarrollo de software y soluciones digitales
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <GradientButton href="#apps" className="mt-8 text-lg">
                Ver mi trabajo <ArrowRightIcon className="inline-block ml-2 h-5 w-5" />
              </GradientButton>
            </motion.div>
          </div>
        </section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          id="sobre-mi"
          className={`relative py-20 sm:py-24 bg-slate-800 overflow-hidden ${scrollMarginTop}`}
        >
          <div className="absolute inset-0 z-0 opacity-20">
            <HeroBackground />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Sobre <span className="text-gradient">mí</span>
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-shrink-0">
                <Image
                  src="/ProfilePic.jpg"
                  alt="Avatar del desarrollador"
                  width={160}
                  height={160}
                  className="rounded-full w-32 h-32 md:w-40 md:h-40 object-cover shadow-xl border-4 border-pink-500/70"
                />
              </div>
              <div className="text-center md:text-left">
                <p className="text-gray-300 leading-relaxed text-lg">
                  Soy un desarrollador full-stack apasionado por crear experiencias digitales pulcras y eficientes. Con
                  un pie en la precisión técnica y otro en la elegancia del diseño minimalista, busco la armonía en cada
                  línea de código. Mi enfoque franco-italiano se refleja en soluciones robustas con un toque de estilo
                  distintivo. ¡Bienvenido a mi atelier digital!
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          id="apps"
          className={`py-20 sm:py-24 bg-gray-900 ${scrollMarginTop}`}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
              Mis <span className="text-gradient">Aplicaciones</span>
            </h2>
            <div className="grid grid-cols-1 gap-12">
              {appsData.map((app) => (
                <Tilt
                  key={app.title}
                  tiltMaxAngleX={5}
                  tiltMaxAngleY={5}
                  glareEnable={true}
                  glareMaxOpacity={0.1}
                  scale={1.02}
                >
                  <div
                    className="glow-card bg-slate-800 p-6 sm:p-8 rounded-xl shadow-xl transition-all duration-300 ease-in-out"
                    style={{ "--card-glow-gradient": app.cardGlowGradient } as React.CSSProperties}
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <Image
                        src={app.logo || "/placeholder.svg"}
                        alt={app.alt}
                        width={100}
                        height={100}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-contain flex-shrink-0"
                      />
                      <div>
                        <h3 className="text-2xl font-semibold mb-2 text-white">{app.title}</h3>
                        <p className="text-gray-400 mb-4 text-sm sm:text-base">{app.description}</p>
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                          {app.supportLink && (
                            <GradientButton
                              href={app.supportLink}
                              target="_blank"
                              className="text-sm w-full sm:w-auto justify-center"
                              gradientClasses={app.buttonGradient} // Usar el gradiente específico del botón
                            >
                              Soporte
                            </GradientButton>
                          )}
                          {app.appStoreLink && (
                            <GradientButton
                              href={app.appStoreLink}
                              target="_blank"
                              className="text-sm w-full sm:w-auto justify-center"
                              gradientClasses={app.buttonGradient} // Usar el gradiente específico del botón
                            >
                              Ver en App Store <DownloadIcon className="inline-block ml-1.5 h-4 w-4" />
                            </GradientButton>
                          )}
                          {app.siteLink && (
                            <GradientButton
                              href={app.siteLink}
                              target="_blank"
                              className="text-sm w-full sm:w-auto justify-center"
                              gradientClasses={app.buttonGradient} // Usar el gradiente específico del botón
                            >
                              Visitar sitio
                            </GradientButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Tilt>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          id="privacidad"
          className={`py-20 sm:py-24 bg-slate-800/50 ${scrollMarginTop}`}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">
              Tu <span className="text-gradient">Privacidad</span> es Importante
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-xl mx-auto">
              En Atelier Belli, me comprometo a proteger tus datos personales. Todas las aplicaciones y servicios se
              desarrollan con la privacidad en mente, asegurando que tu información se maneje de forma transparente y
              segura.
            </p>
            <div className="space-y-3 sm:space-y-0 sm:space-x-6">
              <Link
                href="/privacy"
                className="font-medium text-pink-400 hover:text-pink-300 transition-colors inline-flex items-center"
              >
                Política de Privacidad
              </Link>
              <Link
                href="/privacy/choices"
                className="font-medium text-pink-400 hover:text-pink-300 transition-colors inline-flex items-center"
              >
                Opciones de Privacidad del Usuario
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          id="contacto"
          className={`py-20 sm:py-24 bg-gray-900 ${scrollMarginTop}`}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">
              Hablemos de tu <span className="text-gradient">Proyecto</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-8 max-w-xl mx-auto">
              ¿Tienes una idea o necesitas ayuda con un desarrollo? No dudes en contactarme.
            </p>
            <GradientButton href="mailto:ivanlorenzana@outlook.com" className="text-lg">
              Enviar un Email
            </GradientButton>
            <div className="mt-12 flex justify-center space-x-6">
              <a
                href="https://github.com/Ivan-LB"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-gray-400 hover:text-pink-400 transition-transform hover:scale-110"
              >
                <GithubIcon size={28} />
              </a>
              <a
                href="https://www.linkedin.com/in/ivan-lorenzana-belli/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-pink-400 transition-transform hover:scale-110"
              >
                <LinkedinIcon size={28} />
              </a>
              <a
                href="https://www.instagram.com/_ivanlb?igsh=Z2VwMXg5bnhrbGRl&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-400 hover:text-pink-400 transition-transform hover:scale-110"
              >
                <InstagramIcon size={28} />
              </a>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="bg-slate-900 text-gray-400 py-8 text-center border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm mb-2">
            &copy; {new Date().getFullYear()} Atelier Belli. Todos los derechos reservados.
          </p>
          <div className="space-x-4">
            <Link href="/terms" className="text-xs hover:text-pink-300 transition-colors">
              Términos y Condiciones
            </Link>
            <Link href="/privacy" className="text-xs hover:text-pink-300 transition-colors">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
