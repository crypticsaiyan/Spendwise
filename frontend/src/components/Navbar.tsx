import { NavLink, Link } from "react-router";

function Navbar() {
  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
      <div className="flex justify-center items-center gap-10">
        <div className="text-xl font-bold">SpendWise</div>

        <div className="flex items-center gap-4 flex-1 justify-center">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/pricing">hamburger</Link>
      </div>
    </nav>
  );
}

export default Navbar;
