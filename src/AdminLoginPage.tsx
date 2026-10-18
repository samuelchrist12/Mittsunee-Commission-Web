import { useState } from 'react'
import { motion } from 'motion/react'
import { User, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react'



interface AdminLoginPageProps {
  onSuccess: () => void
  onExit: () => void
}

export default function AdminLoginPage({ onSuccess, onExit }: AdminLoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Simulate quick verification
    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase()
      const cleanPass = password.trim()

      if (cleanUser === 'tasya' && cleanPass === 'Gracela1203') {
        const authData = JSON.stringify({
          user: 'Tasya',
          role: 'admin',
          loggedInAt: Date.now(),
        })

        if (rememberMe) {
          localStorage.setItem('mittsunee_admin_auth', authData)
        }
        sessionStorage.setItem('mittsunee_admin_auth', authData)

        setIsLoading(false)
        onSuccess()
      } else {
        setIsLoading(false)
        setError('Username atau password salah. Silakan coba lagi.')
      }
    }, 300)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FAFCFF] relative overflow-hidden select-none font-body">
      {/* Background Grid Pattern matching site */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cpath d='M 28 0 L 0 0 0 28' fill='none' stroke='rgba(116%2C162%2C221%2C0.12)' stroke-width='1'/%3E%3C/svg%3E\")",
          backgroundSize: '28px 28px',
        }}
      />

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-sky-200/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-sky-300/20 blur-3xl pointer-events-none" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-sky-100 shadow-xl p-6 sm:p-8"
      >
        {/* Top Mascot Avatar & Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-sky-50 border-2 border-sky-200/80 p-1 flex items-center justify-center shadow-xs">
              <img
                src="/Original%20Character.png"
                alt="Mittsunee Mascot"
                className="w-full h-full object-contain rounded-full select-none"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-sky-400 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck size={14} />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-sky-950 font-display">
            Mittsunee Admin
          </h1>
          <p className="text-xs text-sky-400 mt-1 flex items-center gap-1.5 font-medium">
            <span>Portfolio Management</span>
            <span>•</span>
            <span className="font-mono bg-sky-50 px-1.5 py-0.5 rounded text-sky-600 border border-sky-100">
              /cyela
            </span>
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2"
          >
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-sky-700 mb-1.5 text-left">
              Username
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none">
                <User size={16} />
              </div>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
                autoFocus
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-sky-200/80 bg-white text-xs text-sky-950 placeholder:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-sky-700 mb-1.5 text-left">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-sky-200/80 bg-white text-xs text-sky-950 placeholder:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me Option */}
          <div className="flex items-center justify-between pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-sky-500 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 border-sky-300 rounded-md cursor-pointer"
              />
              <span>Ingat saya di browser ini</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full py-2.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-98 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <img
                src="/Loading%20Eye.png"
                alt="Loading"
                className="h-4 w-auto object-contain animate-pulse"
              />
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Masuk ke Admin</span>
              </>
            )}
          </button>
        </form>

        {/* Back to Home Link */}
        <div className="mt-6 pt-4 border-t border-sky-100 text-center">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-600 font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Kembali ke Website Utama</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
