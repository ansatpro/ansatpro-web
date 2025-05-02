"use client";

import { useState, useEffect, Suspense } from "react";
import { account, functions } from "../../appwrite";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
// import TextPressure from './TextPressure';
import dynamic from "next/dynamic";

const TextPressure = dynamic(() => import("@/components/TextPressure"), {
  ssr: false,
});

const handleAnimationComplete = () => {
  console.log("All letters have animated!");
};

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // Check if redirected from registration
    if (searchParams.get("registered") === "true") {
      setSuccess(
        "A verification link has been sent to your email. Please check your inbox to verify your account."
      );
    }
  }, [searchParams]);

  // Verify email

  if (typeof window !== "undefined") {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const secret = urlParams.get("secret");
    const userId = urlParams.get("userId");

    if (secret && userId) {
      try {
        const response = account.updateVerification(userId, secret);
        console.log("Verify successfully"); // Log successful response
      } catch (error) {
        console.error("Verification failed:", error); // Log error message
      }
    } else {
      // console.log("This URL doesn't come from email directly");
      // Do nothing
    }
  } else {
    console.log(
      "This code is running on the server-side, window object is not available."
    );
  }

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
        console.warn(
          "No active session to delete or already deleted:",
          deleteError.message
        );
      }

      // create a new session
      await account.createEmailPasswordSession(email, password);
      const jwt = (await account.createJWT()).jwt;
      localStorage.setItem("jwt", jwt);
      const user = await account.get();

      // Check if the email is verified
      if (!user.emailVerification) {
        setError(
          "Please verify your email before logging in. Check your email inbox for the verification link."
        );
        await account.deleteSession("current");
        return;
      }

      const execution = await functions.createExecution(
        process.env.NEXT_PUBLIC_FN_USER_METADATA,
        JSON.stringify({
          jwt,
          action: "getUserRole",
        })
      );

      const res = JSON.parse(execution.responseBody); // <-- crashes if not valid JSON

      if (res.status !== "success") {
        throw new Error("Failed to retrieve user role");
      }

      const role = res.data?.role;

      if (role === "preceptor") {
        router.push("/preceptor/home");
      } else if (role === "facilitator") {
        router.push("/facilitator/home");
      }

      console.log("🪵 Raw response body:", execution.responseBody);
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err.message || "Failed to login. Please check your credentials."
      );
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
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-white">
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-6 sm:px-0">
        <Card className="rounded-2xl border border-gray-200 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <TextPressure
                text="ANSATPRO"
                flex={true}
                alpha={false}
                stroke={false}
                width={true}
                weight={true}
                italic={true}
                textColor="#3A6784"
                strokeColor="#ff0000"
                minFontSize={36}
              />
              <p className="text-gray-500 mt-1">Sign in to your account</p>
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="mb-4 rounded-xl border-l-4 border-red-600 bg-red-50"
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 rounded-xl border-l-4 border-green-600 bg-green-50">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {hasMounted && (
              <form className="space-y-6" onSubmit={handleLogin}>
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#3A6784] transition duration-200"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 pr-10 py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#3A6784] transition duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-[#3A6784] hover:bg-[#2d5268] text-white font-semibold text-base rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                {/* Links */}
                <div className="flex justify-center space-x-1 text-sm text-gray-600 mt-2">
                  <span>No account?</span>
                  <Link
                    href="/auth/register"
                    className="text-[#3A6784] hover:text-[#2d5268] font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
                <div className="flex justify-center text-sm text-gray-600">
                  <Link
                    href="/auth/forgot-password"
                    className="text-[#3A6784] hover:text-[#2d5268] font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading login form...</div>}>
      <LoginPage />
    </Suspense>
  );
}

// export default LoginPage;
