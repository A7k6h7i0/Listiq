export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
      <p className="mb-4">
        Listiq uses cookies and similar technologies to keep sessions active, improve platform performance, and measure
        product usage quality.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Essential Cookies</h2>
      <p className="mb-4">
        Required for login, security controls, and core marketplace functionality. Disabling these may prevent key
        features from working properly.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Performance Cookies</h2>
      <p className="mb-4">
        Help us understand page speed, reliability, and common navigation behavior to improve user experience.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Preference Cookies</h2>
      <p className="mb-4">
        Store non-sensitive preferences such as language, display choices, and interface states where supported.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Managing Cookies</h2>
      <p>
        You can control cookies in browser settings. Blocking all cookies may impact authentication and session
        continuity on the platform.
      </p>
    </div>
  );
}

