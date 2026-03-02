export default function SafetyPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Safety Tips</h1>
      <p className="mb-4">
        Always verify product details before payment. Avoid advance payments to unknown sellers and prefer secure,
        in-person exchanges in public places.
      </p>
      <p className="mb-4">
        Never share OTPs, card PINs, UPI PINs, or bank credentials. Listiq staff will never ask for confidential
        payment credentials.
      </p>
      <p className="mb-4">
        Report suspicious listings, abusive chat behavior, fake proofs, or identity mismatch immediately through the
        platform report tools.
      </p>
      <p>
        In emergencies, contact local law enforcement first, then notify <span className="font-medium">safety@listiq.in</span>.
      </p>
    </div>
  );
}

