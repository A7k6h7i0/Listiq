export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">
        This policy explains how Listiq collects, stores, and processes your personal information to operate the
        marketplace and maintain trust and safety.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <p className="mb-4">
        We collect account information, profile details, listing content, chat metadata, and technical usage data
        required for authentication, moderation, and service performance.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Your Data</h2>
      <p className="mb-4">
        Data is used for account management, fraud prevention, listing visibility, customer support, legal compliance,
        and feature improvements.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Data Sharing</h2>
      <p className="mb-4">
        We do not sell personal data. Limited sharing may occur with payment processors, hosting partners, analytics
        services, and legal authorities when required.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Data Retention and Security</h2>
      <p className="mb-4">
        We retain data only as necessary for operational and legal purposes. We use administrative, technical, and
        organizational safeguards to protect stored information.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Your Rights</h2>
      <p>
        You may request access, correction, or deletion of eligible personal data by contacting
        <span className="font-medium"> privacy@listiq.in</span>.
      </p>
    </div>
  );
}

