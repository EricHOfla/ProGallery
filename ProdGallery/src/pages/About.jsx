import Container from "../components/common/Container";
import SectionTitle from "../components/common/SectionTitle";
import Button from "../components/common/Button";

export default function About() {
  return (
    <Container className="py-8 md:py-16">
      <SectionTitle
        title="About ProdGallery"
        subtitle="Our Story and Vision"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
        <div>
          <img
            src="/images/about.jpg"
            alt="Our team"
            className="w-full rounded-lg shadow-lg"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop";
            }}
          />
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-4">Who We Are</h3>
          <p className="text-gray-700 mb-4">
            ProdGallery is a creative studio dedicated to capturing life's most
            precious moments. Founded in 2015, we've been helping individuals,
            families, and businesses tell their stories through stunning
            photography.
          </p>

          <h3 className="text-2xl font-bold mb-4 mt-8">Our Mission</h3>
          <p className="text-gray-700 mb-4">
            Our mission is to create timeless visual content that evokes
            emotion, preserves memories, and transforms visions into reality.
            We believe every moment deserves to be beautifully documented.
          </p>

          <h3 className="text-2xl font-bold mb-4 mt-8">Our Values</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-emerald-600 mr-3 font-bold">✓</span>
              <span>
                <strong>Quality:</strong> We never compromise on quality
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-3 font-bold">✓</span>
              <span>
                <strong>Creativity:</strong> Innovation in every frame
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-3 font-bold">✓</span>
              <span>
                <strong>Passion:</strong> Genuine love for our craft
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-3 font-bold">✓</span>
              <span>
                <strong>Client-Focused:</strong> Your vision is our priority
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 md:p-12 text-center mb-8 md:mb-16">
        <h3 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Our Achievements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          <div>
            <p className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">500+</p>
            <p className="text-gray-700 text-sm md:text-base">Happy Clients</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">10K+</p>
            <p className="text-gray-700 text-sm md:text-base">Photos Delivered</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">50+</p>
            <p className="text-gray-700 text-sm md:text-base">Awards Won</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-bold mb-6">Ready to Work Together?</h3>
        <Button variant="primary">Get in Touch</Button>
      </div>
    </Container>
  );
}
