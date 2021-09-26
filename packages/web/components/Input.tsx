import React from "react";
import classNames from "../lib/classNames";
import FocusRing from "./FocusRing";

const Input: React.FC<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
> = ({ defaultValue, ...props }) => (
  <div>
    <FocusRing>
      <div
        className={classNames(
          `outline-none rounded-lg box-border font-normal
          border border-gray-200 focus:py-[7px] focus:px-[9px]
          focus:border-2
          shadow-sm flex items-center`,
          props.className
        )}
      >
        <input
          {...props}
          className="py-[8px] px-[10px] outline-none rounded-lg w-full"
        />
      </div>
    </FocusRing>
  </div>
);

export default Input;
