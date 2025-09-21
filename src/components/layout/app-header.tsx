import { Fragment } from "react";


interface AppHeaderProps {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const AppHeader = ({
  startAdornment = <Fragment />,
  endAdornment = <Fragment />,
}: AppHeaderProps) => {
  return (
    <header className="bg-background-100 border-b-background-300 shadow-down sticky top-0 z-50 grid h-18 w-full grid-cols-3 items-center border-b px-5 py-4">
      <div className="flex justify-start">{startAdornment}</div>

      

      <div className="flex justify-end">{endAdornment}</div>
    </header>
  );
};
