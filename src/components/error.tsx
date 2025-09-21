import { type FC } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/elements";

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const Error: FC<ErrorProps> = ({
  message = "Something went wrong. Please try again.",
  onRetry,
  showRetry = true,
}) => {
  return (
    <div className="text-center">
      <div className="bg-error/5 mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
        <Icons.triangleAlert className="text-error size-5" />
      </div>

      <p className="text-body text-text-200 mb-4 font-normal">{message}</p>

      {showRetry && onRetry && (
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          className="text-label-sm! w-fit px-6 py-2"
        >
          <Icons.refreshCw className="size-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};
