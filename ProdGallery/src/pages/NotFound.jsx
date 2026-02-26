import { Link } from "react-router-dom";
import Container from "../components/common/Container";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Container className="text-center py-20">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Sorry, the page you're looking for doesn't exist. It might have been
          moved or deleted.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Go to Home
          </Link>
          <Link
            to="/gallery"
            className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-100 transition"
          >
            Back to Gallery
          </Link>
        </div>

        <div className="mt-16">
          <p className="text-gray-600 mb-4">Need help? Contact us:</p>
          <a
            href="mailto:hello@prodgallery.com"
            className="text-emerald-600 hover:underline"
          >
            hello@prodgallery.com
          </a>
        </div>
      </Container>
    </div>
  );
}
