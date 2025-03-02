"use client"

import { useUser } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Sidebar } from "lucide-react"

export default function SideInfo() {
    const { user } = useUser()
    // if (!user) return <div></div>
    return (
        <span className="fixed bottom-2 left-1.5 flex flex-col items-center gap-2">
            <Avatar>
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>{user?.firstName}</AvatarFallback>
            </Avatar>
            <Sidebar className="text-primary/70" />
        </span>
    )
}
