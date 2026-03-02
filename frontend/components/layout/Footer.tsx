import Link from 'next/link';

const footerSections = [
  {
    title: 'About',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/careers', label: 'Careers' },
      { href: '/press', label: 'Press' },
    ],
  },
  {
    title: 'Help',
    links: [
      { href: '/help', label: 'Help Center' },
      { href: '/safety', label: 'Safety Tips' },
      { href: '/contact', label: 'Contact Us' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms of Service' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/cookies', label: 'Cookie Policy' },
    ],
  },
  {
    title: 'Follow Us',
    links: [
      { href: '#', label: 'Facebook' },
      { href: '#', label: 'Twitter' },
      { href: '#', label: 'Instagram' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="font-medium hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Listiq. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
