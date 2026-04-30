import SEO from '../seo/Seo'

export default function DisclaimerPage() {
  return (
    <>
      <SEO
        path="/disclaimer"
        title="Disclaimer - Mango People News"
        description="Important disclaimer and risk warnings for using Mango People News. Please read carefully before relying on our content."
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
              Disclaimer
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
            {/* Important Notice Banner */}
            <div
              className="p-6 rounded-lg border-2"
              style={{
                background: 'var(--breaking-bg)',
                borderColor: 'var(--breaking)',
              }}
            >
              <p style={{ color: 'var(--breaking)', fontWeight: 'bold' }}>
                ⚠️ IMPORTANT NOTICE
              </p>
              <p className="leading-relaxed mt-3" style={{ color: 'var(--breaking)' }}>
                This disclaimer is essential. Please read it carefully before using Mango People News. By accessing this Website, you acknowledge that you have read, understood, and agree to all disclaimers outlined below.
              </p>
            </div>

            {/* Section 1 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                1. General Disclaimer
              </h2>
              <p className="leading-relaxed">
                Mango People News (&quot;Website,&quot; &quot;we,&quot; &quot;us&quot;) provides informational and educational content about business, markets, economy, and financial topics. All content is provided on an &quot;AS-IS&quot; and &quot;AS-AVAILABLE&quot; basis without representations or warranties of any kind.
              </p>
              <p className="leading-relaxed mt-3">
                <strong>IMPORTANT:</strong> The information, news, analysis, and commentary on this Website are provided for informational purposes only and do not constitute investment advice, financial advice, legal advice, or professional recommendations of any kind.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                2. No Professional Advice
              </h2>
              <p className="leading-relaxed">
                Nothing on this Website should be construed as, or relied upon as, professional advice of any kind, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li><strong>Investment Advice:</strong> We do not recommend specific stocks, mutual funds, cryptocurrencies, or other securities</li>
                <li><strong>Financial Advice:</strong> We do not provide guidance on personal finance, budgeting, loans, or credit decisions</li>
                <li><strong>Legal Advice:</strong> We do not provide legal counsel or legal interpretations</li>
                <li><strong>Tax Advice:</strong> We do not provide tax planning or tax-related advice</li>
                <li><strong>Medical Advice:</strong> We do not provide health or medical information</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Before making any significant financial, investment, or legal decisions, consult with qualified professionals such as a financial advisor, investment advisor, lawyer, accountant, or tax professional.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                3. Content Accuracy and Reliability
              </h2>
              <p className="leading-relaxed">
                While we strive to provide accurate and timely information, we make no representations or warranties regarding:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Accuracy, completeness, or correctness of any information</li>
                <li>Timeliness or currency of news and market data</li>
                <li>Absence of errors, omissions, or inaccuracies</li>
                <li>Reliability or quality of third-party information sources</li>
                <li>Availability of real-time or delayed market data</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Market data and financial information may be subject to:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Delays in transmission or updating</li>
                <li>Errors or inaccuracies from source providers</li>
                <li>Changes without notice</li>
                <li>Technical limitations or failures</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                4. Opinion and Commentary
              </h2>
              <p className="leading-relaxed">
                Articles, analysis, and commentary on this Website may contain opinions, forecasts, predictions, or forward-looking statements. These represent the views of our writers and contributors and should not be considered as:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Factual statements or guarantees</li>
                <li>Professional recommendations</li>
                <li>Predictions that will necessarily come true</li>
                <li>Endorsements of any product or service</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Past performance or historical data is not indicative of future results. Market conditions, economic factors, and other variables can change significantly and unpredictably.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                5. Investment and Market Risk Disclaimer
              </h2>
              <p className="leading-relaxed">
                <strong>IMPORTANT RISK WARNING:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Investing in stocks, mutual funds, cryptocurrencies, commodities, or other securities involves substantial risk of loss</li>
                <li>You may lose part or all of your investment</li>
                <li>Past performance does not guarantee future results</li>
                <li>Market volatility can result in significant price fluctuations</li>
                <li>Different investments carry different levels of risk</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Before making any investment decisions:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Understand your risk tolerance and investment goals</li>
                <li>Conduct thorough research and due diligence</li>
                <li>Consider your financial situation and timeline</li>
                <li>Consult with a qualified financial advisor or investment professional</li>
                <li>Review official documents and prospectuses</li>
                <li>Be aware of all fees, charges, and potential conflicts of interest</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                6. Third-Party Content and Sources
              </h2>
              <p className="leading-relaxed">
                We may publish content that includes:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Information from third-party news sources</li>
                <li>Quotes, analysis, or commentary from external sources</li>
                <li>Data from government agencies, stock exchanges, or financial institutions</li>
                <li>User-generated content or reader submissions</li>
              </ul>
              <p className="leading-relaxed mt-3">
                We are not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Accuracy of third-party information</li>
                <li>Completeness or reliability of external sources</li>
                <li>Opinions or statements made by third parties</li>
                <li>Any damages arising from reliance on third-party content</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                7. No Guarantee of Website Availability
              </h2>
              <p className="leading-relaxed">
                We do not guarantee:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Uninterrupted access or availability of the Website</li>
                <li>That all Website features will function properly at all times</li>
                <li>That content will remain available or unchanged</li>
                <li>That Website operations will not be interrupted for maintenance</li>
              </ul>
              <p className="leading-relaxed mt-3">
                The Website may experience:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Temporary downtime or service interruptions</li>
                <li>Loss of data or content</li>
                <li>Technical errors or glitches</li>
                <li>Delayed updates to market data or news</li>
              </ul>
              <p className="leading-relaxed mt-3">
                We are not liable for any damages resulting from Website unavailability or service disruptions.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                8. User Responsibility
              </h2>
              <p className="leading-relaxed">
                By using this Website, you:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Acknowledge that you are using the Website at your own risk</li>
                <li>Assume full responsibility for any decisions you make based on Website content</li>
                <li>Understand that you may suffer financial or other losses</li>
                <li>Agree not to hold us liable for any consequences of your use</li>
              </ul>
              <p className="leading-relaxed mt-3">
                You are solely responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Evaluating the accuracy and reliability of information</li>
                <li>Determining the suitability of any information for your purposes</li>
                <li>Making informed decisions before taking action</li>
                <li>Seeking professional advice when necessary</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                9. Currency Exchange and International Content
              </h2>
              <p className="leading-relaxed">
                If you access this Website from outside India:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Currency exchange rates may fluctuate and affect conversions</li>
                <li>Tax implications may vary by jurisdiction</li>
                <li>Regulatory requirements and restrictions may differ</li>
                <li>Content may not be relevant or applicable to your location</li>
              </ul>
              <p className="leading-relaxed mt-3">
                We recommend consulting with local professionals regarding tax and regulatory compliance in your jurisdiction.
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
                <strong>TO THE FULLEST EXTENT PERMITTED BY LAW:</strong>
              </p>
              <p className="leading-relaxed mt-3">
                We shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Financial losses or loss of profits</li>
                <li>Loss of revenue or business opportunities</li>
                <li>Loss of data or information</li>
                <li>Trading losses or investment losses</li>
                <li>Damages from errors, omissions, or inaccuracies</li>
                <li>Damages from Website downtime or service interruptions</li>
                <li>Damages from third-party actions or external events</li>
              </ul>
              <p className="leading-relaxed mt-3">
                This limitation applies even if we have been advised of the possibility of such damages or if such damages were foreseeable.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                11. No Guarantee of Returns or Profits
              </h2>
              <p className="leading-relaxed">
                We do not guarantee or promise:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Any specific returns on investment</li>
                <li>Profits from following any advice or recommendations</li>
                <li>Success of any investment strategy or approach</li>
                <li>Prevention of financial losses</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Investment results depend on many factors including market conditions, timing, economic factors, and individual circumstances. Past performance is not indicative of future results.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                12. Regulatory and Legal Compliance
              </h2>
              <p className="leading-relaxed">
                This Website is provided for informational purposes only and does not constitute an offer to sell or a solicitation to buy any securities, financial products, or investment services.
              </p>
              <p className="leading-relaxed mt-3">
                We are not registered as:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>A financial advisor</li>
                <li>An investment advisor</li>
                <li>A broker-dealer</li>
                <li>A securities firm</li>
                <li>A credit counselor or financial service provider</li>
              </ul>
              <p className="leading-relaxed mt-3">
                If you are seeking professional financial or investment advice, please consult with a licensed and registered professional in your jurisdiction.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                13. Market Data Disclaimer
              </h2>
              <p className="leading-relaxed">
                All market data, quotes, and prices displayed on this Website are:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Subject to change without notice</li>
                <li>Potentially delayed or inaccurate</li>
                <li>Provided by third-party data providers</li>
                <li>Not guaranteed to be complete or accurate</li>
              </ul>
              <p className="leading-relaxed mt-3">
                For real-time, accurate market data, please consult official stock exchange websites or licensed financial platforms.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                14. No Affiliation with Companies Mentioned
              </h2>
              <p className="leading-relaxed">
                Mango People News is an independent news and information publication. We are not affiliated with, endorsed by, or associated with any companies, corporations, or individuals mentioned in our content, unless explicitly stated.
              </p>
              <p className="leading-relaxed mt-3">
                Mention of a company does not imply:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Endorsement or recommendation</li>
                <li>Partnership or business relationship</li>
                <li>Investment suitability</li>
                <li>Any particular opinion or conclusion</li>
              </ul>
            </section>

            {/* Section 15 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                15. Newsletter Subscriber Disclaimer
              </h2>
              <p className="leading-relaxed">
                If you subscribe to our newsletter, you understand that:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>Newsletter content is for informational purposes only</li>
                <li>Newsletter content does not constitute investment or financial advice</li>
                <li>You should conduct your own research before making decisions</li>
                <li>We are not responsible for any losses or damages from newsletter content</li>
                <li>Newsletter frequency and content may change without notice</li>
              </ul>
            </section>

            {/* Section 16 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                16. Updates to Disclaimer
              </h2>
              <p className="leading-relaxed">
                We reserve the right to update, modify, or change this Disclaimer at any time without prior notice. Changes are effective immediately upon posting to the Website. Your continued use of the Website constitutes your acceptance of any changes to this Disclaimer.
              </p>
              <p className="leading-relaxed mt-3">
                We recommend reviewing this Disclaimer regularly to stay informed of any updates.
              </p>
            </section>

            {/* Section 17 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                17. Acknowledgment
              </h2>
              <p className="leading-relaxed">
                <strong>By using Mango People News, you acknowledge that:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed mt-3">
                <li>You have read and understood this Disclaimer in its entirety</li>
                <li>You understand the risks associated with investing and financial decisions</li>
                <li>You are using the Website at your own risk</li>
                <li>You will not hold Mango People News liable for any consequences</li>
                <li>You will seek professional advice before making important decisions</li>
              </ul>
            </section>

            {/* Section 18 */}
            <section>
              <h2
                className="font-bold text-2xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                18. Contact Us
              </h2>
              <p className="leading-relaxed">
                If you have questions or concerns about this Disclaimer, please contact us at:
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
            </section>

            {/* Closing */}
            <section className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
              <div
                className="p-6 rounded-lg"
                style={{
                  background: 'var(--accent-light)',
                  borderLeft: '4px solid var(--accent)',
                }}
              >
                <p style={{ color: 'var(--accent-text)', fontWeight: 'bold' }}>
                  🔔 FINAL NOTE
                </p>
                <p className="leading-relaxed mt-3" style={{ color: 'var(--accent-text)' }}>
                  This Disclaimer is provided for your protection and our legal compliance. We take our responsibility to our users seriously and strive to provide accurate, helpful information. However, always remember to think critically, conduct your own research, and consult with qualified professionals before making any important decisions.
                </p>
              </div>

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
