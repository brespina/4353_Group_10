import { Link, useMatch, useResolvedPath } from "react-router-dom";

interface Props {
  to: string;
  children: string;
}

function Navbar() {
  return (
    <nav className="nav">
      <Link to="Home" className="siteTitle">
        Singh City Fuel
      </Link>
      <ul>
        <CustomLink to="/">Login</CustomLink>
        <CustomLink to="/register">Register</CustomLink>
        <CustomLink to="/profile">Profile</CustomLink>
        <CustomLink to="/fuelquote">Fuel Quote</CustomLink>
        <CustomLink to="/history">Fuel History</CustomLink>
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
