import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  industry: string;
  content: string;
  rating: number;
  image?: string;
  metrics?: {
    callsHandled?: string;
    revenueIncrease?: string;
    timeSaved?: string;
    customerSatisfaction?: string;
  };
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    company: "Wellness Medical Center",
    role: "Practice Manager",
    industry: "Healthcare",
    content: "VocalScale has revolutionized our patient intake process. Our AI receptionist now handles appointment scheduling, insurance verification, and after-hours emergency triage with 99.2% accuracy. We've seen a 40% increase in appointment bookings and reduced no-shows by 35%. The natural voice technology is so convincing that patients often don't realize they're speaking with AI.",
    rating: 5,
    metrics: {
      callsHandled: "2,847/month",
      revenueIncrease: "$18,500/month",
      customerSatisfaction: "96%"
    }
  },
  {
    id: "2",
    name: "Michael Chen",
    company: "Chen & Associates Law Firm",
    role: "Managing Partner",
    industry: "Legal Services",
    content: "As a busy law firm, missing calls means missing potential clients. VocalScale's AI receptionist has transformed our client acquisition process. The system intelligently qualifies leads, schedules consultations, and even provides basic legal information based on our practice areas. We've converted 65% more consultation inquiries into retained clients, generating an additional $45,000 in monthly revenue.",
    rating: 5,
    metrics: {
      callsHandled: "1,234/month",
      revenueIncrease: "$45,000/month",
      timeSaved: "45 hours/week"
    }
  },
  {
    id: "3",
    name: "Jennifer Martinez",
    company: "Premier Real Estate Group",
    role: "Broker/Owner",
    industry: "Real Estate",
    content: "In real estate, timing is everything. VocalScale ensures we never miss a potential buyer or seller inquiry. The AI qualifies leads, schedules property showings, and provides market information 24/7. Our lead response time has improved by 80%, and we're closing deals 18 days faster on average. The ROI has been incredible - we're saving $3,200 monthly compared to our previous answering service.",
    rating: 5,
    metrics: {
      callsHandled: "892/month",
      timeSaved: "32 hours/week",
      customerSatisfaction: "94%"
    }
  },
  {
    id: "4",
    name: "Robert Thompson",
    company: "TechSolutions Inc.",
    role: "CEO",
    industry: "Technology",
    content: "We implemented VocalScale to handle our growing customer support volume. The AI's ability to understand technical questions and route complex issues to the right department has been remarkable. Our customer satisfaction scores increased by 28%, and we reduced support costs by 60%. The natural language processing is so advanced that even our tech-savvy customers are impressed with the conversational quality.",
    rating: 5,
    metrics: {
      callsHandled: "3,456/month",
      customerSatisfaction: "92%",
      timeSaved: "120 hours/month"
    }
  },
  {
    id: "5",
    name: "Amanda Foster",
    company: "Fiesta Grill Restaurant",
    role: "Owner",
    industry: "Hospitality",
    content: "Running a busy restaurant means constantly juggling phone calls for reservations, takeout orders, and catering inquiries. VocalScale handles it all seamlessly. The AI takes reservations, processes takeout orders, and even upsells our catering services. During peak hours, we're handling 3x more calls without hiring additional staff. Our revenue increased by $12,000 monthly, and customers love the instant response time.",
    rating: 5,
    metrics: {
      callsHandled: "1,789/month",
      revenueIncrease: "$12,000/month",
      customerSatisfaction: "89%"
    }
  },
  {
    id: "6",
    name: "David Kim",
    company: "Elite Fitness Center",
    role: "General Manager",
    industry: "Fitness & Wellness",
    content: "Our gym was missing calls during peak workout hours and after closing time. VocalScale's AI receptionist now handles membership inquiries, class bookings, and personal training appointments around the clock. We've seen a 55% increase in new member sign-ups and reduced administrative workload by 70%. The system even remembers member preferences and provides personalized service recommendations.",
    rating: 5,
    metrics: {
      callsHandled: "967/month",
      revenueIncrease: "$8,500/month",
      timeSaved: "25 hours/week"
    }
  },
  {
    id: "7",
    name: "Lisa Rodriguez",
    company: "Sunshine Daycare Center",
    role: "Director",
    industry: "Education",
    content: "Managing parent inquiries, enrollment requests, and emergency communications for a daycare center requires constant availability. VocalScale has been a game-changer for our communication system. Parents can get information about enrollment, schedule tours, and receive updates about their children anytime. The emergency notification features give parents peace of mind, and our enrollment rate increased by 45% in just three months.",
    rating: 5,
    metrics: {
      callsHandled: "634/month",
      customerSatisfaction: "98%",
      timeSaved: "18 hours/week"
    }
  },
  {
    id: "8",
    name: "James Wilson",
    company: "Wilson Automotive Group",
    role: "Sales Manager",
    industry: "Automotive",
    content: "The automotive industry is highly competitive, and missing a sales call means losing to the competition. VocalScale ensures we capture every lead, schedule test drives, and provide vehicle information 24/7. The AI qualifies prospects based on budget and preferences, allowing our sales team to focus on serious buyers. Our lead conversion rate improved by 38%, and we're selling 12 more cars per month on average.",
    rating: 5,
    metrics: {
      callsHandled: "1,456/month",
      revenueIncrease: "$89,000/month",
      customerSatisfaction: "91%"
    }
  },
  {
    id: "9",
    name: "Maria Santos",
    company: "Santos Insurance Agency",
    role: "Principal Agent",
    industry: "Insurance",
    content: "Insurance requires immediate response to quotes and claims inquiries. VocalScale's AI receptionist handles policy questions, processes claims reports, and schedules appointments with remarkable accuracy. The system integrates with our CRM and can provide real-time quotes for common insurance products. Our policy sales increased by 42%, and customer retention improved by 25% due to better response times and service availability.",
    rating: 5,
    metrics: {
      callsHandled: "1,123/month",
      revenueIncrease: "$23,000/month",
      timeSaved: "35 hours/week"
    }
  },
  {
    id: "10",
    name: "Kevin Brown",
    company: "Brown & Co. Accounting",
    role: "Managing CPA",
    industry: "Financial Services",
    content: "Tax season used to mean hiring temporary staff to handle the influx of client calls. VocalScale's AI receptionist now manages appointment scheduling, tax document requests, and basic tax questions throughout the year. The system is particularly valuable during busy periods when our human staff is overwhelmed. We've reduced seasonal hiring costs by $15,000 annually while improving client satisfaction with 24/7 availability and instant responses.",
    rating: 5,
    metrics: {
      callsHandled: "756/month",
      customerSatisfaction: "93%",
      timeSaved: "28 hours/week"
    }
  },
  {
    id: "11",
    name: "Rachel Green",
    company: "Green Home Services",
    role: "Operations Director",
    industry: "Home Services",
    content: "Our plumbing and HVAC company was losing business to competitors who answered calls faster. VocalScale changed everything. The AI now handles service requests, provides basic troubleshooting, and schedules appointments with our technicians. During emergency situations, it can immediately dispatch the nearest available technician. Our response time improved by 75%, and we're handling 60% more service calls without adding administrative staff.",
    rating: 5,
    metrics: {
      callsHandled: "1,987/month",
      revenueIncrease: "$31,000/month",
      customerSatisfaction: "88%"
    }
  },
  {
    id: "12",
    name: "Thomas Anderson",
    company: "Anderson Consulting Group",
    role: "Senior Partner",
    industry: "Professional Services",
    content: "As a boutique consulting firm, every client interaction matters. VocalScale's AI receptionist represents our brand professionally while handling initial consultations, proposal requests, and meeting scheduling. The system's ability to understand complex business terminology and route calls appropriately has been impressive. We've seen a 50% increase in qualified leads and reduced our administrative overhead by 65%, allowing us to focus on delivering exceptional client service.",
    rating: 5,
    metrics: {
      callsHandled: "445/month",
      revenueIncrease: "$67,000/month",
      timeSaved: "22 hours/week"
    }
  }
];

