// converts number to string representation with K and M.
// toFixed(d) returns a string that has exactly 'd' digits
// after the decimal place, rounding if necessary.
export const formatViews = (num: number | string): string => {
  const count = Number(num)

  // If count is not number => return no info
  if (!count) return 'No information'

  // convert to K for number from > 1000 < 1 million
  if (count > 999 && count < 1e6) return (count / 1e3).toFixed(1) + 'K'

  // convert to M for number from > 1 million
  if (count > 1e6 && count < 1e9) return (count / 1e6).toFixed(1) + 'M'

  // convert to B for number from > 1 billion
  if (count > 1e9) return (count / 1e9).toFixed(1) + 'B'

  // if value < 1000, nothing to do
  return count.toString()
}
