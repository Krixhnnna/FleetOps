import React, { useState } from 'react';
import { Mail, MapPin, CheckCircle2, Loader2 } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [fleetSize, setFleetSize] = useState('51-200');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  return (
    <section id="contact" className="bg-white py-24 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Office Coordinates & Contact details */}
          <div className="lg:col-span-5 text-left">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Connect with Us</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mt-3 mb-6">
              Connect with Our Logistics Specialists
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mb-10">
              Have questions about integrating FleetOps with your current TMS or legacy routing systems? Get in touch for technical specification audits, custom SLA options, and bulk pricing details.
            </p>
            
            <div className="space-y-6">
              {/* Email Support */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Enterprise Support</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Response within 2 hours</p>
                  <a href="mailto:support@fleetops.net" className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-1 block">
                    support@fleetops.net
                  </a>
                </div>
              </div>

              {/* Office Locations */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Corporate HQ</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    LPU, Punjab
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Inquiry Form Card */}
          <div className="lg:col-span-7 w-full">
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-xl shadow-sm text-left">
              {submitted ? (
                <div className="text-center py-10">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
                    <CheckCircle2 className="h-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Inquiry Received</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Thank you. A logistics platform engineer will contact you shortly using your corporate email address.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Submit another response
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="form-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide text-left mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="form-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="block w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-950 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label htmlFor="form-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide text-left mb-1.5">
                        Company Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="form-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="block w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-950 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Fleet Size Selection */}
                  <div>
                    <label htmlFor="form-fleet" className="block text-xs font-bold text-slate-700 uppercase tracking-wide text-left mb-1.5">
                      Estimated Fleet Size
                    </label>
                    <select
                      id="form-fleet"
                      value={fleetSize}
                      onChange={(e) => setFleetSize(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-950 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="1-50">1 - 50 vehicles</option>
                      <option value="51-200">51 - 200 vehicles</option>
                      <option value="201-500">201 - 500 vehicles</option>
                      <option value="500+">More than 500 vehicles</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="form-message" className="block text-xs font-bold text-slate-700 uppercase tracking-wide text-left mb-1.5">
                      Detailed Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="form-message"
                      rows="4"
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Outline your logistics requirements or current system integration bottlenecks..."
                      className="block w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-950 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y"
                    />
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors cursor-pointer w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending Inquiry...
                        </>
                      ) : (
                        'Submit Inquiry'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
