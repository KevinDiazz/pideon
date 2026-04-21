import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

/**
 * Layout público principal: Navbar arriba, Sidebar de categorías a la izquierda.
 * - En desktop (md+) el sidebar es una columna fija.
 * - En móvil el sidebar es un drawer que se abre con el botón hamburguesa.
 *
 * Si `withSidebar={false}` se renderiza solo la Navbar (útil para paneles).
 */
const MainLayout = ({ children, withSidebar = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-orange-50/40">
      <Navbar showHamburger={withSidebar} />

      <div className="flex flex-1 min-w-0">
        {withSidebar && <Sidebar />}
        <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
