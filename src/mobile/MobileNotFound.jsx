import { Link } from "react-router-dom";
import { MobilePageHead } from "./MobileNav.jsx";

export function MobileNotFound() {
  return (
    <div>
      <MobilePageHead eyebrow="404" title="Page not found" dek="The page you were looking for has moved or doesn't exist." />
      <div style={{ padding: "20px var(--pad)" }}>
        <Link to="/" className="sm-btn sm-btn-primary sm-btn-block">Back to home</Link>
      </div>
    </div>
  );
}
