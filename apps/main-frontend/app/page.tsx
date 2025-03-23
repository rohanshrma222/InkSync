import Link from "next/link";
import { Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import Home from "@/components/ui/physics";

export default function LandingPage() {
  return (
    <div>  
          <div className="flex min-h-screen flex-col bg-white">
              {/* Navbar */}
              <header className="sticky top-0 z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl p-4">
                    <div className="container mx-auto flex h-20 items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-yellow-100 to-orange-500 p-2 shadow-lg">
                              <Feather className="h-5 w-5 text-white" />
                            </div>
                            <Link href="/" className="bg-orange-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                              InkSync
                            </Link>
                          </div>
                          <div className="flex items-center gap-4">
                            <Button className="h-10 w-2 bg-[#EB5B00] hover:bg-[#EB5B00]/80" >
                              <Link href="/signin">Login</Link>
                            </Button>
                            <Button className="h-10  w-2 bg-[#EB5B00] hover:bg-[#EB5B00]/80" >
                              <Link href="/signup">Sign Up</Link>
                            </Button>
                          </div>
                    </div>
                    <div className="max-w-2xl p-8 rounded-xl bg-white/10 backdrop-blur-lg shadow-lg">
                        <h1 className="text-4xl font-bold text-black md:text-5xl">
                          Create bold, innovate together
                        </h1>
                        <p className="mt-4 text-lg text-gray-800">
                          A collaborative canvas for teams to sketch, plan, and innovate together in real time.
                        </p>
                    </div>
               </header>
               <Home />
          </div>
    </div>
  );
}
