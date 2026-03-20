/**
 * Singleton del repositorio de usuarios.
 * Punto de composición: aquí es donde infrastructure se conecta con application.
 */

import { AxiosUsuarioRepository } from '../../infrastructure';
import { UsuarioApplicationService } from '../../application/services';

const repository = new AxiosUsuarioRepository();

export const usuarioService = new UsuarioApplicationService(repository);
export { repository as usuarioRepository };
