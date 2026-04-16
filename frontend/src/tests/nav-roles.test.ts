/**
 * Tests unitarios — lógica de filtrado de ítems de navegación por rol.
 * Extrae la misma lógica que usa MainLayout para evitar montar el componente
 * completo (que requiere contextos de router, storage, etc.).
 */

interface NavItem {
  label: string;
  path: string;
  roles?: number[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',            path: '/dashboard' },
  { label: 'Programa de Subsidio', path: '/programas',           roles: [1] },
  { label: 'Postulantes',          path: '/postulantes',         roles: [1] },
  { label: 'Postulaciones',        path: '/mis-postulaciones',   roles: [2] },
  { label: 'Documentos Internos',  path: '/documentos-internos', roles: [1, 2] },
  { label: 'Visitas',              path: '/visitas',             roles: [1] },
  { label: 'Mis Visitas',          path: '/mis-visitas',         roles: [3] },
  { label: 'Usuarios y Roles',     path: '/usuarios',            roles: [1] },
];

function filterNav(rol: number) {
  return NAV_ITEMS.filter(item => !item.roles || item.roles.includes(rol));
}

describe('Filtrado de navegación por rol', () => {
  describe('Admin (rol 1)', () => {
    const items = filterNav(1);
    const paths = items.map(i => i.path);

    it('ve Dashboard', ()         => expect(paths).toContain('/dashboard'));
    it('ve Programas', ()         => expect(paths).toContain('/programas'));
    it('ve Postulantes', ()       => expect(paths).toContain('/postulantes'));
    it('ve Documentos Internos',()=> expect(paths).toContain('/documentos-internos'));
    it('ve Visitas', ()           => expect(paths).toContain('/visitas'));
    it('ve Usuarios y Roles', ()  => expect(paths).toContain('/usuarios'));
    it('NO ve Postulaciones (funcionario)', () => expect(paths).not.toContain('/mis-postulaciones'));
    it('NO ve Mis Visitas (técnico)', ()       => expect(paths).not.toContain('/mis-visitas'));
  });

  describe('Funcionario (rol 2)', () => {
    const items = filterNav(2);
    const paths = items.map(i => i.path);

    it('ve Dashboard', ()              => expect(paths).toContain('/dashboard'));
    it('ve Postulaciones', ()          => expect(paths).toContain('/mis-postulaciones'));
    it('ve Documentos Internos', ()    => expect(paths).toContain('/documentos-internos'));
    it('NO ve Programas', ()           => expect(paths).not.toContain('/programas'));
    it('NO ve Postulantes (admin)', () => expect(paths).not.toContain('/postulantes'));
    it('NO ve Visitas (admin)', ()     => expect(paths).not.toContain('/visitas'));
    it('NO ve Mis Visitas (técnico)',()=> expect(paths).not.toContain('/mis-visitas'));
    it('NO ve Usuarios y Roles', ()    => expect(paths).not.toContain('/usuarios'));
  });

  describe('Técnico visitador (rol 3)', () => {
    const items = filterNav(3);
    const paths = items.map(i => i.path);

    it('ve Dashboard', ()          => expect(paths).toContain('/dashboard'));
    it('ve Mis Visitas', ()        => expect(paths).toContain('/mis-visitas'));
    it('NO ve Programas', ()       => expect(paths).not.toContain('/programas'));
    it('NO ve Postulantes', ()     => expect(paths).not.toContain('/postulantes'));
    it('NO ve Postulaciones', ()   => expect(paths).not.toContain('/mis-postulaciones'));
    it('NO ve Documentos Int.', () => expect(paths).not.toContain('/documentos-internos'));
    it('NO ve Visitas (admin)', () => expect(paths).not.toContain('/visitas'));
    it('NO ve Usuarios', ()        => expect(paths).not.toContain('/usuarios'));
  });
});
