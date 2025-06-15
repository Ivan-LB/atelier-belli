import type React from "react"
import Link from "next/link"
import { AlertTriangleIcon, HomeIcon } from "lucide-react"

// Reutilizamos el componente GradientButton si quieres el mismo estilo de botón
// Si no lo tienes accesible globalmente, puedes definirlo aquí o importarlo
const GradientButton = ({
  href,
  children,
  className,
}: { href: string; children: React.ReactNode; className?: string }) => (
  <Link
    href={href}
    className={`inline-flex items-center justify-center px-6 py-3 rounded-md text-white font-semibold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${className}`}
  >
    {children}
  </Link>
)

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-md w-full">
        <AlertTriangleIcon className="mx-auto h-20 w-20 text-pink-500 mb-6" />

        <h1 className="text-6xl sm:text-7xl font-bold mb-4">
          <span className="text-gradient">404</span>
        </h1>

        <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">Página No Encontrada</h2>

        <p className="text-gray-400 mb-8 text-base sm:text-lg">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        <GradientButton href="/">
          <HomeIcon className="mr-2 h-5 w-5" />
          Volver al Inicio
        </GradientButton>
      </div>
      <footer className="absolute bottom-8 text-center w-full text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Atelier Belli</p>
      </footer>
    </div>
  )
}
