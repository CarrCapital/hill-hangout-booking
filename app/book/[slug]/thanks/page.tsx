import Link from "next/link";
import { POLICIES } from "@/lib/listings";

export default function ThanksPage() {
  return (
    <div className="wrap text-center" style={{ padding: "4.5rem 0 3rem" }}>
      <p
        className="serif italic"
        style={{ color: "var(--ink3)", margin: 0, fontSize: ".92rem" }}
      >
        Request received
      </p>
      <h1
        className="serif font-light"
        style={{
          fontSize: "clamp(2.2rem,7vw,3rem)",
          lineHeight: 1,
          letterSpacing: "-.012em",
          margin: "1rem 0",
        }}
      >
        Thank you.
      </h1>
      <p
        style={{
          color: "var(--ink2)",
          maxWidth: "32rem",
          margin: "1.5rem auto",
        }}
      >
        We'll get back to you within {POLICIES.approvalWindowHours} hours. If
        the dates work, you'll get a secure link to pay. If they don't, we'll
        tell you right away.
      </p>
      <p style={{ marginTop: "2rem" }}>
        <Link href="/" className="btn btn-ghost">
          Back to stays
        </Link>
      </p>
    </div>
  );
}
