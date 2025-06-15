import Link from "next/link"
import type React from "react"
import { ArrowLeftIcon } from "lucide-react"

export default function SimplePageLayout({
  title,
  children,
  showBackButton = true,
}: {
  title: string
  children: React.ReactNode
  showBackButton?: boolean
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="py-4 bg-gray-800/50 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">{title}</h1>
          {showBackButton && (
            <Link
              href="/#inicio"
              className="text-sm text-pink-400 hover:text-pink-300 flex items-center transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
              Volver al Inicio
            </Link>
          )}
        </div>
      </header>
      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-invert prose-sm sm:prose-base prose-h2:text-gradient prose-h2:font-semibold prose-a:text-pink-400 hover:prose-a:text-pink-300">
          {children}
        </div>
      </main>
      <footer className="bg-gray-800 text-gray-400 py-6 text-center mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs">&copy; {new Date().getFullYear()} Atelier Belli. Todos los derechos reservados.</p>
          <div className="mt-1 space-x-3">
            <Link href="/#privacidad" className="text-xs hover:text-pink-300 transition-colors">
              Política de Privacidad
            </Link>
            <Link
              href="/terms" // Asumiendo que tendrás una página de términos
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:text-pink-300 transition-colors"
            >
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
