import Link from "next/link";
import { Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import Home from "@/components/ui/physics";

export default function LandingPage() {
  return (
    <div>  
          <div className="flex min-h-screen flex-col bg-cover"
          style={{ backgroundImage: 'url("/gradient-bg-2.png")' }}
          >
              {/* Navbar */}
              <header className="sticky top-0 z-10  p-4">
                    <div className="container mx-auto flex h-20 items-center justify-between px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-yellow-100 to-purple-500 p-2 shadow-lg">
                              <Feather className="h-5 w-5 text-white" />
                            </div>
                            <Link href="/" className="bg-purple-100 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                              InkSync
                            </Link>
                          </div>
                          <div className="flex items-center gap-4">
                            <Button className="h-10 w-2 bg-[#9950af] hover:bg-[#9950af]/80" >
                              <Link href="/signin">Login</Link>
                            </Button>
                            <Button className="h-10  w-2 bg-[#9950af] hover:bg-[#9950af]/80" >
                              <Link href="/signup">Sign Up</Link>
                            </Button>
                          </div>
                    </div>
                    <div className="font-['BricolageGrotesque'] max-w-2xl p-8">
                        <h1 className="text-6xl font-bold text-white md:text-8xl">
                          Create bold, innovate together
                        </h1>
                        <p className="mt-4 text-2xl text-white">
                          A collaborative canvas for teams to sketch, plan, and innovate together in real time.
                        </p>
                    </div>
               </header>
               {/* <Home /> */}
          </div>
    </div>
  );
}
