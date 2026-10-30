export function reminderDays(value) {
  const days = Number(value)
  return Number.isInteger(days) && days >= 60 ? days : 60
}

export let LICENSE_REMINDER_DAYS = reminderDays(import.meta.env?.VITE_LICENSE_REMINDER_DAYS)

export let LOCAL_TEST_MODE = false
let serverOffset = 0
export function setServerConfiguration(data) {
  if (typeof data.localTestMode === 'boolean') LOCAL_TEST_MODE = data.localTestMode
  if (data.reminderDays) LICENSE_REMINDER_DAYS = reminderDays(data.reminderDays)
  if (data.serverNow && Number.isFinite(Date.parse(data.serverNow))) serverOffset = Date.parse(data.serverNow) - Date.now()
}
export function currentServerTime() { return new Date(Date.now() + serverOffset) }
