import {FC} from "react";

export const HeartButton: FC<{onClick: () => void; type: number}> = ({
  onClick,
  type,
}) => {
  const typeList = ["Book", "Song", "Movie"];
  return (
    <>
      <button onClick={onClick} className="badge absolute  bg-pink-200">
        <svg
          className="h-5 w-5 fill-current text-pink-500"
          width="30px"
          height="30px"
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg">
          <path d="M25 39.7l-.6-.5C11.5 28.7 8 25 8 19c0-5 4-9 9-9 4.1 0 6.4 2.3 8 4.1 1.6-1.8 3.9-4.1 8-4.1 5 0 9 4 9 9 0 6-3.5 9.7-16.4 20.2l-.6.5zM17 12c-3.9 0-7 3.1-7 7 0 5.1 3.2 8.5 15 18.1 11.8-9.6 15-13 15-18.1 0-3.9-3.1-7-7-7-3.5 0-5.4 2.1-6.9 3.8L25 17.1l-1.1-1.3C22.4 14.1 20.5 12 17 12z" />
        </svg>
        {typeList[type]}
      </button>
    </>
  );
};
