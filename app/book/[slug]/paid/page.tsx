import Link from "next/link";

export default function PaidPage() {
  return (
    <div className="wrap text-center" style={{ padding: "4.5rem 0 3rem" }}>
      <p
        className="serif italic"
        style={{ color: "var(--ink3)", margin: 0, fontSize: ".92rem" }}
      >
        Payment received
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
        You're all set.
      </h1>
      <p
        style={{
          color: "var(--ink2)",
          maxWidth: "32rem",
          margin: "1.5rem auto",
        }}
      >
        Thanks. We'll be in touch a day before check-in with the door code,
        Wi-Fi password, and the guide to the place.
      </p>
      <p style={{ marginTop: "2rem" }}>
        <Link href="/" className="btn btn-ghost">
          Back to stays
        </Link>
      </p>
    </div>
  );
}
