"use client";

import { useAutoRefreshJWT } from "@/hooks/useAutoRefreshJWT";

export default function ClientSideJWTRefresher() {
    useAutoRefreshJWT();
    return null; // It doesn't render anything visually
}
