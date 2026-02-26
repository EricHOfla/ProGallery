import Container from "../common/Container";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-12 md:mt-20">
      <Container className="py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8">
          <div>
            <img
              src="/src/assets/logo/prodgallery-logo.jpeg"
              alt="ProdGallery Logo"
              className="h-12 w-auto mb-4"
            />
            <p className="text-gray-400">
              Turning moments into timeless stories through photography and
              videography.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="text-gray-400 space-y-2">
              <li>
                <a href="/" className="hover:text-emerald-400 transition">
                  Home
                </a>
              </li>
              <li>
                <a href="/gallery" className="hover:text-emerald-400 transition">
                  Gallery
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-emerald-400 transition">
                  About
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="text-gray-400 space-y-2">
              <li>
                <a href="/services" className="hover:text-emerald-400 transition">
                  Weddings
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-emerald-400 transition">
                  Portraits
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-emerald-400 transition">
                  Corporate
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="text-gray-400 space-y-2">
              <li>Email: prodgallery7@gmail.com</li>
              <li>Phone: +250 786 079 810</li>
              <li>Address: Remera, Gasabo, Kigali, Rwanda</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 md:pt-8 text-center text-gray-400 text-xs md:text-sm">
          <p>
            &copy; {currentYear} ProdGallery. All rights reserved. | Privacy
            Policy | Terms of Service
          </p>
        </div>
      </Container>
    </footer>
  );
}
