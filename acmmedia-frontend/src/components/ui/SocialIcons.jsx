import React from "react";

const icon = (children) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

/** Chapter social links, shared by the footer and the mobile menu. */
export const SOCIALS = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/xim-acm/",
    svg: icon(<><rect x="3" y="3" width="18" height="18" rx="3" /><line x1="8" y1="10" x2="8" y2="16" /><line x1="8" y1="7.5" x2="8" y2="7.5" /><path d="M12 16v-6M12 12.5c0-1.4 1-2.5 2.4-2.5s2.1 1 2.1 2.6V16" /></>),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/xim_acm/",
    svg: icon(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" /></>),
  },
  {
    name: "GitHub",
    href: "https://github.com/ACM-XIM",
    svg: icon(<path d="M9 19c-4 1.3-4-2-6-2.5m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.600 4.600 0 0 0-1.300-3.200 4.200 4.200 0 0 0-.1-3.200s-1-.3-3.400 1.300a11.700 11.700 0 0 0-6 0C6.800 2.800 5.800 3.100 5.800 3.100a4.200 4.200 0 0 0-.1 3.200A4.600 4.600 0 0 0 4.400 9.500c0 4.600 2.700 5.700 5.500 6-.6.600-.6 1.200-.5 2V21" />),
  },
  {
    name: "Chapter website",
    href: "https://www.acmxim.space/",
    svg: icon(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>),
  },
];
