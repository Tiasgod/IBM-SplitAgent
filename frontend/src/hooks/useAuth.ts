import { useState, useCallback } from "react";
import { sessionStorage } from "../services/auth.service";
import type { SessionUser } from "../services/auth.service";

/**
 * Returns the currently logged-in user from localStorage.
 * Call `refresh()` after updating the user to re-read the stored value.
 */
export function useAuth(): { user: SessionUser | null; refresh: () => void } {
  const [user, setUser] = useState<SessionUser | null>(() => sessionStorage.getUser());
  const refresh = useCallback(() => setUser(sessionStorage.getUser()), []);
  return { user, refresh };
}
