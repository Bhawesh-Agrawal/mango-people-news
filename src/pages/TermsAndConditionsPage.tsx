import SEO from '../seo/Seo'

export default function TermsAndConditionsPage() {
  return (
    <>
      <SEO
        path="/terms-and-conditions"
        title="Terms and Conditions - Mango People News"
        description="Read our terms and conditions to understand the rules and restrictions for using Mango People News."
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
              Terms and Conditions
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
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                Welcome to Mango People News (&quot;Website,&quot; &quot;Service,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;). By accessing, browsing, and using this Website in any manner, including but not limited to visiting the site, reading articles, subscribing to newsletters, or using any of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
              <p className="leading-relaxed mt-3">
                If you do not agree to these Terms and Conditions, you must immediately cease using this Website. Your continued use of the Website constitutes your acceptance of these Terms and Conditions in their entirety.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                2. Use License and Restrictions
              </h2>
              <p className="leading-relaxed">
                We grant you a limited, non-exclusive, non-transferable, and revocable license to access and use this Website for personal, non-commercial purposes only, subject to these Terms and Conditions.
              </p>
              <p className="leading-relaxed mt-3">
                <strong>You agree NOT to:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Use the Website for any unlawful purpose or in violation of any applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to, disrupt, or damage the Website or its servers</li>
                <li>Use automated tools, bots, scrapers, or similar mechanisms to access or extract content from the Website without permission</li>
                <li>Reproduce, republish, distribute, or transmit any content from the Website without prior written consent</li>
                <li>Copy, modify, or create derivative works based on our content or design</li>
                <li>Engage in spam, phishing, or any form of harassment or abuse</li>
                <li>Reverse engineer, decompile, or attempt to discover the source code or technology underlying the Website</li>
                <li>Use the Website to advertise or promote competing products or services without authorization</li>
                <li>Interfere with or disrupt the Website's functionality or the experience of other users</li>
                <li>Violate any intellectual property rights or proprietary information</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                3. Content Disclaimer
              </h2>
              <p className="leading-relaxed">
                All content published on Mango People News, including articles, news reports, analysis, graphics, and multimedia, is provided for informational and educational purposes only.
              </p>
              <p className="leading-relaxed mt-3">
                <strong>We do NOT guarantee:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Accuracy, completeness, or reliability of any information</li>
                <li>That content is free from errors, omissions, or inaccuracies</li>
                <li>Timeliness or currency of published information</li>
                <li>That content will meet your specific expectations or requirements</li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>Important Disclaimers:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Content may contain opinions, analysis, commentary, or perspectives from our team or third-party contributors</li>
                <li>Opinions expressed do not necessarily reflect the views of Mango People News or constitute investment, financial, or legal advice</li>
                <li>We are not responsible for opinions or statements made by contributors or guest writers</li>
                <li>You should not rely solely on our content for making any critical decisions, including financial, investment, legal, or healthcare decisions</li>
                <li>Before making important decisions, consult with qualified professionals such as financial advisors, lawyers, or medical practitioners</li>
                <li>Market data and financial information may be subject to delays or inaccuracies</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                4. Intellectual Property Rights
              </h2>
              <p className="leading-relaxed">
                All content on the Website, including but not limited to articles, news reports, photographs, graphics, logos, design elements, brand names, trademarks, source code, and software, is the exclusive property of Mango People News or our licensors and is protected by copyright and other intellectual property laws.
              </p>
              <p className="leading-relaxed mt-3">
                <strong>You do NOT have the right to:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Copy, download, or save content except for personal, non-commercial use</li>
                <li>Republish, redistribute, or retransmit our content without written permission</li>
                <li>Use our brand name, logo, or trademarks without prior written consent</li>
                <li>Create derivative works, adaptations, or modifications of our content</li>
                <li>Use our content in a manner that implies endorsement or association</li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>Limited Use:</strong> You may view and print articles for personal, non-commercial use only, provided you retain all copyright notices and proprietary notices. Any other use requires our explicit written permission.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                5. User Accounts and Registration
              </h2>
              <p className="leading-relaxed">
                If you create an account on our Website, you are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Providing accurate, truthful, and complete information during registration</li>
                <li>Maintaining the confidentiality of your login credentials</li>
                <li>Notifying us immediately of any unauthorized access or breach</li>
                <li>All activities that occur under your account</li>
              </ul>
              <p className="leading-relaxed mt-3">
                You agree not to create accounts under false pretenses, impersonate others, or use someone else's account. We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                6. User-Generated Content
              </h2>
              <p className="leading-relaxed">
                If you submit, post, or publish any content on our Website (including comments, feedback, or contributions), you:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Grant Mango People News a non-exclusive, royalty-free license to use, modify, publish, and distribute your content</li>
                <li>Warrant that you own or have the rights to the content you submit</li>
                <li>Agree that your content will not infringe upon the rights of third parties</li>
                <li>Take full responsibility for the accuracy and legality of your content</li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>Prohibited Content:</strong> You agree not to submit content that is:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Defamatory, abusive, harassing, or threatening</li>
                <li>Illegal, fraudulent, or promotes illegal activities</li>
                <li>Sexually explicit or obscene</li>
                <li>Discriminatory based on race, gender, religion, or other protected characteristics</li>
                <li>Spam or commercial advertising</li>
                <li>Misleading or deceptive</li>
                <li>Infringing upon intellectual property rights</li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>Moderation:</strong> We reserve the right to review, edit, or remove any user-generated content at our sole discretion without notice. We are not obligated to publish or retain any submitted content.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                7. Third-Party Links and External Websites
              </h2>
              <p className="leading-relaxed">
                Our Website may contain hyperlinks to external websites and resources that are not owned, operated, or controlled by Mango People News.
              </p>
              <p className="leading-relaxed mt-3">
                <strong>Important:</strong> We:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Do not endorse, control, or assume responsibility for external websites or their content</li>
                <li>Are not responsible for the accuracy, legality, or appropriateness of third-party content</li>
                <li>Are not liable for any damages, losses, or issues arising from your use of external websites</li>
                <li>Do not monitor external websites for compliance with these Terms or applicable laws</li>
              </ul>
              <p className="leading-relaxed mt-3">
                When you click on external links, you leave our Website and assume all risks associated with that external site. We recommend reviewing the terms and privacy policies of any external websites before using them.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                8. Advertisements and Sponsored Content
              </h2>
              <p className="leading-relaxed">
                Mango People News uses Google AdSense and other third-party advertising networks to display advertisements on our Website.
              </p>
              <p className="leading-relaxed mt-3">
                <strong>Important Disclaimer:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>We do not endorse or guarantee the accuracy of any advertisements</li>
                <li>Ads may contain links to external websites not under our control</li>
                <li>Any interactions, transactions, or disputes with advertisers are solely between you and the advertiser</li>
                <li>We are not responsible for any damages, losses, or issues arising from advertisements</li>
                <li>Advertisement placement does not imply editorial endorsement</li>
              </ul>
              <p className="leading-relaxed mt-3">
                For more information about how Google uses cookies and data for advertising, please visit <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Google's Privacy Policy</a>.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                9. Newsletter Subscription
              </h2>
              <p className="leading-relaxed">
                By subscribing to our newsletter:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>You consent to receive periodic emails with news updates, articles, and promotional content</li>
                <li>You are responsible for providing an accurate email address</li>
                <li>You agree to our Privacy Policy regarding email data collection and use</li>
              </ul>
              <p className="leading-relaxed mt-3">
                You can unsubscribe from our newsletter at any time by clicking the unsubscribe link in any email. We will process unsubscribe requests within 10 business days.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                10. Limitation of Liability
              </h2>
              <p className="leading-relaxed">
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, MANGO PEOPLE NEWS AND ITS OWNERS, OPERATORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Any direct, indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, data, revenue, or goodwill</li>
                <li>Business interruption or loss of use</li>
                <li>Any damages arising from errors, omissions, or inaccuracies in our content</li>
                <li>Any damages from temporary unavailability or downtime of the Website</li>
                <li>Any damages from unauthorized access or use of the Website</li>
                <li>Any damages from third-party services, links, or advertisements</li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>Use at Your Own Risk:</strong> You assume all risk and responsibility for your use of this Website. You access the Website on an &quot;AS-IS&quot; and &quot;AS-AVAILABLE&quot; basis without warranties or guarantees of any kind.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                11. Indemnification
              </h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless Mango People News and its owners, operators, employees, agents, and affiliates from any and all claims, demands, liabilities, damages, losses, costs, and expenses (including reasonable attorney fees) arising from or related to:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Your use of the Website</li>
                <li>Your violation of these Terms and Conditions</li>
                <li>Your violation of any applicable laws or regulations</li>
                <li>Your infringement of any third-party intellectual property or rights</li>
                <li>Any content you submit, post, or publish</li>
                <li>Your interactions with third parties through the Website</li>
              </ul>
            </section>

            {/* Section 12 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                12. Website Availability and Maintenance
              </h2>
              <p className="leading-relaxed">
                We strive to keep the Website available and functioning properly. However:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>We do not guarantee uninterrupted access or availability</li>
                <li>The Website may experience temporary downtime for maintenance, updates, or repairs</li>
                <li>We are not liable for any damages resulting from unavailability or service interruptions</li>
                <li>We may modify, suspend, or discontinue any features or the entire Website without notice</li>
              </ul>
            </section>

            {/* Section 13 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                13. Suspension and Termination
              </h2>
              <p className="leading-relaxed">
                We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Suspend or terminate your access to the Website at any time, with or without cause</li>
                <li>Remove, edit, or block any content that violates these Terms</li>
                <li>Block or ban users who engage in abusive, illegal, or harmful behavior</li>
                <li>Take any action we deem necessary to maintain the integrity and security of the Website</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Termination may be immediate and without prior notice if you violate these Terms or engage in illegal or harmful conduct. Upon termination, your right to use the Website ceases immediately.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                14. Modifications to Terms and Conditions
              </h2>
              <p className="leading-relaxed">
                We may update, revise, or modify these Terms and Conditions at any time without prior notice. Changes will be effective immediately upon posting to the Website, and the updated &quot;Last Updated&quot; date will reflect the date of revision.
              </p>
              <p className="leading-relaxed mt-3">
                <strong>Your Continued Use:</strong> Your continued use of the Website following the posting of revised Terms and Conditions constitutes your acceptance of the changes. We recommend reviewing these Terms periodically to stay informed of any updates.
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                15. Governing Law and Jurisdiction
              </h2>
              <p className="leading-relaxed">
                These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India, without regard to its conflict of law principles.
              </p>
              <p className="leading-relaxed mt-3">
                Any legal action, suit, or proceeding arising out of or related to these Terms and Conditions shall be brought exclusively in the courts located in India. You hereby consent to the jurisdiction and venue of such courts and waive any objection to venue.
              </p>
            </section>

            {/* Section 16 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                16. Severability
              </h2>
              <p className="leading-relaxed">
                If any provision of these Terms and Conditions is found to be invalid, unlawful, or unenforceable by a court of competent jurisdiction, that provision shall be severed, and the remaining provisions shall continue in full force and effect to the maximum extent permitted by law.
              </p>
            </section>

            {/* Section 17 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                17. Entire Agreement
              </h2>
              <p className="leading-relaxed">
                These Terms and Conditions, together with our Privacy Policy, constitute the entire agreement between you and Mango People News regarding your use of the Website. These Terms supersede all prior agreements, understandings, and negotiations, whether written or oral.
              </p>
            </section>

            {/* Section 18 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                18. Contact Information
              </h2>
              <p className="leading-relaxed">
                If you have questions, concerns, or disputes regarding these Terms and Conditions, please contact us at:
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
                We will make reasonable efforts to respond to all inquiries within 30 days.
              </p>
            </section>

            {/* Closing */}
            <section className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                ACKNOWLEDGMENT
              </p>
              <p className="leading-relaxed mt-3">
                By using Mango People News, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. You also acknowledge that you have reviewed our Privacy Policy and consent to the collection and use of your information as described therein.
              </p>
              <p className="text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
                <strong>Last Updated:</strong> May 1, 2026
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
