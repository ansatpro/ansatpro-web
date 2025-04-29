/**
 * @fileoverview Client Side JWT Refresher Component
 * @description Component that handles automatic JWT token refresh on the client side.
 */

"use client";

import { useAutoRefreshJWT } from "@/hooks/useAutoRefreshJWT";

/**
 * @function ClientSideJWTRefresher
 * @description Component that initializes automatic JWT token refresh
 * @returns {null} This component does not render anything visually
 */
export default function ClientSideJWTRefresher() {
    useAutoRefreshJWT();
    return null; // It doesn't render anything visually
}
