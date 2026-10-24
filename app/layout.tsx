import type { Metadata } from "next";
import Link from "next/link";
import { POLICIES } from "@/lib/listings";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hill Hangout | Direct booking",
  description:
    "Book Hill Hangout direct. Three ways to stay at 501 M Street NE in NoMa, Washington DC.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..500;1,6..72,200..400&family=Hanken+Grotesk:wght@300..600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="border-b border-[color:var(--line)]">
          <div className="wide flex items-center h-14">
            <Link
              href="/"
              className="serif text-base no-underline"
              style={{ color: "var(--ink)" }}
            >
              {POLICIES.brand.name}
            </Link>
            <nav className="ml-auto flex gap-5 text-sm" style={{ color: "var(--ink3)" }}>
              <Link href="/#stays">Stays</Link>
              <Link href="/#house">The house</Link>
              <Link href="/#faq">FAQ</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-[color:var(--line)] mt-16">
          <div
            className="wide py-10 text-sm"
            style={{ color: "var(--ink3)" }}
          >
            <p className="m-0">
              {POLICIES.brand.name}. {POLICIES.address}.
            </p>
            <p className="m-0 mt-1">
              Direct bookings only. Not operated by Airbnb or VRBO.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
