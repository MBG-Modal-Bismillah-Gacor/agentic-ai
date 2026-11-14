import React, { useState, useEffect } from 'react'
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Laptop, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  LogOut, 
  Save, 
  Cpu, 
  Fingerprint 
} from 'lucide-react'

/**
 * DeviceSecurityModal:
 * Sistem autentikasi & profil berbasis perangkat (Device Detection).
 * Mendeteksi ID perangkat workstation, meminta nama & password pada awal akses,
 * serta memungkinkan pengubahan kredensial kapan saja.
 */
export function DeviceSecurityModal({
  isOpen,
  mode = 'setup', // 'setup' (pertama kali) | 'profile' (edit profil / ganti password)
  currentProfile = null,
  onSaveProfile,
  onResetDevice,
  onClose
}) {
  const [userName, setUserName] = useState(currentProfile?.name || 'Pak Alfa')
  const [password, setPassword] = useState(currentProfile?.password || '')
  const [userRole, setUserRole] = useState(currentProfile?.role || 'Sales Director')
  const [deviceId, setDeviceId] = useState(currentProfile?.deviceId || '')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setUserName(currentProfile?.name || 'Pak Alfa')
      setPassword(currentProfile?.password || '')
      setUserRole(currentProfile?.role || 'Sales Director')
      
      // Ambil atau buat ID Perangkat Unik
      let storedDeviceId = localStorage.getItem('stelagent_device_id')
      if (!storedDeviceId) {
        storedDeviceId = `MSI-CUBI-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`
        localStorage.setItem('stelagent_device_id', storedDeviceId)
      }
      setDeviceId(storedDeviceId)
      setErrorMsg('')
      setSuccessMsg('')
    }
  }, [isOpen, currentProfile])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!userName.trim()) {
      setErrorMsg('Nama lengkap tidak boleh kosong')
      return
    }
    if (!password || password.length < 4) {
      setErrorMsg('Password keamanan minimal 4 karakter')
      return
    }

    const updatedProfile = {
      deviceId: deviceId || 'MSI-CUBI-W01',
      name: userName.trim(),
      role: userRole.trim(),
      password: password,
      isVerified: true,
      lastLogin: new Date().toISOString()
    }

    onSaveProfile && onSaveProfile(updatedProfile)
    setSuccessMsg('Autentikasi perangkat berhasil diverifikasi!')
    setTimeout(() => {
      onClose && onClose()
    }, 600)
  }

  const handleReset = () => {
    if (window.confirm('Reset autentikasi perangkat ini? Anda harus memasukkan nama dan password baru.')) {
      onResetDevice && onResetDevice()
    }
  }

  const isSetupMode = mode === 'setup'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div 
        className="w-full max-w-md bg-white rounded-2xl border border-[#192A56]/25 shadow-2xl overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner - Office Cyber Style */}
        <div className="bg-[#192A56] px-6 py-5 text-white relative border-b border-[#192A56]">
          {!isSetupMode && onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shrink-0">
              {isSetupMode ? (
                <Fingerprint className="w-6 h-6 text-white" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-white uppercase">
                {isSetupMode ? 'Autentikasi Workstation' : 'Profil Workstation'}
              </h2>
              <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                {isSetupMode ? 'Keamanan Perangkat MSI Cubi NUC' : 'Sistem Keamanan & Kredensial On-Premise'}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-2.5 font-sans font-normal leading-relaxed">
            {isSetupMode 
              ? 'Sistem mendeteksi perangkat baru. Masukkan nama dan password keamanan untuk membuka akses kantor virtual.'
              : 'Kelola identitas dan kredensial akses yang terdaftar pada perangkat workstation ini.'}
          </p>
        </div>

        {/* Device Signature Pill */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs font-mono text-slate-600">
          <div className="flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-blue-600" />
            <span>ID: <strong className="text-[#192A56]">{deviceId || 'MSI-CUBI-LOCAL'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Terikat ke Perangkat Ini</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Nama Pengguna */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#192A56] uppercase tracking-wide font-mono">
              Nama Lengkap / Panggilan
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Misal: Pak Alfa / Alfa Dhani"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#192A56] focus:border-transparent transition"
                required
              />
            </div>
          </div>

          {/* Peran / Jabatan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#192A56] uppercase tracking-wide font-mono">
              Jabatan / Role
            </label>
            <div className="relative">
              <Cpu className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                placeholder="Misal: Sales Director / Deal Strategist"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#192A56] focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password Keamanan */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#192A56] uppercase tracking-wide font-mono">
                Password / Kunci Keamanan
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-mono cursor-pointer"
              >
                {showPassword ? 'Sembunyikan' : 'Perlihatkan'}
              </button>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 4 karakter"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#192A56] focus:border-transparent transition"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Password ini mengunci workstation virtual dan hanya berlaku di perangkat browser ini.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="submit"
              style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#192A56] hover:bg-[#0E1A38] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              {isSetupMode ? (
                <>
                  <Lock className="w-4 h-4 text-white" />
                  <span>Autentikasi & Masuk</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>

            {!isSetupMode && (
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto py-3 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-mono text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                title="Ganti atau reset autentikasi perangkat"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Ganti Akun</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
