export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/kasir/:path*",
    "/inventaris/:path*",
    "/transaksi/:path*",
  ]
}


