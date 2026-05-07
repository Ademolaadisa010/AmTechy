"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../sidebar/page";
import BottomBar from "../bottom-bar/page";

const TERMS_SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing and using AmTechy.com and its associated mobile applications (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

The Service is provided by AmTechy ("Company," "we," "us," or "our"). These Terms of Service ("Terms") apply to all users of the Service, including but not limited to users who are browsers, vendors, customers, merchants, and contributors of content.

Your use of the Service indicates that you have read, understood, and accept these Terms. We reserve the right to modify these Terms at any time, and your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes.`,
  },
  {
    id: "use-license",
    title: "2. Use License",
    content: `Permission is granted to temporarily download one copy of the materials (information or software) on AmTechy's Service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
• Modify or copy the materials
• Use the materials for any commercial purpose or for any public display
• Attempt to decompile or reverse engineer any software contained on the Service
• Remove any copyright or other proprietary notations from the materials
• Transferring the materials to another person or "mirror" the materials on any other server
• Accessing this Service and attempting to gain unauthorized access to any portion or feature of it
• Using the Service in any way that could damage, disable, burden, or impair the Service
• Uploading viruses, malware, or any other malicious code
• Harassing, threatening, defaming, or embarrassing any other user
• Attempting to gain unauthorized access to any user accounts or systems

This license shall automatically terminate if you violate any of these restrictions and may be terminated by AmTechy at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.`,
  },
  {
    id: "user-accounts",
    title: "3. User Accounts",
    content: `When you create an account on AmTechy, you agree to:
• Provide accurate, current, and complete information
• Maintain the confidentiality of your password and account information
• Accept responsibility for all activities that occur under your account
• Notify us immediately of any unauthorized access to your account
• Use the Service only for lawful purposes and in accordance with these Terms

You are responsible for maintaining the security of your account. We are not liable for any losses caused by unauthorized access to your account. If you believe your account has been compromised, contact us immediately at security@amtechy.com.

You may not use an account for commercial purposes without explicit written consent from AmTechy. You may not sell, transfer, or assign your account to any third party.`,
  },
  {
    id: "intellectual-property",
    title: "4. Intellectual Property Rights",
    content: `The Service and all of its original content, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio) are the exclusive property of AmTechy, its licensors, or other providers of such material and are protected by international copyright, trademark, and other intellectual property laws.

Your use of the Service does not grant you ownership of any intellectual property rights in the Service or the content you access. You may not reproduce, modify, distribute, or transmit any content without our prior written permission.

Course materials, videos, lessons, and other educational content are provided for personal educational use only. You may not:
• Reproduce, distribute, or transmit course content
• Sell or commercially exploit course materials
• Create derivative works from course content
• Use course content to train AI systems or language models
• Share login credentials or course access with others

All trademarks, logos, and brand names used on the Service are the property of their respective owners and protected by trademark laws.`,
  },
  {
    id: "user-content",
    title: "5. User-Generated Content",
    content: `You retain all rights to any content you submit, post, or display on the Service ("User Content"). By submitting User Content, you grant AmTechy a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content for the purpose of providing and improving the Service.

You represent and warrant that:
• You own or have the necessary rights to the User Content
• The content does not infringe any third-party intellectual property rights
• The content is accurate and not misleading
• The content does not contain confidential information
• The content complies with all applicable laws and these Terms

We reserve the right to remove any User Content that violates these Terms, is offensive, illegal, or infringes on third-party rights. We are not responsible for reviewing, moderating, or monitoring User Content.

You agree not to post or submit:
• Content that is defamatory, obscene, abusive, or hateful
• Content that infringes intellectual property rights
• Personal information of others without consent
• Commercial solicitation or spam
• Content promoting illegal activities
• Any content that violates applicable laws`,
  },
  {
    id: "courses-certificates",
    title: "6. Courses and Certificates",
    content: `Course Completion: You are responsible for completing all course requirements to earn a certificate. AmTechy does not guarantee any employment outcomes or salary increases based on course completion.

Certificates: Certificates are issued upon completion of 100% of course content. Certificates are for personal and professional use only and may not be falsified, modified, or misrepresented. Certificate validity can be verified on our verification portal.

