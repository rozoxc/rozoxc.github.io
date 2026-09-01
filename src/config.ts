import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "Abderrahmane Abdoullah",
	subtitle: "Cybersecurity Consultant · Pentester · CTF Player",
	lang: "en", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 242, // Matches the CTF writeup accent (#4b46d6 violet-indigo)
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png",
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true,
		depth: 2,
	},
	favicon: [],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "GitHub",
			url: "https://github.com/rozoxc",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/demo-avatar.png",
	name: "Abderrahmane Abdoullah",
	bio: "Cybersecurity consultant and penetration tester. Web & binary exploitation, bug bounty, and CTF. Security Researcher @ WePWN.",
	links: [
		{
			name: "LinkedIn",
			icon: "fa6-brands:linkedin",
			url: "https://www.linkedin.com/in/abdoullah-abderrahmane-072865254/",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/rozoxc",
		},
		{
			name: "Email",
			icon: "fa6-solid:envelope",
			url: "mailto:abdoullahabderrahhman@gmail.com",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};
