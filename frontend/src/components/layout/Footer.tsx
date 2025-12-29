// Footer component
export const Footer = () => {
  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} QuickSplit. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