Disclaimer: Certificates represent successful completion of course material only and do not constitute professional qualifications, licenses, or certifications required by law in any jurisdiction.

Refunds: For free courses, no refunds apply. For paid premium subscriptions, we offer a 7-day money-back guarantee from the date of purchase. Refunds must be requested through your account settings or by contacting support@amtechy.com.

Course Modifications: We reserve the right to modify, update, or discontinue courses at any time. If a course is discontinued, you will be notified and offered alternative options.

Content Changes: Course content, materials, and instructors may change without notice. We endeavor to keep content current and accurate but make no guarantees.`,
  },
  {
    id: "payment-billing",
    title: "7. Payment and Billing",
    content: `Payment Terms: By subscribing to a paid plan, you authorize us to charge the subscription fee to the payment method you provide. Payments are charged automatically on the renewal date specified in your subscription.

Billing Cycle: Subscriptions renew automatically at the end of each billing period (monthly or annual, as selected). You will receive an email reminder before each renewal.

Price Changes: We reserve the right to change subscription prices with 30 days' written notice. Changes take effect at your next renewal date. Continued use constitutes acceptance of new pricing.

Taxes: You are responsible for any taxes applicable to your purchase. If required by law, applicable taxes will be added to your billing.

Failed Payments: If a payment fails, we will attempt to retry the transaction. If payment ultimately fails, your subscription may be suspended or terminated.

Billing Disputes: To dispute a charge, contact billing@amtechy.com within 30 days of the transaction. We will investigate and work with you to resolve the issue.

Refund Policy: We offer a 7-day money-back guarantee for subscription fees. Refunds must be requested within 7 days of purchase. After 7 days, refunds are not available unless required by law.`,
  },
  {
    id: "limitation-liability",
    title: "8. Limitation of Liability",
    content: `TO THE FULLEST EXTENT PERMITTED BY LAW, AMTECHY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES.

OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO AMTECHY IN THE 12 MONTHS PRECEDING THE CLAIM.

SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OF LIABILITY, SO THE ABOVE LIMITATION MAY NOT APPLY TO YOU.

The Service is provided on an "AS-IS" and "AS-AVAILABLE" basis. AmTechy disclaims all warranties, express or implied, including but not limited to:
• Warranties of merchantability and fitness for a particular purpose
• Warranties of title and non-infringement
• Warranties relating to the accuracy, timeliness, or completeness of information

We do not warrant that:
• The Service will meet your requirements
• The Service will be uninterrupted, timely, or error-free
• Any errors or defects will be corrected
• The Service is free of viruses or malicious code`,
  },
  {
    id: "indemnification",
    title: "9. Indemnification",
    content: `You agree to defend, indemnify, and hold harmless AmTechy and its officers, directors, employees, agents, and successors from any and all claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising from or related to:
• Your use of the Service
• Your violation of these Terms
• Your violation of any applicable laws or regulations
• Your infringement of any third-party intellectual property rights
• Any User Content you submit
• Any activities on your account

This indemnification obligation applies regardless of whether we have been advised of the possibility of such damages or losses.`,
  },
  {
    id: "termination",
    title: "10. Termination",
    content: `We may terminate your access to the Service at any time for any reason, including:
• Violation of these Terms
• Illegal activity
• Abuse of the Service
• Fraud or misrepresentation
• For convenience

Upon termination:
• Your right to access the Service immediately ceases
• Your account data may be deleted
• Any outstanding payment obligations remain due
• Clauses regarding intellectual property, liability, and indemnification survive termination

You may terminate your account by logging into your account settings or by contacting support@amtechy.com. Upon termination, your data will be deleted within 30 days unless we are required to retain it by law.`,
  },
  {
    id: "disputes",
    title: "11. Dispute Resolution",
    content: `Governing Law: These Terms shall be governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions.

Arbitration: Any dispute arising out of or relating to these Terms or the Service shall be resolved through binding arbitration rather than in court, except that we may seek injunctive relief in court. Each party agrees to share arbitration costs equally.

Informal Resolution: Before initiating arbitration, we encourage you to contact us at support@amtechy.com to attempt informal resolution. We will respond to your inquiry within 14 business days.

