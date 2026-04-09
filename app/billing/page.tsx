import Link from "next/link";

export default function BillingPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Billing</h1>
      <p>Upgrade ClipForge to unlock advanced generation and publishing automation.</p>

      <form action="/api/stripe/checkout" method="POST" style={{ marginTop: 16 }}>
        <button type="submit">Checkout with Stripe</button>
      </form>

      <p style={{ marginTop: 16 }}>
        <Link href="/dashboard">Back to dashboard</Link>
      </p>
    </main>
  );
}
