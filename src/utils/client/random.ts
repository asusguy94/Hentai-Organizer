export default function Random(digits: number): number
export default function Random(): number
export default function Random(digits?: number): number {
  if (digits === undefined || digits < 1) return Math.random()

  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1

  return Math.floor(Math.random() * (max - min + 1)) + min
}