Limitations: Arbitration is limited to resolving disputes arising solely from or relating to these Terms or the Service. Class action and jury trial rights are waived.

Jurisdiction: You agree that any legal action or proceeding shall be brought exclusively in the appropriate courts located in Lagos, Nigeria.`,
  },
  {
    id: "prohibited-conduct",
    title: "12. Prohibited Conduct",
    content: `You agree not to:
• Use the Service for any illegal purpose or in violation of any applicable laws
• Harass, threaten, defame, or embarrass any user or third party
• Impersonate any person or entity
• Spread misinformation or false information
• Engage in any form of hacking, phishing, or unauthorized access
• Upload viruses, malware, or harmful code
• Scrape, crawl, or automated access to the Service without permission
• Interfere with the normal operation of the Service
• Circumvent security measures or content restrictions
• Sell, trade, or transfer your account or course access
• Use the Service for commercial purposes without authorization
• Create multiple accounts to circumvent restrictions
• Share referral codes or incentives fraudulently

Violations may result in account suspension or termination without refund. We reserve the right to report illegal activity to law enforcement.`,
  },
  {
    id: "changes-terms",
    title: "13. Changes to Terms",
    content: `We reserve the right to modify these Terms at any time. Changes are effective immediately upon posting to the Service. For significant changes, we will provide notice via email or prominent notice on the Service.

Your continued use of the Service following the posting of revised Terms means you accept and agree to the changes. If you do not agree with any changes, your sole remedy is to cease use of the Service.

We will maintain a history of changes to these Terms. The date of the most recent revision is displayed at the bottom of this page.`,
  },
  {
    id: "contact",
    title: "14. Contact Us",
    content: `If you have questions about these Terms of Service, please contact:

AmTechy Legal Team
Email: legal@amtechy.com
Phone: +234 (0) 905-870-4410
WhatsApp: +234 (0) 905-870-4410
Address: Lagos, Nigeria

Support Team
Email: support@amtechy.com
Response time: Within 48 business hours

We will respond to your inquiry within 14 business days.

Last Updated: January 2025
Effective Date: January 1, 2025`,
  },
];

export default function TermsOfService() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("acceptance");

  const currentSection = TERMS_SECTIONS.find((s) => s.id === activeSection);

  return (
    <main className="flex-1 flex bg-slate-50 min-w-0">

      <section className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 text-white py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-indigo-200 hover:text-white mb-6 transition-colors"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Back
            </button>
            <h1 className="text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-lg text-indigo-200">
              Please read these terms carefully before using AmTechy. Your use of our Service constitutes acceptance of these Terms.
            </p>
            <p className="text-sm text-indigo-300 mt-4">
              Last Updated: January 2025 | Effective Date: January 1, 2025
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                {TERMS_SECTIONS.map((section) => (
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
                  Questions?
                </p>
                <a
                  href="mailto:legal@amtechy.com"
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <i className="fa-solid fa-envelope"></i>
                  legal@amtechy.com
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
                      const currentIndex = TERMS_SECTIONS.findIndex(
                        (s) => s.id === activeSection
                      );
                      if (currentIndex > 0) {
                        setActiveSection(TERMS_SECTIONS[currentIndex - 1].id);
                      }
                    }}
                    disabled={activeSection === TERMS_SECTIONS[0].id}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                    Previous
                  </button>

                  <button
                    onClick={() => {
                      const currentIndex = TERMS_SECTIONS.findIndex(
                        (s) => s.id === activeSection
                      );
                      if (currentIndex < TERMS_SECTIONS.length - 1) {
                        setActiveSection(TERMS_SECTIONS[currentIndex + 1].id);
                      }
                    }}
                    disabled={activeSection === TERMS_SECTIONS[TERMS_SECTIONS.length - 1].id}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Warning Banner */}
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fa-solid fa-triangle-exclamation text-amber-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900 mb-1">Important Legal Notice</p>
                  <p className="text-sm text-amber-800">
                    Please read these Terms of Service carefully. By using AmTechy, you acknowledge that you have read, 
                    understood, and agree to be bound by all provisions of these Terms.
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