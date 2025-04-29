"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function DotsLoading({
    className,
    color = "#3b82f6",
    size = 15,
    gap = 3,
}) {
    return (
        <div className={cn(`flex justify-center py-4 space-x-${gap}`, className)}>
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    style={{
                        backgroundColor: color,
                        width: `${size}px`,
                        height: `${size}px`,
                    }}
                    className="rounded-full"
                    animate={{
                        y: ["0%", "-50%", "0%"],
                        opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                        duration: 0.8,
                        ease: "easeInOut",
                        repeat: Number.POSITIVE_INFINITY,
                        delay: index * 0.15,
                    }}
                />
            ))}
        </div>
    )
}
