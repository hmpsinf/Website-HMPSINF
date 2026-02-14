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
  PieChartIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  ChatIcon,
  PageIcon,
  UserCircleIcon,
  TaskIcon,
  DocsIcon,
  InfoIcon,
  BoxIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

type NavGroup = {
  name: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    name: "Menu Utama",
    items: [
      {
        icon: <PieChartIcon />,
        name: "Dashboard",
        path: "/dashboard",
      },
    ],
  },
  {
    name: "Konten Website",
    items: [
      {
        icon: <PageIcon />,
        name: "Landing Page",
        subItems: [
          { name: "Hero Section", path: "/landing-page/hero", pro: false },
          { name: "Sambutan", path: "/landing-page/sambutan", pro: false },
          { name: "Video Section", path: "/landing-page/video", pro: false },
          { name: "CTA Section", path: "/landing-page/cta", pro: false },
          { name: "Sponsorship", path: "/sponsorship", pro: false },
          { name: "Marketing Popup", path: "/popup", pro: false },
        ],
      },
    ],
  },
  {
    name: "Organisasi",
    items: [
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
    ],
  },
  {
    name: "Program & Kegiatan",
    items: [
      {
        icon: <CalenderIcon />,
        name: "Event",
        path: "/events",
      },
      {
        icon: <TaskIcon />,
        name: "Program Kerja",
        path: "/programs",
      },
      {
        icon: <GridIcon />,
        name: "Galeri Kegiatan",
        path: "/galleries",
      },
    ],
  },
  {
    name: "Publikasi",
    items: [
      {
        icon: <ChatIcon />,
        name: "Berita",
        subItems: [
          { name: "Semua Berita", path: "/news", pro: false },
          { name: "Kategori", path: "/news/categories", pro: false },
        ],
      },
      {
        icon: <DocsIcon />,
        name: "Dokumen",
        subItems: [
          { name: "Semua Dokumen", path: "/documents", pro: false },
          { name: "Kategori", path: "/documents/categories", pro: false },
        ],
      },
      {
        icon: <InfoIcon />,
        name: "Pengumuman",
        path: "/announcements",
      },
    ],
  },
  {
    name: "Pengaturan",
    items: [
      {
        icon: <BoxIcon />,
        name: "Pengaturan Situs",
        path: "/site-settings",
      },
      {
        icon: <UserCircleIcon />,
        name: "Pengaturan Admin",
        path: "/settings",
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { settings, loading: settingsLoading } = useSiteSettings();
  const pathname = usePathname();

  // State to track open submenu using unique ID (groupIndex-itemIndex)
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    navGroups.forEach((group, groupIndex) => {
      group.items.forEach((nav, itemIndex) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenuId(`${groupIndex}-${itemIndex}`);
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenuId(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenuId !== null) {
      if (subMenuRefs.current[openSubmenuId]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [openSubmenuId]: subMenuRefs.current[openSubmenuId]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenuId]);

  const handleSubmenuToggle = (id: string) => {
    setOpenSubmenuId((prevId) => (prevId === id ? null : id));
  };

  const renderMenuItems = (navItems: NavItem[], groupIndex: number) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, itemIndex) => {
        const uniqueId = `${groupIndex}-${itemIndex}`;
        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(uniqueId)}
                className={`menu-item group ${openSubmenuId === uniqueId
                  ? "menu-item-active"
                  : "menu-item-inactive"
                  } cursor-pointer ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                  }`}
              >
                <span
                  className={` ${openSubmenuId === uniqueId
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
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenuId === uniqueId
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
                  className={`menu-item group ${isActive(nav.path)
                    ? "menu-item-active"
                    : "menu-item-inactive"
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
                  subMenuRefs.current[uniqueId] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenuId === uniqueId
                      ? `${subMenuHeight[uniqueId]}px`
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
        );
      })}
    </ul>
  );

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
      {/* Brand Section */}
      <div
        className={`py-8 flex items-center gap-3 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/dashboard" className="flex items-center gap-3">
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
              <Image
                className="dark:hidden max-h-10 w-auto object-contain"
                src={settings?.logo_url || "/images/logo/logo.svg"}
                alt={settings?.site_name || "Logo"}
                width={150}
                height={40}
                style={{ maxHeight: "40px", width: "auto" }}
              />
              <Image
                className="hidden dark:block max-h-10 w-auto object-contain"
                src={
                  settings?.logo_dark_url ||
                  settings?.logo_url ||
                  "/images/logo/logo-dark.svg"
                }
                alt={settings?.site_name || "Logo"}
                width={150}
                height={40}
                style={{ maxHeight: "40px", width: "auto" }}
              />
              {settings?.site_name && settings?.logo_url && (
                <span className="text-lg font-bold text-gray-800 dark:text-white whitespace-nowrap">
                  {settings.site_name}
                </span>
              )}
            </div>
          ) : (
            <Image
              src={
                settings?.favicon_url ||
                settings?.logo_url ||
                "/images/logo/logo-icon.svg"
              }
              alt={settings?.site_name || "Logo"}
              width={32}
              height={32}
              className="rounded"
            />
          )}
        </Link>
      </div>

      {/* Menu Section */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {navGroups.map((group, groupIndex) => (
              <div key={group.name}>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    group.name
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(group.items, groupIndex)}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
