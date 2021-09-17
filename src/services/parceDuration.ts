export const parseDuration = (duration: string | number): string => {
  const seconds: number =
    typeof duration === 'number' ? duration : parseInt(duration)

  if (!seconds) {
    return 'No information :disappointed_relieved:'
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds - minutes * 60

  return `${minutes}:${
    remainingSeconds.toString().length === 1
      ? `0${remainingSeconds}`
      : remainingSeconds.toString()
  }`
}
