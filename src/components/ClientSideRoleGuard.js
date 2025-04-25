"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { functions } from "@/app/appwrite";

export default function ClientSideRoleGuard() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAccess = async () => {
            const jwt = localStorage.getItem("jwt");
            if (!jwt) {
                router.replace("/auth/login");
                return;
            }

            try {
                const execution = await functions.createExecution(
                    process.env.NEXT_PUBLIC_FN_USER_METADATA,
                    JSON.stringify({ jwt, action: "getUserRole" })
                );

                const parsed = JSON.parse(execution.responseBody);
                const role = parsed?.data?.role;

                if (pathname.startsWith("/preceptor") && role !== "preceptor") {
                    router.replace("/unauthorized");
                }

                if (pathname.startsWith("/facilitator") && role !== "facilitator") {
                    router.replace("/unauthorized");
                }

                // If role matches, do nothing
            } catch (err) {
                console.error("Role check failed:", err.message);
                router.replace("/auth/login");
            }
        };

        checkAccess();
    }, [pathname, router]);

    return null;
}
