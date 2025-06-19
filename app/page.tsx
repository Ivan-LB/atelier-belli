"use client" // Necesario para useState y manejo de eventos del menú móvil

import type React from "react" // Importar useState
import { useState } from "react"
import Link from "next/link"
import {
  GithubIcon,
  LinkedinIcon,
  ArrowRightIcon,
  DownloadIcon,
  MenuIcon,
  XIcon,
  InstagramIcon,
} from "lucide-react"

// Helper component for gradient buttons (sin cambios)
const GradientButton = ({
  href,
  children,
  className,
  target,
}: { href: string; children: React.ReactNode; className?: string; target?: string }) => (
  <a
    href={href}
    target={target}
    rel={target === "_blank" ? "noopener noreferrer" : undefined}
    className={`inline-block px-6 py-3 rounded-md text-white font-semibold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${className}`}
  >
    {children}
  </a>
)

export default function PortfolioPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: "Inicio", href: "#inicio" },
    { name: "Sobre mí", href: "#sobre-mi" },
    { name: "Apps", href: "#apps" },
    { name: "Privacidad", href: "#privacidad" },
    { name: "Contacto", href: "#contacto" },
  ]

  const scrollMarginTop = "scroll-mt-16" // Ajustado a la altura del header h-16

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      {/* Header MODIFICADO */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="#inicio"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 text-xl font-semibold text-white"
            >
              <img src="/AtelierBelli.png" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
              <span>Atelier Belli</span>
            </Link>

            {/* Navegación Desktop */}
            <nav className="hidden md:flex">
              <ul className="flex items-center space-x-5">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Botón Menú Móvil */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                aria-label="Abrir menú"
                className="text-gray-300 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
              >
                {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Desplegable Móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-900/95 backdrop-blur-md shadow-lg pb-4 border-b border-slate-700/50">
            <nav>
              <ul className="flex flex-col items-center space-y-3 pt-3">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={closeMobileMenu} // Cierra el menú al hacer clic en un enlace
                      className="text-gray-200 hover:text-pink-400 transition-colors text-base py-2 block w-full text-center"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section
          id="inicio"
          className={`min-h-screen flex flex-col justify-center items-center text-center px-4 pt-16 ${scrollMarginTop}`}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold">
            <span className="text-gradient">Atelier Belli</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-2xl">
            Desarrollo de software y soluciones digitales
          </p>
          <GradientButton href="#apps" className="mt-8 text-lg">
            Ver mi trabajo <ArrowRightIcon className="inline-block ml-2 h-5 w-5" />
          </GradientButton>
        </section>

        {/* El resto de las secciones permanecen sin cambios */}
        <section id="sobre-mi" className={`py-16 sm:py-20 bg-gray-800/50 ${scrollMarginTop}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Sobre <span className="text-gradient">mí</span>
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-shrink-0">
                <img
                  src="/ProfilePic.jpg?width=160&height=160"
                  alt="Avatar del desarrollador"
                  className="rounded-full w-32 h-32 md:w-40 md:h-40 object-cover shadow-xl border-4 border-pink-500/50"
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
        </section>

        <section id="apps" className={`py-16 sm:py-20 ${scrollMarginTop}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Mis <span className="text-gradient">Aplicaciones</span>
            </h2>

            {/* Fingo */}
            <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl max-w-2xl mx-auto mb-12">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <img
                  src="/Fingo-Logo.png"
                  alt="Logo Fingo"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div>
                  <h3 className="text-2xl font-semibold mb-2 text-white">Fingo</h3>
                  <p className="text-gray-400 mb-4 text-sm sm:text-base">
                    Fingo es la app definitiva para tomar decisiones en grupo al instante: elige con toques, ruletas,
                    flechas giratorias o lanzamientos de moneda. Totalmente personalizable, con háptics que hacen
                    cada elección rápida, divertida y justa.
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <GradientButton
                      href="https://ivanlorenzanabelli.github.io/fingo-support/"
                      target="_blank"
                      className="text-sm w-full sm:w-auto justify-center"
                    >
                      Soporte
                    </GradientButton>
                    <GradientButton
                      href="https://apps.apple.com/mx/app/fingo-group-choice-made-easy/id6747301883?l=en-GB"
                      target="_blank"
                      className="text-sm w-full sm:w-auto justify-center"
                    >
                      Ver en App Store <DownloadIcon className="inline-block ml-1.5 h-4 w-4" />
                    </GradientButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Savely */}
            <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl max-w-2xl mx-auto mb-12">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <img
                  src="/Savely-Logo.png"
                  alt="Logo Savely"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div>
                  <h3 className="text-2xl font-semibold mb-2 text-white">Savely</h3>
                  <p className="text-gray-400 mb-4 text-sm sm:text-base">
                    Savely es tu asistente de finanzas personales: controla tus gastos, ahorra con metas personalizadas
                    y recibe alertas inteligentes para mantener tu presupuesto en orden. Diseño intuitivo y seguridad
                    bancaria garantizada.
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <GradientButton
                      href="https://ivanlorenzanabelli.github.io/savely-support/"
                      target="_blank"
                      className="text-sm w-full sm:w-auto justify-center"
                    >
                      Soporte
                    </GradientButton>
                    <GradientButton
                      href="https://apps.apple.com/app/idSAVELY_APP_ID"
                      target="_blank"
                      className="text-sm w-full sm:w-auto justify-center"
                    >
                      Ver en App Store <DownloadIcon className="inline-block ml-1.5 h-4 w-4" />
                    </GradientButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Mezcal Site */}
            <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <img
                  src="/Mezcal-Logo.jpg"
                  alt="Logo Mi Mezcal"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div>
                  <h3 className="text-2xl font-semibold mb-2 text-white">Mi Mezcal</h3>
                  <p className="text-gray-400 mb-4 text-sm sm:text-base">
                    Descubre Mi Mezcal, el sitio web de mi marca de mezcal artesanal: conoce nuestra historia,
                    explora variedades y haz tu pedido directo. Diseño elegante y experiencia de usuario auténtica.
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <GradientButton
                      href="https://www.destilerialorenzana.com/"
                      target="_blank"
                      className="text-sm w-full sm:w-auto justify-center"
                    >
                      Visitar sitio
                    </GradientButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="privacidad" className={`py-16 sm:py-20 bg-gray-800/50 ${scrollMarginTop}`}>
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
        </section>

        <section id="contacto" className={`py-16 sm:py-20 ${scrollMarginTop}`}>
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
                className="text-gray-400 hover:text-pink-400 transition-colors"
              >
                <GithubIcon size={28} />
              </a>
              <a
                href="https://www.linkedin.com/in/ivan-lorenzana-belli/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-pink-400 transition-colors"
              >
                <LinkedinIcon size={28} />
              </a>
              <a
                href="https://www.instagram.com/_ivanlb?igsh=Z2VwMXg5bnhrbGRl&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-gray-400 hover:text-pink-400 transition-colors"
              >
                <InstagramIcon size={28} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-gray-400 py-8 text-center mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm mb-2">
            &copy; {new Date().getFullYear()} Atelier Belli. Todos los derechos reservados.
          </p>
          <div className="space-x-4">
            <a
              href="/terms"
              rel="noopener noreferrer"
              className="text-xs hover:text-pink-300 transition-colors"
            >
              Términos y Condiciones
            </a>
            <Link href="/privacy" className="text-xs hover:text-pink-300 transition-colors">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}