"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../sidebar/page";
import BottomBar from "../bottom-bar/page";

interface TableOfContents {
  id: string;
  title: string;
  level: number;
}

const PRIVACY_SECTIONS = [
  {
    id: "introduction",
    title: "1. Introduction",
    content:
      "AmTechy ('we', 'us', 'our', or 'Company') operates the AmTechy.com website and mobile applications (the 'Service'). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data. We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.",
  },
  {
    id: "definitions",
    title: "2. Definitions",
    content: `
Personal Data: Any information relating to an identified or identifiable natural person.

Usage Data: Data collected automatically when using the Service (e.g., device type, operating system, browser type, IP address, access times, pages viewed).

Cookies: Small files stored on your device that contain information about your browsing activity.

Service Provider: Any natural or legal person who processes data on behalf of the Company.

User: The individual or entity using the Service.
    `,
  },
  {
    id: "information-collection",
    title: "3. Information We Collect",
    content: `
We collect information that you voluntarily provide, including:
• Email address and password
• Full name and profile information
• Career goals, skills, and interests
• Payment information (processed securely by third-party providers)
• Profile photos and media uploads
• Course completion data and progress
• Communication preferences
• Feedback and survey responses

We also automatically collect:
• Device information (type, OS, browser)
• IP address and location data
• Cookies and tracking pixels
• Pages visited and time spent
• Referral sources
• Usage patterns and interaction data
    `,
  },
  {
    id: "use-of-data",
    title: "4. How We Use Your Data",
    content: `
We use collected data to:
• Provide and maintain the Service
• Process transactions and send billing information
• Send promotional emails and marketing communications
• Monitor usage and improve the Service
• Personalize user experience and learning recommendations
• Detect and prevent fraudulent activity
• Comply with legal obligations
• Analyze service performance and user behavior
• Create anonymized statistical data
• Respond to your inquiries and provide customer support
• Send service updates and security alerts
    `,
  },
  {
    id: "data-retention",
    title: "5. Data Retention",
    content: `
We retain your Personal Data for as long as necessary to provide the Service or fulfill the purposes outlined in this policy, unless:
• A longer retention period is required or permitted by law
• You request deletion of your data
• You deactivate or delete your account

Deleted account data is removed within 30 days, except:
• Data required for legal compliance
• Anonymized statistical data
• Data needed for legitimate business interests

If you request data deletion, we may retain minimal information to prevent fraud and comply with legal obligations.
    `,
  },
  {
    id: "data-security",
    title: "6. Data Security",
    content: `
The security of your data is important to us. We implement:
• SSL/TLS encryption for data transmission
• Industry-standard encryption for stored data
• Secure authentication mechanisms
• Regular security audits and penetration testing
• Access controls and role-based permissions
• Intrusion detection systems
• Secure payment processing

However, no method of transmission over the internet is 100% secure. While we strive to protect your Personal Data, we cannot guarantee absolute security. You use the Service at your own risk.
    `,
  },
  {
    id: "third-parties",
    title: "7. Third-Party Sharing",
    content: `
We do NOT sell your personal data. We may share your information with:
• Service Providers: Payment processors, email providers, analytics services, cloud hosting providers
• Legal Requirements: When required by law, court order, or government request
• Business Transfers: In case of merger, acquisition, or asset sale
• Your Consent: When you explicitly authorize us to share data

Third-party service providers are bound by confidentiality agreements and use data only as needed to provide services.

We use:
• Google Analytics for usage tracking
• Stripe/Paystack for payment processing
• Firebase for authentication and data storage
• SendGrid for email delivery
    `,
  },
  {
    id: "cookies",
    title: "8. Cookies",
    content: `
We use cookies and similar tracking technologies to:
• Remember your preferences and login information
• Understand how you use our Service
• Display personalized content
• Track marketing campaign effectiveness
• Enhance security and prevent fraud

Types of cookies we use:
• Essential Cookies: Required for basic functionality
• Analytics Cookies: Track user behavior and performance
• Marketing Cookies: Track advertising effectiveness
• Preference Cookies: Remember your choices

You can control cookies through browser settings. Disabling cookies may affect Service functionality. We respect "Do Not Track" browser signals.
    `,
  },
  {
    id: "your-rights",
    title: "9. Your Privacy Rights",
    content: `
Depending on your location, you may have rights including:

Right to Access: Request and obtain a copy of your Personal Data
Right to Rectification: Correct inaccurate or incomplete data
Right to Erasure: Request deletion of your data ("right to be forgotten")
Right to Restrict Processing: Limit how we use your data
Right to Data Portability: Obtain your data in a machine-readable format
Right to Object: Opt-out of certain processing activities
Right to Withdraw Consent: Revoke any consent you previously gave

To exercise these rights, contact us at privacy@amtechy.com with "Data Request" in the subject line. We will respond within 30 days.

EU/UK GDPR Rights: If you're in the EU/UK, you have additional protections under GDPR.
    `,
  },
  {
    id: "children",
    title: "10. Children's Privacy",
    content: `
Our Service is not intended for children under 13 years old. We do not knowingly collect Personal Data from children under 13. If we discover that a child under 13 has provided us with Personal Data, we will delete such information immediately.

If you are between 13-18 years old, parental consent is recommended for certain activities. If you believe we have collected data from a child without consent, please contact us immediately at privacy@amtechy.com.
    `,
  },
  {
    id: "international-transfers",
    title: "11. International Data Transfers",
    content: `
Your data may be transferred to, stored in, and processed in countries other than Nigeria, including countries outside the EU/EEA. These countries may not have data protection laws equivalent to yours.

By using the Service, you consent to such transfers. We implement safeguards including:
• Standard contractual clauses approved by relevant authorities
• Privacy Shield certification (where applicable)
• Your explicit consent to specific transfers
• Data localization where required by law

If data is transferred outside your country, we ensure your data receives adequate protection equivalent to your home country.
    `,
  },
  {
    id: "policy-changes",
    title: "12. Changes to This Privacy Policy",
    content: `
We may update this Privacy Policy periodically. We will notify you of significant changes by:
• Posting the updated policy on our website
• Updating the "Last Updated" date
• Sending you an email notification for material changes
• Requesting your consent if required by law

Continued use of the Service after changes constitutes acceptance of the updated policy. We encourage you to review this policy regularly to stay informed about how we protect your data.
    `,
  },
  {
    id: "contact",
    title: "13. Contact Us",
    content: `
If you have questions about this Privacy Policy or our data practices, please contact:

AmTechy Privacy Team
Email: privacy@amtechy.com
Phone: +234 (0) 905-870-4410
WhatsApp: +234 (0) 905-870-4410
Address: Lagos, Nigeria

Data Protection Officer (if applicable):
Email: dpo@amtechy.com

We will respond to your inquiry within 14 business days.

Last Updated: January 2025
Effective Date: January 1, 2025
    `,
  },
];

