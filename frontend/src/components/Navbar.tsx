import React from "react";
import { NavLink, Link } from "react-router";

function Navbar() {
  return (
    <>
      <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
        <div className="text-xl font-bold">SpendWise</div>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "text-red-500" : "")}
          end
        >
          Home
        </NavLink>
        <NavLink
          to="/signin"
          className={({ isActive }) => (isActive ? "text-red-500" : "")}
          end
        >
          Signin
        </NavLink>
        <Link to="/pricing">Pricing</Link>
      </nav>
    </>
  );
}

export default Navbar;
