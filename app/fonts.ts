import { Inter, Roboto, Lora } from "next/font/google";
import localFont from "next/font/local";

// Fredoka Variable Font
export const fredoka = localFont({
	src: "../public/fonts/Fredoka-Variable.ttf",
	display: "swap",
	variable: "--font-fredoka", // This creates a CSS variable
});
