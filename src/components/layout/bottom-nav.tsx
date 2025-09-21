import { useLocation } from "react-router";
import { Link } from "react-router";
import { cn } from "@/utils/cn";
import { Icons } from "@/components/icons";

export const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="shadow-up bg-background-100 border-background-300 sticky bottom-0 h-18 w-full border-t px-5 py-4">
      <div className="flex h-full">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.url}
              className="grid h-full grow place-items-center"
            >
              <button
                type="button"
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-1",
                  item.url === pathname ? "text-primary-200" : "text-text-200",
                )}
              >
                <Icon className="size-5 text-inherit" />

                <span className="text-body-xs inline-flex font-medium text-inherit">
                  {item.name}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const navItems = [
  { name: "Home", url: "/", icon: Icons.house },
  { name: "Connect", url: "/connect-play", icon: Icons.handshake },
  { name: "Bookings", url: "/bookings", icon: Icons.ticket },
  { name: "Profile", url: "/profile", icon: Icons.user },
];
