import { type FC, useEffect } from "react";
import { useLocation } from "react-router";

interface ScrollToTopProps extends React.PropsWithChildren {
  behavior?: ScrollBehavior; // "auto" | "instant" | "smooth"
  disabled?: boolean;
}

export const ScrollToTop: FC<ScrollToTopProps> = ({
  behavior = "auto",
  disabled = false,
  children,
}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (disabled || typeof window === "undefined") return;

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior });
    });
  }, [pathname, behavior, disabled]);

  return children;
};
