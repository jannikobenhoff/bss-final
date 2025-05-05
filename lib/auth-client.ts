import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	plugins: [adminClient()],
	session: {
		cookieEnabled: true,
		maxAge: 7 * 24 * 60 * 60, // 7 days
	},
});
