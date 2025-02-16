package org.example.backend.utils;

import org.example.backend.security.PlatformUserDetails;

public class SecurityUtils {

    /**
     * Returns the current authenticated user's ID.
     * This method can be used in service layers when the controller doesn't pass the user ID.
     */
    public static Long getCurrentUserId(PlatformUserDetails principal) {
        return principal.getId();
    }
}
