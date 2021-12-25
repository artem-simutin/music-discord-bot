export const parseDuration = (duration: string | number): string => {
  const seconds: number =
    typeof duration === 'number' ? duration : parseInt(duration)

  if (!seconds) {
    return 'No information :disappointed_relieved:'
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds - minutes * 60

  if (minutes > 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.floor((seconds - hours * 3600) / 60)
    const remainingSeconds = seconds - hours * 3600 - remainingMinutes * 60

    return `${hours}:${
      remainingMinutes.toString().length === 1
        ? `0${remainingMinutes}`
        : remainingMinutes.toString()
    }:${
      remainingSeconds.toString().length === 1
        ? `0${remainingSeconds}`
        : remainingSeconds.toString()
    }`
  }

  return `${minutes}:${
    remainingSeconds.toString().length === 1
      ? `0${remainingSeconds}`
      : remainingSeconds.toString()
  }`
}
