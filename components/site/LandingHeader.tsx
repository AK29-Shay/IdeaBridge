import Link from "next/link";

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[#f8f1eb] border-b border-[#e9dfd6]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="h-8 w-8 rounded-md bg-[#f4c79f] flex items-center justify-center text-black font-bold">IB</div>
            <span className="text-lg font-extrabold text-black">IdeaBridge</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-black/80 hover:text-black transition">
              Login
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-[#f4c79f] hover:bg-[#f2b687] text-black shadow transition"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
