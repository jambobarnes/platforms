import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {

  // Clone the request url
  const url = req.nextUrl.clone();

  // Get pathname of request (e.g. /blog-slug)
  const { pathname } = req.nextUrl;

  console.log('NEXT URL', req.nextUrl)

  // Get hostname of request (e.g. demo.cliniccal.com, demo.localhost:3000)
  const hostname = req.headers.get("host");
  console.log(hostname)

  if (!hostname)
    return new Response(null, {
      status: 400,
      statusText: "No hostname found in request headers",
    });

  // Only for demo purposes – remove this if you want to use your root domain as the landing page
  // JB - THIS WILL HANDLE A REDIRECT BACK TO ANOTHER SITE, e.g. if the app is at app.cliniccal.co.uk but you want people to go via cliniccal.co.uk
  // you can use this hostname based redirect
  // if (hostname === "localhost:3000") {
  //   return NextResponse.redirect("https://app.cliniccal.com");
  // }

  /*  You have to replace ".cliniccal.com" with your own domain if you deploy this example under your domain.
      You can also use wildcard subdomains on .vercel.app links that are associated with your Vercel team slug
      in this case, our team slug is "platformize", thus *.platforms-pink.vercel.app works. Do note that you'll
      still need to add "*.platforms-pink.vercel.app" as a wildcard domain on your Vercel dashboard. */

  const currentHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
      ? hostname
          .replace(`.cliniccal.com`, "")
          .replace(`.platforms-pink.vercel.app`, "")
      : hostname.replace(`.localhost:3000`, "");

  if (pathname.startsWith(`/_sites`))
    return new Response(null, {
      status: 404,
    });

  if (!pathname.includes(".") && !pathname.startsWith("/api")) {
    if (currentHost == "app") {
      if (
        pathname === "/login" &&
        (req.cookies["next-auth.session-token"] ||
          req.cookies["__Secure-next-auth.session-token"])
      ) {
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

      url.pathname = `/app${pathname}`;
      return NextResponse.rewrite(url);
    }

    if (
      hostname === "localhost:3000" ||
      hostname === "platforms-pink.vercel.app"
    ) {
      url.pathname = `/home${pathname}`;
      return NextResponse.rewrite(url);
    }

    url.pathname = `/_sites/${currentHost}${pathname}`;
    return NextResponse.rewrite(url);
  }
}
