/* eslint-disable import/no-anonymous-default-export */

// eslint-disable-next-line import/exports-last
export default async (req, context) => {
  const res = await context.next()

  try {
    const appId = getAppId(req.url)

    let header = getHeader('')

    if (!appId) {
      throw new Error('Invalid AppId')
    }

    if (!(appId == 'assets' || appId == 'global-redirect')) {
      const domain = await fetchDomain(appId)
      header = getHeader(domain)
    }
    res.headers.set('Content-Security-Policy', header)

    return res
  } catch (e) {
    console.log({ e })

    const response = JSON.stringify({ message: 'Not allowed' })

    return new Response(response, { status: 403 })
  }
}

const PATTERN = new URLPattern({
  pathname: '/:appId/*',
})

const getAppId = (path) => {
  const r = PATTERN.exec(path)

  if (r) {
    return r.pathname.groups.appId
  }

  return null
}

const fetchDomain = async (appId) => {
  const gatewayUrl = Netlify.env.get('VUE_APP_WALLET_GATEWAY')

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
  "style-src 'self' 'unsafe-inline' https://*.cloudfront.net;" +
  'frame-src *.arcana.network *.transak.com *.ramp.network;' +
  (domain.length > 0
    ? `frame-ancestors ${Netlify.env.get(
        'VUE_APP_WALLET_AUTH_URL'
      )} *.arcana.network http://localhost http://localhost:* ${domain};`
    : '')
