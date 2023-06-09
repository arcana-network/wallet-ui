const inAppLoginTypes = new Set(['firebase'])

export function isInAppLogin(loginType?: string) {
  if (!loginType) return false
  return inAppLoginTypes.has(loginType)
}
