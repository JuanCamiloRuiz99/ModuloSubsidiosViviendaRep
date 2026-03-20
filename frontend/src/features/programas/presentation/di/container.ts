/**
 * Singleton del servicio de programas.
 */

import { AxiosProgramaRepository } from '../../infrastructure';
import { ProgramaApplicationService } from '../../application/services';

const repository = new AxiosProgramaRepository();

export const programaService = new ProgramaApplicationService(repository);
