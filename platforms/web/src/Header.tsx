import { useNavigate } from "react-router-dom";
import logo from "./logo.svg";
import "./Header.css";

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="app-header">
      <div className="header-inner">
        <div
          className="header-left"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="Logo" className="header-logo" />
          <h1 className="header-title">Learningmap</h1>
        </div>
        {children && <div className="header-right">{children}</div>}
      </div>
    </div>
  );
}
