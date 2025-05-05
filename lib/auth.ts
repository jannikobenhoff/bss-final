import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/database/db";
import * as schema from "@/database/schema";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { customSession } from "better-auth/plugins";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		usePlural: true,
		schema,
	}),
	user: {
		modelName: "users",
		additionalFields: {
			premium: {
				type: "boolean",
				required: false,
				defaultValue: false,
			},
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			// Cache duration in seconds.
			// A week in production for better user experience
			maxAge: 7 * 24 * 60 * 60, // 7 days
		},
	},
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		admin(),
		nextCookies(), // keep this last in `plugins` array
	],
});
