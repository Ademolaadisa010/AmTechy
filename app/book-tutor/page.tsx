import { Suspense } from "react";
import BookTutorClient from "./BookTutorClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-slate-600">Loading booking page...</p>
        </main>
      }
    >
      <BookTutorClient />
    </Suspense>
  );
}
