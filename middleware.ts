import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// biome-ignore lint/style/useImportType: <explanation>
import { Database } from './types_db'

export async function middleware(req: NextRequest) {
  // Create a response to modify response headers later
  const res = NextResponse.next()
  
  // Create authenticated Supabase Client
  const supabase = createMiddlewareClient<Database>({ req, res })
  
  // Check if there's a valid session
  const { data: session } = await supabase.auth.getSession()
  
  const url = req.nextUrl.clone();

  // Define paths that are allowed without redirection
  const allowedPaths = [
    '/',
    '/a-propos/cgu',
    '/posts/afrique',
    '/posts/politique',
    '/catpost/economie',
    '/posts',
    '/article-category',
    '/catpost/sport',
    '/catpost/politique',
    '/catpost/culture',
    '/catpost/afrique',
    '/catpost/opinion',
    '/catpost/undefined',
    '/catpost/installHook.js.map',
    '/catpost/react_devtools_backend_compact.js.map',
    '/categoriePosts/politique',
    '/webmail',
    '/a-propos/contacts',
    '/images',
    '/a-propos/faq',
    '/a-propos/qui-sommes-nous',
    '/abonnement',
    '/signin',
    '/categorie/politique',
    '/categorie/economie',
    '/categorie/societe',
    '/categorie/sport',
    '/categorie/culture',
    '/categorie/opinion',
    '/categorie/international',
    '/categorie/afrique',
    '/categorie/undefined',
    '/recherche',
    '/images',
    '/images/afriki.png',
    '/parutions',
    '/archives',
    '/archives/2014',
    '/archives/2015',
    '/archives/2016',
    '/archives/2017',
    '/archives/2018',
    '/archives/2019',
    '/archives/2020',
    '/archives/2021',
    '/archives/2022',
    '/archives/2023',
    '/archives/2024',
    '/archives/2025',
    '/tv',
    '/mobile-payment',
    '/mobile-payment/annuel',
    '/mobile-payment/mensuel',
    '/mobile-payment/semestriel',
    '/mobile-payment/notify',
    '/mobile-payment',
    '/account',
    '/favicon.ico',
    '/robots.txt',
    '/api/generate-sitemaps',
    '/sitemaps',
    '/sitemaps/sitemap-index.xml',
    '/sitemaps/sitemap.xml',
    '/sitemap/sitemap.xml',
    '/sitemap.xml',
    '/sitemaps/sitemap-1.xml',
    '/sitemaps/sitemap-2.xml',
    '/sitemaps/sitemap-3.xml',
    '/sitemaps/sitemap-4.xml',
    '/sitemaps/sitemap-5.xml',
    '/sitemaps/sitemap-6.xml',
    '/sitemaps/sitemap-7.xml',
    '/sitemaps/sitemap-8.xml',
    '/sitemaps/sitemap-9.xml',
    '/sitemaps/sitemap-10.xml',
    '/sitemaps/sitemap-11.xml',
    '/sitemaps/sitemap-12.xml',
    '/sitemaps/sitemap-13.xml',
    '/sitemaps/sitemap-14.xml',
    '/sitemaps/sitemap-15.xml',
    '/sitemaps/sitemap-16.xml',
    '/sitemaps/sitemap-17.xml',
    '/sitemaps/sitemap-18.xml',
    '/sitemaps/sitemap-18.xml',
    '/sitemaps/sitemap-19.xml',
    '/sitemaps/sitemap-20.xml',
    '/sitemaps/sitemap-21.xml',
    '/sitemaps/sitemap-22.xml',
    '/sitemaps/sitemap-23.xml',
    '/sitemaps/sitemap-24.xml',
    '/sitemaps/sitemap-25.xml',
    '/sitemaps/sitemap-26.xml',
    '/sitemaps-news',
    '/mtn-money.png',
    '/mtn-money.png',
    '/wave.png',
    '/orange-money.png',
    '/bannieres/salon-banques-uemoa-pme.jpg',
    '/moov-money-2.png',
    '/lintelligentpdf',
    '/pdfjs-dist',
    '/archivespdf',
    '/installHook.js.map',
    '/categorie/installHook.js.map',
    '/categorie/react_devtools_backend_compact.js.map',
    '/react_devtools_backend_compact.js.map',
    '/journal-lia.png',
    '/uploadpdf',
    '/_next',
    '/static',
    '/pdf.worker.mjs',
    '/pdf.worker.js',
    '/allowemail',
    '/api',
    '/aujourdhui.png',
    '/recrutement_consultant_arstm.png',
    '/yandex_5002873b64bf9d4f.html'
  ];

  const segments = ['/economie/', '/politique/', '/news/', '/societe/', '/afrique/', '/sports/', '/opinion/'];

  const containsSegment = segments.some(segment => url.pathname.includes(segment));
  const containsCategorie = url.pathname.includes('/categorie/');
  const containsArticle = url.pathname.includes('/article/');

  if(containsSegment && !containsCategorie) {
    
    // biome-ignore lint/complexity/noForEach: <explanation>
        segments.forEach(segment => {
      if(url.pathname.includes(segment)) {
        url.pathname = url.pathname.replace(segment, '/article/');
      }
    });
    return NextResponse.redirect(url);
  }

  if (containsSegment && containsArticle) {
    // biome-ignore lint/complexity/noForEach: <explanation>
    segments.forEach(segment => {
      if (url.pathname.includes(segment)) {
        url.pathname = url.pathname.replace(segment, '')
      }
    });
    return NextResponse.redirect(url)
  }

  // Check if the request pathname matches any of the allowed paths
  if (allowedPaths.some(
    path => url.pathname === path) || 
    url.pathname.startsWith('/tag/') || 
    url.pathname.startsWith('/_next/') || 
    url.pathname.startsWith('/static') || 
    url.pathname.startsWith('/api') || 
    url.pathname.startsWith('/sitemaps') || 
    url.pathname.startsWith('/sitemap') || 
    url.pathname.startsWith('/journal/') || 
    url.pathname.startsWith('/images/') || 
    url.pathname.startsWith('/parutions/') || 
    url.pathname.startsWith('/allowemail/') || 
    url.pathname.startsWith('/lintelligentpdf/') || 
    url.pathname.startsWith('/pdfjs-dist/') || 
    url.pathname.startsWith('/tagposts/') ||
    url.pathname.startsWith('/posts/') ||
    url.pathname.startsWith('/categorie') ||
    url.pathname.startsWith('/wp-content/' )
  ) {
    return res
  }
  
  // Redirect if the pathname does not include '/article/'
  if (!url.pathname.startsWith('/article')) {
    url.pathname = `/article${url.pathname}`
    console.log('Redirecting to', url.toString())
    return NextResponse.redirect(url)
  }
/** 
  if (url.pathname.includes('/tag/')) {
    const keyword = url.pathname.split('/tag/')[1];
    
      url.pathname = `/tag/${encodeURIComponent(keyword)}`;
      return NextResponse.rewrite(url);
  }
*/
  return res;
}

export const config = {
  matcher: ['/:path*', '/tag/:path*'],
}
