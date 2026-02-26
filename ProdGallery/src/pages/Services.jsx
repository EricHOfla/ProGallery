import Container from "../components/common/Container";
import SectionTitle from "../components/common/SectionTitle";

export default function Services() {
  const services = [
    {
      id: 1,
      title: "Wedding Photography",
      description:
        "Capture the magic and emotion of your special day with our professional wedding photography services.",
      price: "Starting at $2,500",
      icon: "💍",
    },
    {
      id: 2,
      title: "Portraits & Headshots",
      description:
        "Professional portrait sessions for individuals, families, and corporate headshots with expert lighting and editing.",
      price: "Starting at $300",
      icon: "👤",
    },
    {
      id: 3,
      title: "Corporate Photography",
      description:
        "Document your business events, team building, and corporate functions with professional photography.",
      price: "Starting at $1,500",
      icon: "🏢",
    },
    {
      id: 4,
      title: "Product Photography",
      description:
        "Showcase your products with stunning photography perfect for e-commerce and marketing materials.",
      price: "Starting at $800",
      icon: "📦",
    },
    {
      id: 5,
      title: "Videography",
      description:
        "Professional video production for weddings, events, commercials, and documentary-style storytelling.",
      price: "Starting at $3,000",
      icon: "🎥",
    },
    {
      id: 6,
      title: "Event Coverage",
      description:
        "Full event coverage from corporate conferences to birthday celebrations and milestone moments.",
      price: "Starting at $1,200",
      icon: "🎉",
    },
  ];

  return (
    <Container className="py-8 md:py-16">
      <SectionTitle
        title="Our Services"
        subtitle="Professional photography and videography solutions for every occasion"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white border rounded-lg p-8 hover:shadow-lg transition"
          >
            <div className="text-4xl mb-4">{service.icon}</div>
            <h3 className="text-xl font-bold mb-3">{service.title}</h3>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <p className="text-emerald-600 font-semibold">{service.price}</p>
          </div>
        ))}
      </div>

      <div className="bg-emerald-600 text-white rounded-lg p-8 md:p-12 text-center">
        <h3 className="text-xl md:text-2xl font-bold mb-4">Custom Packages Available</h3>
        <p className="mb-6 text-emerald-100 text-sm md:text-base">
          Don't see what you're looking for? We create custom packages tailored
          to your specific needs and budget.
        </p>
        <button className="bg-white text-emerald-600 px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-100 transition text-sm md:text-base">
          Request a Quote
        </button>
      </div>
    </Container>
  );
}
