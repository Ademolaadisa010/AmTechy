"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function BottomBar(){
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Hide on scroll down, show on scroll up
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const navItems = [
        { href: "/dashboard", icon: "fa-house", label: "Home" },
        { href: "/mylearning", icon: "fa-book-open", label: "Learning" },
        { href: "/find-tutor", icon: "fa-users", label: "Tutors" },
        { href: "/certificates", icon: "fa-certificate", label: "Certificates" },
        { href: "/community", icon: "fa-message", label: "Community" },
        { href: "/progress", icon: "fa-chart-line", label: "Progress" },
        { href: "/profile", icon: "fa-user", label: "Profile" },
    ];

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard" || pathname === "/";
        }
        return pathname === href || pathname?.startsWith(href);
    };

    return (
        <div className="md:hidden pb-20">
            <nav 
                className={`fixed bottom-0 left-0 right-0 w-full bg-white border-t border-slate-200 z-40 transition-transform duration-300 ease-in-out ${
                    isVisible ? "translate-y-0" : "translate-y-full"
                }`}
            >
                <div className="flex justify-around items-center px-1 py-3 h-20">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link key={item.href} href={item.href} className="flex-1">
                                <button 
                                    className={`flex flex-col items-center justify-center gap-1 w-full h-full py-2 px-1 relative transition-all duration-200 rounded-lg ${
                                        active
                                            ? "text-[#1e40af]"
                                            : "text-slate-500 hover:text-slate-700 active:bg-slate-100"
                                    }`}
                                >
                                    {/* Icon Container */}
                                    <div className={`relative transition-all duration-200 ${active ? "scale-110" : "scale-100"}`}>
                                        <i 
                                            className={`fa-solid ${item.icon} w-6 h-6`}
                                        ></i>
                                        
                                        {/* Active Indicator Dot */}
                                        {active && (
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1e40af] rounded-full animate-pulse"></div>
                                        )}
                                    </div>
                                    
                                    {/* Label */}
                                    <span className={`text-[9px] font-semibold transition-all duration-200 ${
                                        active 
                                            ? "text-[#1e40af]" 
                                            : "text-slate-600"
                                    }`}>
                                        {item.label}
                                    </span>

                                    {/* Active Background Indicator */}
                                    {active && (
                                        <div className="absolute inset-0 bg-[#1e40af]/5 rounded-lg -z-10"></div>
                                    )}
                                </button>
                            </Link>
                        );
                    })}
                </div>

                <div className="h-safe-bottom bg-white"></div>
            </nav>
        </div>
    );
}