import { useMemo } from "react";
import { useUser } from "@clerk/clerk-react";

export function useAdminRole() {
    const { user, isLoaded } = useUser();

    const isAdmin = useMemo(() => {
        return user?.publicMetadata?.role === "admin";
    }, [user]);

    return {
        user,
        isLoaded,
        isAdmin,
    };
}