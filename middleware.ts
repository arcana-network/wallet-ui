/* eslint-disable import/no-anonymous-default-export */
import { next } from '@vercel/edge'

// eslint-disable-next-line import/exports-last
export default async (req: Request) => {
  console.log(process.env)
  try {
    const url = new URL(req.url)
    const appId = url.pathname.split('/')[1]

    let header = getHeader('')

    if (!appId) {
      throw new Error('Invalid AppId')
    }

    if (!(appId == 'assets' || appId == 'global-redirect')) {
      const domain = await fetchDomain(appId)
      header = getHeader(domain)
    }
    return next({
      headers: {
        'Content-Security-Policy': header,
      },
    })
  } catch (e) {
    console.log({ e })

    return next({
      status: 403,
      statusText: 'Not allowed',
    })
  }
}

const fetchDomain = async (appId) => {
  const gatewayUrl = process.env.VUE_APP_WALLET_GATEWAY

  const url = new URL('/api/v1/get-app-config/', gatewayUrl)

  url.searchParams.set('id', appId)

  const res = await fetch(url.href)

  if (res.status < 400) {
    const data = await res.json()
    return data.wallet_domain
  } else {
    throw new Error('Invalid AppId')
  }
}

const getHeader = (domain = '') =>
  "font-src 'self' https://*.cloudfront.net data:;" +
  "img-src 'self' data: https:;" +
  "script-src 'self' 'unsafe-inline' https://*.cloudfront.net *.google-analytics.com *.googletagmanager.com;" +
  "style-src 'self' 'unsafe-inline';" +
  'frame-src *.arcana.network *.transak.com *.ramp.network;' +
  (domain.length > 0
    ? `frame-ancestors ${process.env.VUE_APP_WALLET_AUTH_URL} *.arcana.network http://localhost http://localhost:* ${domain};`
    : '')

export const config = {
  matcher: '/:appID/v2/login',
}
