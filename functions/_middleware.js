// williwolff.com is the canonical host. Send visitors and crawlers that
// still arrive on the Pages default domain there, path and query intact.
// Preview deployments (<hash>.wwolff.pages.dev) are left alone.
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === 'wwolff.pages.dev') {
    url.hostname = 'williwolff.com';
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
