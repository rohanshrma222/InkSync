"use client"; 
import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("http://localhost:3001/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.email, // Ensure email is sent as `username`
        password: formData.password,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      alert("Login successful!");
      router.push("/canvas"); // Redirect after login
    } else {
      alert(data.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-violet-200 to-pink-200">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-4xl font-bold mb-4 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-black">Email</label>
            <div className="flex items-center border border-black rounded-md px-3 py-2">
              <Mail className="text-gray-500 mr-2" size={20} />
              <input type="email" name="email" className="w-full outline-none bg-transparent"
                placeholder="you@example.com" onChange={handleChange} required />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-black">Password</label>
            <input type="password" name="password" className="w-full px-3 py-2 border border-black rounded-md"
              placeholder="Enter your password" onChange={handleChange} required />
          </div>
          <button type="submit" className="w-full bg-[#EC7FA9] text-white py-2 rounded-md">
            Login
          </button>
        </form>
        <p className="mt-4 text-center">
          Don&apos;t have an account? <Link href="/signup" className="text-[#EC7FA9] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