export function SocialProof() {
  return (
    <section className="py-20 bg-white/50 border-y border-slate-200/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-slate-900 mb-4">
            Trusted by 1,200+ Businesses
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            See how businesses across industries are transforming their customer service with VocalScale's AI receptionist technology
          </p>
        </motion.div>

        {/* Statistics Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 text-center"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60">
            <div className="text-3xl font-black text-blue-600 mb-2">1.2M+</div>
            <div className="text-sm font-medium text-slate-600">Calls Handled</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60">
            <div className="text-3xl font-black text-emerald-600 mb-2">93%</div>
            <div className="text-sm font-medium text-slate-600">Customer Satisfaction</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60">
            <div className="text-3xl font-black text-purple-600 mb-2">$2.8M</div>
            <div className="text-sm font-medium text-slate-600">Revenue Generated</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60">
            <div className="text-3xl font-black text-indigo-600 mb-2">24/7</div>
            <div className="text-sm font-medium text-slate-600">Availability</div>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className="w-8 h-8 text-blue-200" />
              </div>

              {/* Testimonial Content */}
              <blockquote className="text-slate-700 leading-relaxed mb-6">
                "{testimonial.content}"
              </blockquote>

              {/* Author Info */}
              <div className="border-t border-slate-100 pt-6">
                <div className="font-bold text-slate-900">{testimonial.name}</div>
                <div className="text-sm text-slate-600 mb-1">{testimonial.role}</div>
                <div className="text-sm font-medium text-blue-600">{testimonial.company}</div>
                <div className="text-xs text-slate-500 mt-1">{testimonial.industry}</div>
              </div>

              {/* Metrics */}
              {testimonial.metrics && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {testimonial.metrics.callsHandled && (
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-black text-slate-900">{testimonial.metrics.callsHandled}</div>
                      <div className="text-xs text-slate-600">Calls/Month</div>
                    </div>
                  )}
                  {testimonial.metrics.revenueIncrease && (
                    <div className="bg-emerald-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-black text-emerald-700">{testimonial.metrics.revenueIncrease}</div>
                      <div className="text-xs text-emerald-600">Revenue Increase</div>
                    </div>
                  )}
                  {testimonial.metrics.timeSaved && (
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-black text-blue-700">{testimonial.metrics.timeSaved}</div>
                      <div className="text-xs text-blue-600">Time Saved</div>
                    </div>
                  )}
                  {testimonial.metrics.customerSatisfaction && (
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-black text-purple-700">{testimonial.metrics.customerSatisfaction}</div>
                      <div className="text-xs text-purple-600">Satisfaction</div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Featured Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 border border-blue-200/60 text-center"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <Quote className="w-12 h-12 text-blue-300 mx-auto mb-6" />
            <blockquote className="text-2xl md:text-3xl font-medium text-slate-800 leading-relaxed mb-8 italic">
              "VocalScale's AI receptionist technology has fundamentally transformed how we interact with our customers. The natural conversation quality, intelligent routing, and 24/7 availability have made it an indispensable part of our business operations. We're not just saving money - we're delivering better customer experiences."
            </blockquote>
            <div className="font-bold text-xl text-slate-900 mb-2">Dr. Emily Watson</div>
            <div className="text-lg text-slate-600 mb-1">Chief Operations Officer</div>
            <div className="text-lg font-medium text-blue-600">MultiCare Health Systems</div>
            <div className="text-base text-slate-500 mt-2">Healthcare Network - 15 Locations</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
