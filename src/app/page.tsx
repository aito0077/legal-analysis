import Link from 'next/link'
import { Shield, FileSearch, Users, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">LegalRisk</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/wizard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Demo
            </Link>
            <Link
              href="/auth/signin"
              className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/wizard"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Protege tu negocio de
            <span className="text-blue-600"> riesgos legales</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Identifica, evalúa y gestiona riesgos legales con nuestra plataforma impulsada por IA.
            Protocolos personalizados para tu industria y jurisdicción.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/wizard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Evaluación Gratuita
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg border border-gray-200"
            >
              Ver más
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para proteger tu negocio
            </h2>
            <p className="text-xl text-gray-600">
              Gestión integral de riesgos legales en una sola plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileSearch className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Evaluación Inteligente
              </h3>
              <p className="text-gray-600">
                Identifica riesgos específicos de tu industria y jurisdicción con nuestro wizard
                impulsado por IA.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Protocolos Personalizados
              </h3>
              <p className="text-gray-600">
                Recibe protocolos de acción adaptados a tu perfil de riesgo, validados por expertos
                legales.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Comunidad Colaborativa
              </h3>
              <p className="text-gray-600">
                Accede a protocolos compartidos por otros profesionales y contribuye con tu
                experiencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Soluciones para tu industria
            </h2>
            <p className="text-xl text-gray-600">
              Protocolos especializados por sector
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Salud',
              'Construcción',
              'Finanzas',
              'E-Commerce',
              'Tecnología',
              'Educación',
              'Manufactura',
              'Retail',
            ].map((industry) => (
              <div
                key={industry}
                className="bg-white p-6 rounded-xl text-center hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
              >
                <p className="font-semibold text-gray-900">{industry}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">¿Listo para proteger tu negocio?</h2>
          <p className="text-xl mb-8 opacity-90">
            Comienza tu evaluación gratuita ahora. Sin tarjeta de crédito requerida.
          </p>
          <Link
            href="/wizard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
          >
            Comenzar Evaluación
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>&copy; 2024 LegalRisk Platform. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
