"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useSiteSettings } from "../context/SiteSettingsContext";
import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  ChatIcon,
  PageIcon,
  UserCircleIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <PageIcon />,
    name: "Konten Beranda",
    subItems: [
      { name: "Hero Section", path: "/landing-page/hero", pro: false },
      { name: "Sambutan", path: "/landing-page/sambutan", pro: false },
      { name: "Video Section", path: "/landing-page/video", pro: false },
      { name: "CTA Section", path: "/landing-page/cta", pro: false },
    ],
  },
  {
    icon: <GroupIcon />,
    name: "Profil Organisasi",
    subItems: [
      { name: "Sejarah", path: "/sejarah", pro: false },
      { name: "Visi & Misi", path: "/visi-misi", pro: false },
      { name: "HIMA Inti", path: "/hima-inti", pro: false },
      { name: "Manajemen Divisi", path: "/divisions", pro: false },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Kegiatan & Program",
    subItems: [
      { name: "Event", path: "/events", pro: false },
      { name: "Program Kerja", path: "/programs", pro: false },
      { name: "Galeri Kegiatan", path: "/galleries", pro: false },
    ],
  },
  {
    icon: <ChatIcon />,
    name: "Publikasi & Arsip",
    subItems: [
      { name: "Semua Berita", path: "/news", pro: false },
      { name: "Kategori Berita", path: "/news/categories", pro: false },
      { name: "Semua Dokumen", path: "/documents", pro: false },
      { name: "Kategori Dokumen", path: "/documents/categories", pro: false },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Pengaturan",
    subItems: [
      { name: "Pengaturan Situs", path: "/site-settings", pro: false },
      { name: "Pengaturan Admin", path: "/settings", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { settings, loading: settingsLoading } = useSiteSettings();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={` ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex items-center gap-3 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/dashboard" className="flex items-center gap-3">
          {/* Skeleton Loading State */}
          {settingsLoading ? (
            isExpanded || isHovered || isMobileOpen ? (
              <div className="flex items-center gap-3">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-10 h-10" />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-24 h-5" />
              </div>
            ) : (
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-8 h-8" />
            )
          ) : isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-3">
              {/* Logo with constrained size */}
              {/* Light mode: show custom logo or default */}
              <Image
                className="dark:hidden max-h-10 w-auto object-contain"
                src={settings?.logo_url || "/images/logo/logo.svg"}
                alt={settings?.site_name || "Logo"}
                width={150}
                height={40}
                style={{ maxHeight: "40px", width: "auto" }}
              />
              {/* Dark mode: show dark logo, or light logo as fallback, or default */}
              <Image
                className="hidden dark:block max-h-10 w-auto object-contain"
                src={settings?.logo_dark_url || settings?.logo_url || "/images/logo/logo-dark.svg"}
                alt={settings?.site_name || "Logo"}
                width={150}
                height={40}
                style={{ maxHeight: "40px", width: "auto" }}
              />
              {/* Dynamic Site Name - only show if using custom logos (without built-in text) */}
              {settings?.site_name && settings?.logo_url && (
                <span className="text-lg font-bold text-gray-800 dark:text-white whitespace-nowrap">
                  {settings.site_name}
                </span>
              )}
            </div>
          ) : (
            <Image
              src={settings?.favicon_url || settings?.logo_url || "/images/logo/logo-icon.svg"}
              alt={settings?.site_name || "Logo"}
              width={32}
              height={32}
              className="rounded"
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu Utama"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {othersItems.length > 0 && (
              <div className="">
                <h2
                  className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Lainnya"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
