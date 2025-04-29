/**
 * @fileoverview Card Components
 * @description A collection of card components for content containers.
 */

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @function Card
 * @description Main card container component
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Card container
 */
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * @function CardHeader
 * @description Header section of the card
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Card header
 */
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * @function CardTitle
 * @description Title component for the card
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Card title
 */
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * @function CardDescription
 * @description Description component for the card
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Card description
 */
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * @function CardContent
 * @description Main content section of the card
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Card content
 */
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * @function CardFooter
 * @description Footer section of the card
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Card footer
 */
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
