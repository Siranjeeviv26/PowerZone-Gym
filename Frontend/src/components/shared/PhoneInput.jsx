export default function PhoneInput({ value = '', onChange, onBlur, error, className = '' }) {
  const digits = value.replace(/^\+91/, '').replace(/\D/g, '').slice(0, 10)

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10)
    onChange('+91' + raw)
  }

  return (
    <div className={`flex items-center overflow-hidden rounded-xl border transition-colors ${error ? 'border-red-500/50 bg-red-500/5' : 'border-dark-400 bg-dark-200 focus-within:border-primary/50'} ${className}`}>
      <span className="px-3 py-2.5 text-white text-sm font-semibold bg-dark-400 border-r border-dark-500 select-none flex-shrink-0">+91</span>
      <input
        type="tel"
        value={digits}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder="9876543210"
        maxLength={10}
        className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
      />
    </div>
  )
}
