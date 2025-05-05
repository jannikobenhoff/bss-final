import { Inter, Roboto, Lora } from "next/font/google";
import localFont from "next/font/local";

// Satoshi Variable Font
export const satoshi = localFont({
	src: "../public/fonts/Satoshi-Variable.ttf", //Fredoka
	display: "swap",
	variable: "--font-satoshi", // This creates a CSS variable
});
