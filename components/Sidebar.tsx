"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CheckSquareIcon, FileIcon, FolderIcon, LogOutIcon } from "@/components/icons";
import { clearUser, getUser } from "@/lib/auth";

const NAV = [
  { href: "/dashboard/checker", label: "Essay Checker", Icon: CheckSquareIcon },
  { href: "/dashboard/grader",  label: "Essay Grader",  Icon: FileIcon },
  { href: "/dashboard/files",   label: "Files",         Icon: FolderIcon },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const user     = getUser();

  function handleLogout() {
    clearUser();
    router.push("/");
  }

  const roleLabel = user?.role === "INSTRUCTOR" ? "Instructor" : "Student";
  const avatar    = roleLabel[0];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">EasyEssays</div>
      <div className="sidebar-divider" />

      <nav className="sidebar-nav">
        {NAV.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link${pathname.startsWith(href) ? " active" : ""}`}
          >
            <Icon /> {label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{avatar}</div>
          <div>
            <div className="sidebar-username">{roleLabel}</div>
            <div className="sidebar-settings">ID: {user?.userId ?? "—"}</div>
          </div>
        </div>
        <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
          <LogOutIcon /> Log Out
        </button>
      </div>
    </aside>
  );
}