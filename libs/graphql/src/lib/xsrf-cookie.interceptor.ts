import { HttpInterceptorFn } from '@angular/common/http';

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Angular's built-in XSRF support (`withXsrfConfiguration`) deliberately
 * withholds the header on cross-origin requests, to avoid leaking the token
 * to a third-party host. Every backend call here IS cross-origin from the
 * browser's perspective (localhost:4200 -> localhost:8080/8082/8085/8086,
 * different origins despite sharing "localhost"), so that built-in
 * protection silently drops the header we need on every request. This
 * interceptor attaches it manually instead.
 */
export const xsrfCookieInterceptor: HttpInterceptorFn = (req, next) => {
  const token = readCookie('XSRF-TOKEN');
  if (token && !req.headers.has('X-XSRF-TOKEN')) {
    req = req.clone({ headers: req.headers.set('X-XSRF-TOKEN', token) });
  }
  return next(req);
};
