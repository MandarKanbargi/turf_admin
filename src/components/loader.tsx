import { type FC } from "react";

interface LoaderProps {
  message?: string;
}

export const Loader: FC<LoaderProps> = ({ message = "Loading..." }) => {
  return (
    <div className="text-center">
      <div className="border-primary-200 mx-auto mb-4 size-12 animate-spin rounded-full border-b-2" />
      <span className="text-body text-text-200 inline-flex font-normal">
        {message}
      </span>
    </div>
  );
};
