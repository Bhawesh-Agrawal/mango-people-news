import SEO from '../seo/Seo'

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEO
        path="/privacy-policy"
        title="Privacy Policy - Mango People News"
        description="Read our privacy policy to understand how we collect, use, and protect your information."
      />

      <div style={{ background: 'var(--bg)' }} className="py-12 md:py-16">
        <div className="page-container max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <h1
              className="font-display font-black mb-3"
              style={{
                fontSize: 'clamp(28px, 5vw, 42px)',
                color: 'var(--text-primary)',
              }}
            >
              Privacy Policy
            </h1>
            <p
              className="text-base"
              style={{ color: 'var(--text-secondary)' }}
            >
              <strong>Effective Date:</strong> May 1, 2026
            </p>
            <p
              className="text-base mt-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Last Updated: May 1, 2026
            </p>
          </div>

          {/* Content */}
          <div
            className="prose prose-invert max-w-none space-y-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            {/* Section 1 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                1. Introduction
              </h2>
              <p className="leading-relaxed">
                Welcome to Mango People News (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring transparency about how we collect, use, disclose, and safeguard your information when you visit our website at <strong>mangopeoplenews.com</strong> and use our services.
              </p>
              <p className="leading-relaxed mt-3">
                Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Site. By accessing and using Mango People News, you acknowledge that you have read, understood, and agree to be bound by all the provisions of this Privacy Policy.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                2. Information We Collect
              </h2>

              <h3
                className="font-semibold text-lg mb-2 mt-4"
                style={{ color: 'var(--text-primary)' }}
              >
                2.1 Information You Provide Directly
              </h3>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>
                  <strong>Newsletter Subscription:</strong> When you subscribe to our newsletter, we collect your email address and optionally your name.
                </li>
                <li>
                  <strong>Account Information:</strong> If you create an account, we collect your name, email address, and account credentials.
                </li>
                <li>
                  <strong>Contact Information:</strong> Any information you provide when contacting us via email or contact forms.
                </li>
              </ul>

              <h3
                className="font-semibold text-lg mb-2 mt-4"
                style={{ color: 'var(--text-primary)' }}
              >
                2.2 Information Collected Automatically
              </h3>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>
                  <strong>Log Data:</strong> Our servers automatically record information when you access our Site, including IP address, browser type and version, operating system, referrer URL, and pages visited.
                </li>
                <li>
                  <strong>Device Information:</strong> Device type, device identifiers, mobile network information, and device settings.
                </li>
                <li>
                  <strong>Usage Data:</strong> Time spent on pages, links clicked, search queries, and other interactions with our Site.
                </li>
              </ul>

              <h3
                className="font-semibold text-lg mb-2 mt-4"
                style={{ color: 'var(--text-primary)' }}
              >
                2.3 Cookies and Tracking Technologies
              </h3>
              <p className="leading-relaxed">
                We use cookies, web beacons, pixels, and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our Site</li>
                <li>Deliver personalized content and advertisements</li>
                <li>Analyze Site traffic and performance</li>
                <li>Detect and prevent fraud</li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>Cookie Categories:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li><strong>Essential Cookies:</strong> Required for Site functionality</li>
                <li><strong>Analytics Cookies:</strong> Track user behavior for performance analysis</li>
                <li><strong>Advertising Cookies:</strong> Deliver personalized ads through Google AdSense and other ad partners</li>
              </ul>
              <p className="leading-relaxed mt-3">
                You can control cookies through your browser settings. Most browsers allow you to refuse cookies or alert you when cookies are being sent. However, blocking cookies may affect Site functionality.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                3. How We Use Your Information
              </h2>
              <p className="leading-relaxed">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>To provide, maintain, and improve our Site and services</li>
                <li>To send newsletter updates and marketing communications (with your consent)</li>
                <li>To respond to your inquiries and requests</li>
                <li>To analyze Site usage and trends to improve user experience</li>
                <li>To deliver personalized content and advertisements</li>
                <li>To monitor and prevent fraud, abuse, and security incidents</li>
                <li>To comply with legal obligations and enforce our Terms of Service</li>
                <li>To conduct research and analytics about user behavior</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                4. Google AdSense and Third-Party Advertising
              </h2>
              <p className="leading-relaxed">
                Mango People News uses <strong>Google AdSense</strong> to display advertisements on our Site.
              </p>
              <p className="leading-relaxed mt-3">
                <strong>How Google AdSense Works:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Google AdSense uses cookies (including the DoubleClick cookie) to serve ads based on your prior visits to our Site and other websites</li>
                <li>Google may collect and use information about your interests to display relevant advertisements</li>
                <li>Google processes this data under their own <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Privacy Policy</a></li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>Opting Out of Personalized Ads:</strong>
              </p>
              <p className="leading-relaxed">
                You can opt out of personalized advertising by visiting:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>
                  <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                    Google Ads Settings
                  </a>
                </li>
                <li>
                  <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                    Digital Advertising Alliance (DAA) Opt-Out
                  </a>
                </li>
                <li>
                  <a href="https://youradchoices.ca/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                    Canadian Digital Advertising Alliance
                  </a>
                </li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>Third-Party Ad Networks:</strong>
              </p>
              <p className="leading-relaxed">
                Other ad networks and partners may also use cookies, JavaScript, web beacons, and similar technologies to serve ads on our Site. We do not have control over these technologies or the data collected by these third parties. Please refer to their privacy policies for more information.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                5. Google Analytics
              </h2>
              <p className="leading-relaxed">
                We use <strong>Google Analytics</strong> to analyze Site traffic and user behavior. Google Analytics collects anonymized data about your visits, including:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>The pages you visit</li>
                <li>Time spent on each page</li>
                <li>Click patterns and interactions</li>
                <li>Device and browser information</li>
                <li>Geographic location (country/city level)</li>
              </ul>
              <p className="leading-relaxed mt-3">
                This data helps us understand how users interact with our Site and improve our content. Google Analytics data is subject to <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Google's Privacy Policy</a>.
              </p>
              <p className="leading-relaxed mt-3">
                You can disable Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Google Analytics Opt-out Browser Add-on</a>.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                6. Newsletter and Email Communications
              </h2>
              <p className="leading-relaxed">
                When you subscribe to our newsletter:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>We collect your email address and optionally your name</li>
                <li>We will send you periodic newsletters with market news, business updates, and insights</li>
                <li>We will send transactional emails related to your account or subscription</li>
                <li>We may include promotional content or third-party offers</li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>Unsubscribe:</strong> Every email contains an unsubscribe link. You can unsubscribe at any time, and we will remove you from our mailing list within 10 business days. We do not spam or send unsolicited emails.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                7. Third-Party Services and Data Sharing
              </h2>
              <p className="leading-relaxed">
                We may share your information with third-party services:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li><strong>Google AdSense & Analytics:</strong> For advertising and traffic analysis</li>
                <li><strong>Email Service Providers:</strong> To deliver newsletters and transactional emails</li>
                <li><strong>Service Providers:</strong> Hosting, analytics, payment processing, and customer support</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>We Do NOT Sell Your Data:</strong> We do not sell, rent, trade, or otherwise disclose your personal information to third parties for marketing purposes without your explicit consent.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                8. Data Security
              </h2>
              <p className="leading-relaxed">
                We implement reasonable technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction, including:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>HTTPS encryption for data in transit</li>
                <li>Secure authentication mechanisms</li>
                <li>Regular security assessments</li>
                <li>Limited access to personal information</li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>Important Note:</strong> No method of transmission over the internet or electronic storage is completely secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security. You assume the risk of transmission of any information through our Site.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                9. Data Retention
              </h2>
              <p className="leading-relaxed">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Provide you with our services</li>
                <li>Fulfill the purposes outlined in this Privacy Policy</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
              </ul>
              <p className="leading-relaxed mt-3">
                You can request deletion of your personal information at any time by contacting us. We will comply with deletion requests unless we are required to retain the information by law or for legitimate business purposes.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                10. Your Rights and Choices
              </h2>
              <p className="leading-relaxed">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for specific uses of your information</li>
                <li><strong>Data Portability:</strong> Request a copy of your information in a portable format</li>
                <li><strong>Opt-Out:</strong> Opt out of marketing communications</li>
              </ul>
              <p className="leading-relaxed mt-3">
                To exercise any of these rights, contact us at the email address provided in Section 14.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                11. Children's Privacy
              </h2>
              <p className="leading-relaxed">
                Our Site is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will promptly delete such information and notify the parent or guardian.
              </p>
              <p className="leading-relaxed mt-3">
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                12. External Links
              </h2>
              <p className="leading-relaxed">
                Our Site may contain links to external websites and services that are not operated by us. This Privacy Policy does not apply to external sites, and we are not responsible for their privacy practices, content, or policies. We recommend reviewing the privacy policies of any external sites before providing personal information.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                13. International Data Transfers
              </h2>
              <p className="leading-relaxed">
                Your information may be transferred to and stored in countries outside your country of residence, including countries that may not have the same data protection laws. By using our Site, you consent to the transfer of your information to countries outside your country of residence for the purposes described in this Privacy Policy.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                14. Contact Us
              </h2>
              <p className="leading-relaxed">
                If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <p className="mb-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:mangopeoplenews2026@gmail.com" style={{ color: 'var(--accent)' }}>
                    mangopeoplenews2026@gmail.com
                  </a>
                </p>
                <p className="mb-2">
                  <strong>Website:</strong>{' '}
                  <a href="https://mangopeoplenews.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                    mangopeoplenews.com
                  </a>
                </p>
              </div>
              <p className="leading-relaxed mt-4">
                We will respond to privacy requests within 30 days or as required by applicable law.
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                15. Changes to This Privacy Policy
              </h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will notify you by updating the &quot;Effective Date&quot; at the top of this page and, in some cases, by providing additional notice (such as sending you an email or displaying a prominent notice on our Site).
              </p>
              <p className="leading-relaxed mt-3">
                Your continued use of our Site following the posting of revised Privacy Policy means that you accept and agree to the changes. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
              </p>
            </section>

            {/* Section 16 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                16. Compliance
              </h2>
              <p className="leading-relaxed">
                This Privacy Policy is designed to comply with:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Google AdSense Program Policies</li>
                <li>General Data Protection Regulation (GDPR) where applicable</li>
                <li>California Consumer Privacy Act (CCPA) where applicable</li>
                <li>Common industry privacy standards and best practices</li>
              </ul>
            </section>

            {/* Closing */}
            <section className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                <strong>Last Updated:</strong> May 1, 2026
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                Thank you for trusting Mango People News with your information. We are committed to protecting your privacy and providing you with a transparent, secure experience.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
