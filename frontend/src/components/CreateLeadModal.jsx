import React, { useState } from 'react'
import { PlusCircle, X, Check, User, Phone, MapPin, DollarSign, PackageCheck } from 'lucide-react'

export function CreateLeadModal({ isOpen, onClose, onCreateLead }) {
  const [nama, setNama] = useState('')
  const [nomorWa, setNomorWa] = useState('628')
  const [minat, setMinat] = useState('')
  const [budgetDp, setBudgetDp] = useState('3500000')
  const [domisili, setDomisili] = useState('Purwokerto Timur')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nama.trim() || !minat.trim()) return

    setIsSubmitting(true)
    try {
      await onCreateLead({
        nama: nama.trim(),
        nomor_wa: nomorWa.trim(),
        minat: minat.trim(),
        budget_dp: parseInt(budgetDp) || 2000000,
        domisili: domisili.trim() || 'Purwokerto Timur',
      })
      // Reset form
      setNama('')
      setMinat('')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const setPreset = (presetNama, presetMinat, presetDp, presetKota) => {
    setNama(presetNama)
    setMinat(presetMinat)
    setBudgetDp(presetDp)
    setDomisili(presetKota)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs pointer-events-auto select-none">
      <div className="bg-white rounded-2xl border border-slate-200/90 max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#192A56] flex items-center justify-center shadow-xs">
              <PlusCircle className="w-5 h-5 text-[#192A56]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#192A56]">
                Tambah Prospek / Lead Baru
              </h3>
              <p className="text-xs text-slate-500">
                Tersimpan di database lokal & dianalisis agen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="my-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-slate-500">Preset:</span>
          <button
            type="button"
            onClick={() => setPreset('Diana Putri', 'harian lincah hemat komuter santai', '3000000', 'Purwokerto Timur')}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition cursor-pointer font-medium"
          >
            + Diana (Beat Street)
          </button>
          <button
            type="button"
            onClick={() => setPreset('Dimas Pratama', 'kenyamanan touring elegan jarak jauh', '6000000', 'Banyumas Kota')}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition cursor-pointer font-medium"
          >
            + Dimas (PCX 160)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Nama Calon Konsumen
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Farhan Maulana"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#192A56] text-xs focus:outline-none focus:bg-white focus:border-[#192A56] transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                Nomor WhatsApp
              </label>
              <input
                type="text"
                value={nomorWa}
                onChange={(e) => setNomorWa(e.target.value)}
                placeholder="6281234..."
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#192A56] text-xs font-mono focus:outline-none focus:bg-white focus:border-[#192A56] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Domisili / Cabang
              </label>
              <input
                type="text"
                value={domisili}
                onChange={(e) => setDomisili(e.target.value)}
                placeholder="Purwokerto Timur"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#192A56] text-xs focus:outline-none focus:bg-white focus:border-[#192A56] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5 text-slate-500" />
              Kebutuhan / Minat Unit
            </label>
            <input
              type="text"
              value={minat}
              onChange={(e) => setMinat(e.target.value)}
              placeholder="Contoh: motor gesit irit bensin untuk kuliah harian"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#192A56] text-xs focus:outline-none focus:bg-white focus:border-[#192A56] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              Budget DP (Rupiah)
            </label>
            <input
              type="number"
              step="500000"
              value={budgetDp}
              onChange={(e) => setBudgetDp(e.target.value)}
              placeholder="3500000"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#192A56] text-xs font-mono focus:outline-none focus:bg-white focus:border-[#192A56] transition"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#192A56] hover:bg-[#0E1A38] text-white font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50 text-xs border border-[#192A56]"
              style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}
            >
              <Check className="w-4 h-4 text-white shrink-0" style={{ color: '#FFFFFF' }} />
              <span className="font-bold text-white" style={{ color: '#FFFFFF' }}>{isSubmitting ? 'Menyimpan...' : 'Tambahkan Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
