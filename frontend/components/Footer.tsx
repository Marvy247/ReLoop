export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; 2025 ReLoop. All rights reserved.</p>
        <p className="mt-2">Built on VeChainThor Blockchain for a Sustainable Future</p>
        <div className="mt-4 space-x-4">
          <a href="https://vechain.org" target="_blank" rel="noopener noreferrer" className="hover:underline">
            VeChain
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
