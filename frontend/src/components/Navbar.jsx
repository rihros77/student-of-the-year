import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="font-bold text-xl">Student of the Year</h1>
        <div className="space-x-4">
          <Link
            to="/"
            className="hover:underline transition"
          >
            Home
          </Link>
          <Link
            to="/leaderboard"
            className="hover:underline transition"
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
