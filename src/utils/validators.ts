import { AuthProvider } from '@arcana/auth-core'
import axios from 'axios'

async function isDisposableEmail(authProvider: AuthProvider, email: string) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-next-line
  const baseUrl = authProvider.config.passwordlessUrl
  const res = await axios.get<{ isDisposable: boolean }>(
    new URL(`/api/v2/is-disposable/${email}`, baseUrl).href
  )
  return res.data.isDisposable
}

const DISPOSABLE_EMAIL_NOT_ALLOWED_MESSAGE =
  'Disposable email addresses are not allowed. Please use a different email address.'
export { isDisposableEmail, DISPOSABLE_EMAIL_NOT_ALLOWED_MESSAGE }
