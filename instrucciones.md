Tailwind CSS

Usar solo Tailwind para estilos.

No usar CSS tradicional ni inline styles.

Diseño responsive obligatorio.

Mantener consistencia visual.

2️⃣ Zod

Validar todos los formularios con Zod.

Crear un schema por formulario.

No usar validaciones manuales.

3️⃣ React Hook Form

Manejar todos los formularios con React Hook Form.

No usar useState para inputs.

Integrar con Zod usando resolver.

Mostrar errores debajo de cada campo.

4️⃣ Radix UI

Usar Radix para modales, dropdowns, selects, tooltips y dialogs.

Aplicar estilos con Tailwind.

No crear estos componentes desde cero.

5️⃣ TanStack Query

No usar fetch en useEffect.

Usar useQuery para GET.

Usar useMutation para POST/PUT/DELETE.

Invalidar queries después de mutaciones.

Separar lógica API en /services.

Trabajar con una arquitectura hexagonal