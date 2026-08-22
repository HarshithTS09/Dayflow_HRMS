import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-4 text-center">
      <p className="font-display text-5xl font-extrabold text-ink-900">404</p>
      <p className="text-sm text-ink-500">This page doesn't exist in Dayflow.</p>
      <Link to="/">
        <Button variant="accent" size="sm">Back home</Button>
      </Link>
    </div>
  );
}
