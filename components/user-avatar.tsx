import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"

interface UserAvatarProps {
    username: string
    profilePicture?: string | null
    size?: "sm" | "md" | "lg"
    className?: string
}

export function UserAvatar({username, profilePicture, size = "md", className = ""}: UserAvatarProps) {
    const sizeClasses = {
        sm: "w-8 h-8 text-sm",
        md: "w-10 h-10 text-base",
        lg: "w-16 h-16 text-lg",
    }

    return (
        <Avatar className={`${sizeClasses[size]} ${className}`}>
            <AvatarImage src={profilePicture || undefined} alt={username}/>
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                {username.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
        </Avatar>
    )
}
