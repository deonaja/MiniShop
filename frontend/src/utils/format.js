const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function formatPrice(value) {
  return formatter.format(Number(value) || 0)
}

// Capitalize the first letter of each word (leaves the rest untouched),
// e.g. "usb-c hub" -> "Usb-C Hub". Used to tidy admin text input on blur.
export function titleCase(value) {
  return String(value ?? '').replace(/\b\w/g, (c) => c.toUpperCase())
}
