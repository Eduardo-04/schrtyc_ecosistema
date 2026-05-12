export default function Footer() {
  const estaciones = [
    { nombre: 'Canal 10 TV', href: '#en-vivo' },
    { nombre: 'Radio 92.5 FM', href: '#en-vivo' },
    { nombre: 'Radio 101.3 FM', href: '#en-vivo' },
    { nombre: 'Radio 101.3 FM', href: '#en-vivo' },
    { nombre: 'Radio 102.3 FM', href: '#en-vivo' },
  ]

  return (
    <footer>

      {/* Cuerpo — gris oscuro igual al sitio actual #2d2d2d */}
      <div style={{ backgroundColor: '#2d2d2d' }} className="text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Col 1 — Logo "Humanismo que Transforma" + descripción */}
          <div className="flex flex-col gap-4">
            <img
              src="http://radiotvycine.chiapas.gob.mx/assets/img/logo-hqt.png"
              alt="Humanismo que Transforma - Gobierno de Chiapas"
              className="w-48"
              onError={e => { e.target.style.display = 'none' }}
            />
            <p className="text-sm opacity-60 leading-relaxed mt-2">
              Sistema Chiapaneco de Radio, Televisión y Cinematografía.
            </p>
          </div>

          {/* Col 2 — Acerca de */}
          <div>
            <h4 className="text-sm font-semibold mb-3 pb-2"
              style={{ borderBottom: '2px solid #611232' }}>
              Acerca de
            </h4>
            <ul className="space-y-3 mt-4">
              {['Misión', 'Visión'].map(item => (
                <li key={item} className="flex items-center justify-between border-b border-white/10 pb-2">
                  <a href="#" className="text-sm opacity-60 hover:opacity-100 hover:text-[#A57F2C] transition">
                    {item}
                  </a>
                  <span className="opacity-40 text-xs">›</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Recursos */}
          <div>
            <h4 className="text-sm font-semibold mb-3 pb-2"
              style={{ borderBottom: '2px solid #611232' }}>
              Recursos
            </h4>
            <ul className="space-y-3 mt-4">
              {['Acerca del Portal', 'Avisos de Privacidad'].map(item => (
                <li key={item} className="flex items-center justify-between border-b border-white/10 pb-2">
                  <a href="#" className="text-sm opacity-60 hover:opacity-100 hover:text-[#A57F2C] transition">
                    {item}
                  </a>
                  <span className="opacity-40 text-xs">›</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contáctanos */}
          <div>
            <h4 className="text-sm font-semibold mb-3 pb-2"
              style={{ borderBottom: '2px solid #611232' }}>
              Contáctanos
            </h4>
            <address className="not-italic text-sm opacity-60 leading-relaxed mt-4">
              Libramiento Norte Poniente s/n,<br />
              Colonia San Jorge C.P. 29039<br />
              Tuxtla Gutiérrez, Chiapas.<br />
              <span className="mt-2 block">
                Conmutador: (961) 61 705-00 Ext. 57000
              </span>
            </address>
          </div>

        </div>
      </div>

      {/* Barra inferior — más oscura, igual al sitio */}
      <div style={{ backgroundColor: '#1e1e1e' }} className="text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs opacity-40 flex flex-wrap gap-x-2 gap-y-1">
            <span>Trámites y Servicios:</span>
            {['Buscar servicios', 'Pago de Derechos', 'Servicios por Entidad', 'Servicios por Internet'].map((s, i, arr) => (
              <span key={s}>
                <a href="#" className="hover:opacity-80 transition">{s}</a>
                {i < arr.length - 1 && <span className="mx-1 opacity-30">|</span>}
              </span>
            ))}
          </div>
          {/* Íconos de redes — igual al sitio actual */}
          <div className="flex gap-3">
            {[
              { label: 'f', href: 'https://facebook.com/RadioyTvChiapas' },
              { label: 'in', href: '#' },
              { label: '𝕏', href: '#' },
            ].map(r => (
              <a key={r.label} href={r.href} target="_blank" rel="noreferrer"
                style={{ backgroundColor: '#444', width: '30px', height: '30px' }}
                className="rounded flex items-center justify-center text-xs opacity-70 hover:opacity-100 hover:bg-[#611232] transition">
                {r.label}
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  )
}