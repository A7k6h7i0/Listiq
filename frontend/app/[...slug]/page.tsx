import Link from 'next/link';

export default function GenericContentPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-semibold mb-3">Page Coming Soon</h1>
      <p className="text-muted-foreground mb-6">
        This section is not implemented yet in your current build.
      </p>
      <Link href="/" className="text-primary hover:underline">
        Go back to homepage
      </Link>
    </div>
  );
}

