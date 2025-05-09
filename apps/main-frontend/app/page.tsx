"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import Home from "@/components/ui/physics";
import Lenis from "@studio-freight/lenis";

export default function LandingPage() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      orientation: "vertical",
      gestureOrientation: "vertical",
      wheelMultiplier: 2,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div>  
      <div className="flex min-h-screen flex-col bg-cover font-['BricolageGrotesque']"
        style={{ backgroundImage: 'url("/gradient-bg-2.png")' }}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-10 p-4 bg-transparent">
          <div className="container mx-auto flex h-20 items-center justify-between px-9">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-yellow-100 to-purple-500 p-2 shadow-lg">
                <Feather className="h-5 w-5 text-white" />
              </div>
              <Link href="/" className="bg-purple-100 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                InkSync
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button className="h-10 w-2 bg-[#9950af] hover:bg-[#9950af]/80">
                <Link href="/signin">Login</Link>
              </Button>
              <Button className="h-10 w-2 bg-[#9950af] hover:bg-[#9950af]/80">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero section */}
        <div className="max-w-2xl px-14 py-20">
          <h1 className="text-4xl md:text-8xl text-white">
            Create bold, innovate together
          </h1>
          <p className="mt-4 text-2xl text-white">
            A collaborative canvas for teams to sketch, plan, and innovate together in real time.
          </p>
          <Button className="mt-4 bg-[#9950af] hover:bg-[#9950af]/80">
            <Link href="/signup" className="flex items-center gap-2 text-[15px]">
              Start Drawing
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </div>

      <Home />
    </div>
  );
}
