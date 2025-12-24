import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "2026 럭키 픽 | 새해 덕담 뽑기",
  description: "당신의 2026년을 완벽하게 만들 한 마디, 지금 확인하세요! 말띠 해 특별 운세 & 덕담 서비스",
  keywords: ["2026", "새해", "덕담", "운세", "복", "말띠", "신년"],
  openGraph: {
    title: "2026 럭키 픽 | 새해 덕담 뽑기",
    description: "당신의 2026년을 완벽하게 만들 한 마디, 지금 확인하세요!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistSans.variable} antialiased`} style={{ fontFamily: 'Pretendard, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
