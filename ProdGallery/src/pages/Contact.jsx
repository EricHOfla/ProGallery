import { useState } from "react";
import Container from "../components/common/Container";
import SectionTitle from "../components/common/SectionTitle";
import Button from "../components/common/Button";
import { contactAPI } from "../services/api";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await contactAPI.submit({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });
      
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-8 md:py-16">
      <SectionTitle
        title="Get in Touch"
        subtitle="Have questions? We'd love to hear from you. Send us a message!"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
        {/* Contact Form */}
        <div>
          {submitted && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              Thank you! We've received your message and will get back to you
              soon.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block font-semibold mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                placeholder="Wedding Photography Inquiry"
              />
            </div>

            <div>
              <label htmlFor="message" className="block font-semibold mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                placeholder="Tell us about your project..."
              ></textarea>
            </div>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>

        {/* Contact Information */}
        <div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 md:p-8 space-y-6 md:space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <a
                href="mailto:prodgallery7@gmail.com"
                className="text-emerald-600 hover:underline"
              >
                prodgallery7@gmail.com
              </a>
              <p className="text-sm text-gray-600 mt-1">
                Response time: Within 24 hours
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Phone</h3>
              <a
                href="tel:+250786079810"
                className="text-emerald-600 hover:underline"
              >
                +250 786 079 810
              </a>
              <p className="text-sm text-gray-600 mt-1">
                Available: Every day, 7am-9pm
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Address</h3>
              <p className="text-gray-700">
                Remera, Gasabo
                <br />
                Kigali, Rwanda
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition"
                >
                  f
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition"
                >
                  📷
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition"
                >
                  in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
