import React, {useState} from "react";

import {Folder} from "../../../lib/interfaces";
import {ItemFolderCard} from "./ItemFolderCard";

interface ItemsListProps {
  title?: string;
  items: Folder[];
}

export const ItemFolderList: React.FC<ItemsListProps> = ({
  title = "",
  items,
}: ItemsListProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const nMinusOne = itemsPerPage - 1;
  const maxPage = Math.ceil(items.length / nMinusOne) - 1;

  const nextPage = () => {
    setCurrentPage((current) => (current < maxPage ? current + 1 : current));
  };

  const prevPage = () => {
    setCurrentPage((current) => (current > 0 ? current - 1 : current));
  };

  const itemWidth = 100 / nMinusOne; // as a percentage

  return (
    <div className="card  w-full overflow-visible">
      <h2 className="card-title -z-50 mx-6 my-4 text-2xl lg:text-3xl">
        {title}
      </h2>
      <div className="relative">
        {currentPage > 0 && (
          <button
            className="btn btn-circle btn-outline no-animation absolute left-0 top-[2%] z-30 flex h-full items-center justify-center p-4"
            onClick={prevPage}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-12 w-12">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
        )}
        <div className="overflow-visible">
          <div
            className="flex overflow-visible transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${
                currentPage * (100 / itemsPerPage) * nMinusOne +
                (currentPage === 0 ? 0 : 16.7)
              }%)`,
            }}>
            {items.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0"
                style={{width: `${itemWidth}%`}}>
                <ItemFolderCard data={item} />
              </div>
            ))}
          </div>
        </div>
        {currentPage < maxPage && (
          <button
            className="btn btn-circle btn-outline no-animation absolute right-0 top-[2%] z-30 flex h-full items-center justify-center p-4"
            onClick={nextPage}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-12 w-12">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
