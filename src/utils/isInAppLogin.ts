const inAppLoginTypes = ['firebase']

export function isInAppLogin(loginType?: string) {
  if (!loginType) return false
  return inAppLoginTypes.includes(loginType)
}
