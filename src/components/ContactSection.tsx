import React from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Check, Sparkles } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [sending, setSending] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    }, 1000);
  };

  return (
    <section className="py-16 bg-white" id="contact-us-portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] uppercase font-bold text-amber-600 tracking-widest block mb-1">Get In Touch</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-950">Let's Connect & Converse</h2>
          <div className="w-16 h-1 bg-amber-600 mx-auto mt-3 rounded"></div>
          <p className="text-sm text-amber-900/70 mt-3 leading-relaxed">Reach out for bulk distribution, premium farm partnerships, or customer assistance queries.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sourcing Information Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Phone */}
            <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 shadow-sm">
                <Phone size={18} />
              </div>
              <div className="text-xs">
                <h4 className="font-serif font-bold text-amber-950 text-sm">Customer Helpline</h4>
                <p className="text-gray-500 mt-1">Chat of Sourcing queries or wholesale bulk orders:</p>
                <a href="tel:+918210351543" className="font-bold text-amber-800 mt-1 block hover:underline font-sans text-sm">+91 82103 51543</a>
              </div>
            </div>

            {/* Direct Email */}
            <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 shadow-sm">
                <Mail size={18} />
              </div>
              <div className="text-xs">
                <h4 className="font-serif font-bold text-amber-950 text-sm">Corporate Mailboxes</h4>
                <p className="text-gray-500 mt-1">We respond to every single query within 24 business hours:</p>
                <a href="mailto:support@adityanutrafarm.com" className="font-bold text-amber-800 mt-1 block hover:underline font-sans text-sm">support@adityanutrafarm.com</a>
              </div>
            </div>

            {/* Bihar Address */}
            <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 shadow-sm">
                <MapPin size={18} />
              </div>
              <div className="text-xs">
                <h4 className="font-serif font-bold text-amber-950 text-sm">Farm Warehouse Address</h4>
                <p className="text-amber-900 font-medium mt-1">Aditya Nutra Farm Ltd.</p>
                <p className="text-gray-500 mt-0.5">Darbhanga Road, Madhubani District, Bihar - 847211, India.</p>
              </div>
            </div>

            {/* Google map locator */}
            <div className="rounded-2xl overflow-hidden border border-amber-100 aspect-[16/9] shadow-sm relative bg-amber-50">
              <iframe
                title="Google Maps Location - Bihar"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114569.15579973214!2d86.0827250550308!3d26.191599813137953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39edcd09e5dc42e7%3A0xc3f58a363ee0be44!2sMadhubani%2C%20Bihar%20847211!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full border-0 absolute inset-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-amber-50/20 rounded-3xl border border-amber-100 p-6 sm:p-8">
            <h3 className="text-amber-950 font-serif font-bold text-lg mb-4">Direct Message Farm Management</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full border bg-white border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">Registered Email ID</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email id"
                    className="w-full border bg-white border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">Active Contact Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="E.g., +91 91234 56789"
                  className="w-full border bg-white border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">Inquiry Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="State your business inquiry, custom requirements here..."
                  className="w-full border bg-white border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500"
                />
              </div>

              {success && (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 font-semibold">
                  <Check size={16} />
                  <span>Success! Your inquiry message has been submitted. Check your inbox for updates.</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer uppercase tracking-wider"
                >
                  {sending ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Submit Query</span>
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Quick bulk contact button */}
            <div className="mt-6 pt-5 border-t border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <MessageSquare size={13} className="text-amber-600" />
                <span>Immediate digital updates via phone text details</span>
              </span>
              <a 
                href="https://wa.me/918210351543?text=Hi%20Aditya%20Nutra%20Farm,%20I'am%20interested%20in%20Makhana%20Bulk/Wholesale%20pricing"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 font-extrabold flex items-center gap-1 hover:underline shrink-0"
              >
                <Sparkles size={11} className="animate-pulse" /> Direct WhatsApp Dispatch Helpline
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
