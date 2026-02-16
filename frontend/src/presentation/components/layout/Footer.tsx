function Footer() {
  return (
    <footer className="bg-blue-950 text-white mt-auto">
      <div className="grid grid-cols-3 gap-8 px-10 py-6 text-sm">
        <div>
          <h3 className="font-bold mb-2">Información de Contacto</h3>
          <p>Calle 4 # 4-29, Popayán, Cauca</p>
          <p>Línea de atención: (602) 824 4517</p>
        </div>

        <div>
          <h3 className="font-bold mb-2">Horarios de Atención</h3>
          <p>Lunes a Viernes</p>
          <p>8:00 AM - 12:00 PM | 2:00 PM - 6:00 PM</p>
        </div>

        <div>
          <h3 className="font-bold mb-2">Transparencia</h3>
          <p>Línea Anticorrupción</p>
          <p>018000 913 040</p>
        </div>
      </div>

      <div className="bg-indigo-700 text-center py-3 text-xs">
        GOV.CO - Colombia
      </div>
    </footer>
  );
}

export default Footer;
