
import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="kasadya-gradient text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Have questions about our marketplace? Get in touch with our team.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 border border-gray-200 rounded-lg text-center hover:border-kasadya-purple hover:shadow-md transition-all">
              <div className="mx-auto mb-4 w-16 h-16 bg-kasadya-light-gray rounded-full flex items-center justify-center">
                <MapPin className="h-8 w-8 text-kasadya-purple" />
              </div>
              <h3 className="text-lg font-bold mb-2">Our Location</h3>
              <p className="text-gray-600">123 Main Street, Tagum City, Davao del Norte, Philippines</p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg text-center hover:border-kasadya-purple hover:shadow-md transition-all">
              <div className="mx-auto mb-4 w-16 h-16 bg-kasadya-light-gray rounded-full flex items-center justify-center">
                <Phone className="h-8 w-8 text-kasadya-purple" />
              </div>
              <h3 className="text-lg font-bold mb-2">Phone Number</h3>
              <p className="text-gray-600">+63 (123) 456-7890</p>
              <p className="text-gray-600">+63 (987) 654-3210</p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg text-center hover:border-kasadya-purple hover:shadow-md transition-all">
              <div className="mx-auto mb-4 w-16 h-16 bg-kasadya-light-gray rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-kasadya-purple" />
              </div>
              <h3 className="text-lg font-bold mb-2">Email Address</h3>
              <p className="text-gray-600">info@kasadyamarketplace.com</p>
              <p className="text-gray-600">support@kasadyamarketplace.com</p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg text-center hover:border-kasadya-purple hover:shadow-md transition-all">
              <div className="mx-auto mb-4 w-16 h-16 bg-kasadya-light-gray rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-kasadya-purple" />
              </div>
              <h3 className="text-lg font-bold mb-2">Office Hours</h3>
              <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM</p>
              <p className="text-gray-600">Saturday: 9:00 AM - 12:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="section-padding bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Send Us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="name">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="email">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="subject">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="message">
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows={5}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full md:w-auto bg-kasadya-purple hover:bg-kasadya-deep-purple"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
            </div>
            
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Find Us</h2>
              <div className="h-96 bg-gray-200 rounded-lg overflow-hidden">
                <iframe 
                  title="Kasadya Marketplace Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126712.46295881832!2d125.8048451525635!3d7.448495529154395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f946e084bb7dcd%3A0xfaef9a7eae658d01!2sTagum%20City%2C%20Davao%20del%20Norte%2C%20Philippines!5e0!3m2!1sen!2sus!4v1712274693399!5m2!1sen!2sus" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Common questions about Kasadya Marketplace and our services
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 border border-gray-200 rounded-lg hover:border-kasadya-purple hover:shadow-md transition-all">
              <h3 className="text-lg font-bold mb-2">How do I book a vendor?</h3>
              <p className="text-gray-600">
                You can browse our vendor listings and use the "Contact Vendor" button to reach out directly. Once you've discussed your needs, you can proceed with booking.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg hover:border-kasadya-purple hover:shadow-md transition-all">
              <h3 className="text-lg font-bold mb-2">Are all vendors verified?</h3>
              <p className="text-gray-600">
                Yes, we personally vet all vendors before they can list their services on our marketplace to ensure quality and reliability.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg hover:border-kasadya-purple hover:shadow-md transition-all">
              <h3 className="text-lg font-bold mb-2">How do I become a vendor?</h3>
              <p className="text-gray-600">
                Click on the "Become a Vendor" button on our Vendors page and fill out the application form. Our team will review your submission and get back to you.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg hover:border-kasadya-purple hover:shadow-md transition-all">
              <h3 className="text-lg font-bold mb-2">Do you offer package deals?</h3>
              <p className="text-gray-600">
                Some of our vendors offer package deals for multiple services. You can inquire about these when contacting individual vendors.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
