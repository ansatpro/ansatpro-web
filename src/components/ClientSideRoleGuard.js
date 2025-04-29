/**
 * @fileoverview Client Side Role Guard Component
 * @description Component that handles client-side role-based access control and routing.
 */

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { functions } from "@/app/appwrite";

/**
 * @function ClientSideRoleGuard
 * @description Guards routes based on user roles and redirects unauthorized access
 * @returns {null} This component does not render anything
 */
export default function ClientSideRoleGuard() {
    const router = useRouter();
    const pathname = usePathname();

    /**
     * @function useEffect
     * @description Checks user role and access permissions on route changes
     */
    useEffect(() => {
        /**
         * @function checkAccess
         * @description Verifies user role and redirects if unauthorized
         * @async
         */
        const checkAccess = async () => {
            // Skip role check for auth-related pages
            if (pathname.startsWith('/auth/')) {
                return;
            }

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
