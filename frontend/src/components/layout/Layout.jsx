import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-auto">
        <div className="p-3 sm:p-4 lg:p-8 pt-16 lg:pt-8 pb-20 lg:pb-8 safe-area-bottom">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;