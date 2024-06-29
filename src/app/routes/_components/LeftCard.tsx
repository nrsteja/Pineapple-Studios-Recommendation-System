// LeftCard.tsx
import React, {ReactNode} from "react";

interface LeftCardProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

const LeftCard: React.FC<LeftCardProps> = ({
  imageUrl,
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="lg:m-sm card w-full min-w-72 bg-base-200 shadow-xl lg:sticky lg:bottom-[16px]">
      <div className="card-title">
        <div className="avatar m-6">
          <div className="h-24 w-24 rounded-full">
            <img src={imageUrl} alt="Profile" />
          </div>
        </div>
        <h2 className="block pt-7 max-lg:text-xl lg:text-2xl">
          {title}
          <span className="text-eclipse mt-2 block truncate max-lg:text-sm lg:text-xl">
            {subtitle}
          </span>
        </h2>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
};

export default LeftCard;
