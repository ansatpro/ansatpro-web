import {Home, MessageSquareText, Settings, Users, Download} from "lucide-react"

export const links = [
    { href: "/", label: "Home", icon: <Home/> },
    { href: "/students", label: "Students", icon: <Users /> },
    { href: "/feedback", label: "Feedback", icon: <MessageSquareText /> },
    { href: "/report", label: "Report", icon: <Download /> },
    { href: "/settings", label: "Settings", icon: <Settings /> }]