"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function AuthPage({isSignin}: {
    isSignin: boolean
}) {
    return <div className="w-screen h-screen bg-white flex justify-center items-center">
        <div className="px-9 py-20 bg-white shadow-xl rounded">
            <div className="">
                Welcome Back!
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" placeholder="Email" />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 mt-5">
                <Label htmlFor="password">Password</Label>
                <Input type="password" id="password" placeholder="Password" />
            </div>
            <div className="pt-5">
                <Button className="bg-gradient-to-r from-blue-500 to-fuchsia-600"onClick={() => {
                }}>{isSignin ? "Sign in" : "Sign up"}</Button>
            </div>
        </div>
    </div>

}