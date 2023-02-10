/* eslint-disable import/no-anonymous-default-export */
export default async (_, context) => {
  const res = await context.next()
  const { headers } = res
  try {
    const redirect = new URL(process.env.VUE_APP_WALLET_AUTH_REDIRECT_URL)
    headers.set('Content-Security-Policy', `frame-ancestors ${redirect.origin}`)
    return new Response(res.text(), { ...res, headers })
  } catch (e) {
    const response = JSON.stringify({ message: 'Not allowed' })
    return new Response(response, { status: 403 })
  }
}
