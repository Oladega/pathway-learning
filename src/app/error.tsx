"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="loading">
      <h1>This page could not be displayed</h1>
      <p>Your saved learning data has not been reset.</p>
      <button onClick={reset}>Try again</button>
      <a href="/dashboard"> Return to dashboard</a>
    </main>
  );
}
