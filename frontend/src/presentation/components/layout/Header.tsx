function Header() {
  return (
    <header className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div>
        <h1 className="text-xl font-bold">Alcaldía de Popayán</h1>
        <p className="text-sm">Sistema de Gestión de Subsidios de Vivienda</p>
      </div>

      <div className="flex gap-4">
        <button className="bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-600 transition">
          Inicio
        </button>
        <button className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-500 transition">
          Acceso Funcionarios
        </button>
      </div>
    </header>
  );
}

export default Header;
