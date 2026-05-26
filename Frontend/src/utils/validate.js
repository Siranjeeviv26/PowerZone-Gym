// ── Primitive validators ─────────────────────────────────────────────────────

export const required = (label = 'This field') =>
  (v) => !v?.toString().trim() ? `${label} is required` : null

export const email = () =>
  (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'Enter a valid email address' : null

export const minLen = (n, label = 'Value') =>
  (v) => v && v.trim().length < n ? `${label} must be at least ${n} characters` : null

export const maxLen = (n, label = 'Value') =>
  (v) => v && v.trim().length > n ? `${label} cannot exceed ${n} characters` : null

export const phone = () =>
  (v) => {
    if (!v) return null
    const digits = v.replace(/^\+91/, '').replace(/\D/g, '')
    if (digits.length !== 10) return 'Enter a valid 10-digit mobile number'
    return null
  }

export const positiveNum = (label = 'Value') =>
  (v) => v !== '' && v !== undefined && (isNaN(Number(v)) || Number(v) <= 0)
    ? `${label} must be a positive number`
    : null

export const numRange = (min, max, label = 'Value') =>
  (v) => v !== '' && v !== undefined && (isNaN(Number(v)) || Number(v) < min || Number(v) > max)
    ? `${label} must be between ${min} and ${max}`
    : null

export const nonNegative = (label = 'Value') =>
  (v) => v !== '' && v !== undefined && (isNaN(Number(v)) || Number(v) < 0)
    ? `${label} cannot be negative`
    : null

export const matchField = (otherVal, label = 'Passwords') =>
  (v) => v !== otherVal ? `${label} do not match` : null

export const noNumbers = (label = 'Name') =>
  (v) => v && /\d/.test(v) ? `${label} should not contain numbers` : null

export const passwordStrength = () =>
  (v) => v && !/(?=.*[a-zA-Z])(?=.*\d)/.test(v)
    ? 'Password must contain at least one letter and one number'
    : null

// ── Core validate function ────────────────────────────────────────────────────
// rules: { fieldName: [validator, validator, ...] }
// Returns { fieldName: 'first error message' }

export function validate(values, rules) {
  const errors = {}
  for (const field of Object.keys(rules)) {
    for (const rule of rules[field]) {
      const error = rule(values[field])
      if (error) { errors[field] = error; break }
    }
  }
  return errors
}

// ── Convenience helper for form field className ───────────────────────────────
export const fieldClass = (errors, field, base = 'input-field') =>
  `${base} ${errors?.[field] ? 'border-red-500 focus:border-red-500' : ''}`
