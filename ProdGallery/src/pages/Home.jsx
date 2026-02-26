import { Link } from "react-router-dom";
import { photos } from "../data/photos";
import Container from "../components/common/Container";
import SectionTitle from "../components/common/SectionTitle";
import Button from "../components/common/Button";
import PhotoCard from "../components/gallery/PhotoCard";

export default function Home() {
  const featuredPhotos = photos.slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen bg-linear-to-r from-emerald-800 to-teal-900 text-white flex items-center">
        <Container className="py-12 md:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            Turning Moments into <span className="text-yellow-300">Timeless Stories</span>
          </h1>

          <p className="mt-4 md:mt-6 text-base sm:text-lg md:text-xl text-emerald-100 max-w-3xl mx-auto mb-6 md:mb-10 px-4">
            ProdGallery is a creative studio bringing moments and stories to life through
            professional photography, videography, and art. We specialize in weddings,
            celebrations, portraits, corporate and product shoots, and documentary storytelling.
          </p>

          <div className="flex justify-center gap-3 md:gap-4 flex-wrap px-4">
            <Button variant="primary">
              <Link to="/gallery">Explore Gallery</Link>
            </Button>
            <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
              <Link to="/contact">Book a Session</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Featured Photos Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <Container>
          <SectionTitle
            title="Featured Work"
            subtitle="Explore some of our most stunning recent photography"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            {featuredPhotos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline">
              <Link to="/gallery">View All Gallery</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section className="py-12 md:py-20">
        <Container>
          <SectionTitle
            title="Our Services"
            subtitle="Professional photography for every occasion"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            {[
              {
                icon: "💍",
                title: "Weddings",
                description:
                  "Capture the magic of your special day with our professional wedding photography.",
              },
              {
                icon: "📸",
                title: "Portraits",
                description:
                  "Beautiful portrait sessions for individuals, families, and corporate headshots.",
              },
              {
                icon: "🏢",
                title: "Corporate",
                description:
                  "Professional event coverage and corporate photography solutions.",
              },
            ].map((service, idx) => (
              <div key={idx} className="text-center p-4 md:p-6 bg-gray-50 rounded-lg hover:shadow-lg transition">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button variant="primary">
              <Link to="/services">View All Services</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-emerald-600 text-white">
        <Container className="text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
            Ready to Create Something Amazing?
          </h2>
            <p className="text-base sm:text-lg md:text-lg text-emerald-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Let's work together to bring your vision to life. Contact us today to discuss your project.
          </p>
            <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
