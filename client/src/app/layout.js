import Header from "@/components/header";
import "@/styles/global.css";

export default function RootLayout({ children }) {
  return (
      <html lang="ko">
      <body>
      <Header />
      <main>{children}</main>
      </body>
      </html>
  );
}