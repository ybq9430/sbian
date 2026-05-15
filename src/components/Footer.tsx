export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Shelf</h3>
            <p className="text-sm">The all-in-one platform for digital creators.</p>
          </div>
          {[
            { title: "Product", links: ["Features", "Pricing", "API", "Changelog"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
            { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Licenses"] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="text-white font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((l, j) => <li key={j}><a href={l.toLowerCase().replace(/\s+/g, "-")} className="hover:text-white transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} Shelf. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
