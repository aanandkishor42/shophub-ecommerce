import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900">Shop<span className="text-brand-600">Hub</span></span>
          </div>
          <p className="text-sm text-gray-500">
            A full-stack e-commerce demo built with Spring Boot + React
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Link to="/shop" className="hover:text-brand-600">Shop</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-brand-600">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  )
}