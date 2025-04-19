"use client";

import { useState } from "react";
import { account } from "../../appwrite";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // delette current session if exists
      try {
        await account.deleteSession("current");
      } catch (deleteError) {
        console.warn("No active session to delete or already deleted:", deleteError.message);
      }

      // create a new session
      await account.createEmailPasswordSession(email, password);
      const jwt = (await account.createJWT()).jwt;
      localStorage.setItem('jwt', jwt);
      const user = await account.get();

      const res = await functions.createExecution(
        '67ffd78c00338787f104',
        JSON.stringify({
          jwt,
          action: 'getUserRole',
        })
      );

      if (!res.responseBody) {
        throw new Error("Empty response from function.");
      }

      const result = JSON.parse(res.responseBody);

      if (result.status !== 'success') {
        throw new Error("Failed to retrieve user role");
      }

      const role = result.data?.role;

      if (role === 'preceptor') {
        window.location.href = '/preceptor/home';
      } else if (role === 'facilitator') {
        window.location.href = '/facilitator/home';
      } else {
        throw new Error("Unknown role or role missing");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await account.deleteSession("current");
      setLoggedInUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      setError(error.message || "Failed to logout.");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      <Card className="w-full max-w-md border-none shadow-none">
        <CardContent>
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome to ANSAT Pro.</h1>
            <p className="text-gray-500">Sign in to your account</p>
          </div>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 py-6 bg-gray-50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 pr-10 py-6 bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              variant="default"
              className="w-full py-6 bg-[#3A6784] hover:bg-[#2d5268] text-white font-semibold text-base"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="flex items-center justify-center space-x-1 text-sm">
              <span className="text-gray-500">No account ?</span>
              <Link href="/auth/register" className="text-[#3A6784] hover:text-[#2d5268] font-medium">
                Sign Up
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-1 text-sm">
              <Link href="/auth/forgot-password" className="text-[#3A6784] hover:text-[#2d5268] font-medium">
                Forgot Password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;

