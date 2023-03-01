/* eslint-disable import/no-anonymous-default-export */
export default async (request) => {
  return new Response('Hello, World!', {
    headers: { 'content-type': 'text/html' },
  })
}
