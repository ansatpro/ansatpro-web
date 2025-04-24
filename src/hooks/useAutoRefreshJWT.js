"use client";
import { useEffect } from "react";
import { account } from "@/app/appwrite";

export function useAutoRefreshJWT() {
    useEffect(() => {
        let interval;

        const refreshIfLoggedIn = async () => {
            try {
                // Check if session exists first
                await account.get(); // Will throw if not logged in

                // Now safe to request JWT
                const res = await account.createJWT();
                localStorage.setItem("jwt", res.jwt);
                console.log("🔐 JWT refreshed");

                // Set up interval to keep refreshing
                interval = setInterval(async () => {
                    try {
                        const newJWT = await account.createJWT();
                        localStorage.setItem("jwt", newJWT.jwt);
                        console.log("🔄 JWT auto-refreshed");
                    } catch (err) {
                        console.warn("⚠️ Failed to refresh JWT:", err.message);
                    }
                }, 12 * 60 * 1000);
            } catch (err) {
                console.log("👤 Not logged in — skipping JWT refresh");
            }
        };

        refreshIfLoggedIn();

        return () => clearInterval(interval); // Cleanup
    }, []);
}