export default function PrivacyPolicy() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("introduction");

  const currentSection = PRIVACY_SECTIONS.find((s) => s.id === activeSection);

  return (
    <main className="flex-1 flex bg-slate-50 min-w-0">

      <section className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Back
            </button>
            <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-slate-300">
              Your privacy is important to us. Learn how we collect, use, and protect your data.
            </p>
            <p className="text-sm text-slate-400 mt-4">
              Last Updated: January 2025 | Effective Date: January 1, 2025
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Quick Navigation</h3>
              <nav className="space-y-2">
                {PRIVACY_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-sm ${
                      activeSection === section.id
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {section.title.split(".")[1].trim()}
                  </button>
                ))}
              </nav>

              {/* Contact Info */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                  Need Help?
                </p>
                <a
                  href="mailto:privacy@amtechy.com"
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <i className="fa-solid fa-envelope"></i>
                  privacy@amtechy.com
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentSection && (
              <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">{currentSection.title}</h2>
                <div className="prose prose-slate max-w-none">
                  {currentSection.content.split("\n").map((line, idx) => {
                    if (line.trim().startsWith("•")) {
                      return (
                        <div key={idx} className="flex gap-3 mb-3 text-slate-700">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{line.replace("•", "").trim()}</span>
                        </div>
                      );
                    }
                    return (
                      <p key={idx} className="text-slate-700 leading-relaxed mb-4">
                        {line.trim()}
                      </p>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="mt-12 pt-8 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const currentIndex = PRIVACY_SECTIONS.findIndex(
                        (s) => s.id === activeSection
                      );
                      if (currentIndex > 0) {
                        setActiveSection(PRIVACY_SECTIONS[currentIndex - 1].id);
                      }
                    }}
                    disabled={activeSection === PRIVACY_SECTIONS[0].id}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                    Previous
                  </button>

                  <button
                    onClick={() => {
                      const currentIndex = PRIVACY_SECTIONS.findIndex(
                        (s) => s.id === activeSection
                      );
                      if (currentIndex < PRIVACY_SECTIONS.length - 1) {
                        setActiveSection(PRIVACY_SECTIONS[currentIndex + 1].id);
                      }
                    }}
                    disabled={activeSection === PRIVACY_SECTIONS[PRIVACY_SECTIONS.length - 1].id}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Info Banner */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fa-solid fa-info text-blue-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Questions About Your Privacy?</p>
                  <p className="text-sm text-blue-800">
                    If you have any questions or concerns about our privacy practices, please don't hesitate to contact us.
                    We're committed to protecting your data and respecting your privacy rights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}