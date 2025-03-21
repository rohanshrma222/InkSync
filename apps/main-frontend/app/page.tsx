
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Share2, Users2, Sparkles, Github, Download } from "lucide-react";
import Link from "next/link";

function App() {
  return (
    <div className="h-screen bg-[url('/background.jpeg')] bg-cover bg-center">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 h-screen">
              <Link href={"/signin"}>
                <Button variant={"default"} size="lg" className="h-12 px-6">
                  Login
                  <Pencil className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="lg" className="h-12 px-6">
                  Sign up
                </Button>
              </Link>
        </div>
        <footer className="border-t">
          <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                © 2024 Excalidraw Clone. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="https://github.com" className="text-muted-foreground hover:text-primary">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Download className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
}

export default App;