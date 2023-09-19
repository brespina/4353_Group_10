import { Link, useMatch, useResolvedPath } from "react-router-dom";

interface Props {
  to: string;
  children: string;
}

function Navbar() {
  return (
    <nav className="nav">
      <Link to="/" className="siteTitle">
        Singh City Fuel
      </Link>
      <ul>
        <CustomLink to="/login">Login</CustomLink>
        <CustomLink to="/register">Register</CustomLink>
        <CustomLink to="/profile">Profile(replace once auth is created)</CustomLink>
      </ul>
    </nav>
  );
}

function CustomLink({ to, children, ...props }: Props) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });
  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}

export default Navbar;
