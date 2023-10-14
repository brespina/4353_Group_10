import { Link, useMatch, useResolvedPath, Navigate } from "react-router-dom";

interface Props {
  to: string;
  children: string;
  onClick?: () => void;
}

function Navbar() {
  const handleLogout = (): JSX.Element => {
    localStorage.removeItem('token')
    return <Navigate to = "/" />;
  }

  return (
    <nav className="nav">
      <Link to="Home" className="siteTitle">
        Singh City Fuel
      </Link>
      <ul>
        <CustomLink to="/profile">Profile</CustomLink>
        <CustomLink to="/fuelquote">Fuel Quote</CustomLink>
        <CustomLink to="/history">Fuel History</CustomLink>
        <CustomLink to="/" onClick={handleLogout}>Logout</CustomLink>
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
