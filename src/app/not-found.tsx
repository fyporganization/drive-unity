import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-[clamp(4rem,15vw,8rem)] font-black leading-none tracking-tighter text-cyan-400">
          404
        </h1>

        <h2 className="text-2xl font-semibold text-white sm:text-3xl">
          Page Not Found
        </h2>

        <p className="max-w-md text-base text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Button asChild size="lg" className="mt-2 bg-cyan-500 hover:bg-cyan-600">
          <Link href="/">
            <Home className="size-4" />
            Go to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
