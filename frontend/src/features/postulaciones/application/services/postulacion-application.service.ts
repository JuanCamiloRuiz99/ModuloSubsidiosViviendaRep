/**
 * Servicio de Aplicación para Postulaciones
 */

import { PostulacionRepository } from '../../domain';
import {
  CrearPostulacionDTO,
  ObtenerPostulacionDTO,
  ListarPostulacionesDTO,
  RevisarPostulacionDTO,
  AprobarPostulacionDTO,
  RechazarPostulacionDTO,
  AnularPostulacionDTO,
} from '../dtos/postulacion-in';
import { PostulacionDTO, ListaPostulacionesDTO } from '../dtos/postulacion-out';
import {
  CrearPostulacionUseCase,
  ObtenerPostulacionUseCase,
  ListarPostulacionesUseCase,
  RevisarPostulacionUseCase,
  AprobarPostulacionUseCase,
  RechazarPostulacionUseCase,
  AnularPostulacionUseCase,
} from './postulacion-use-cases';

export class PostulacionApplicationService {
  private crearUseCase: CrearPostulacionUseCase;
  private obtenerUseCase: ObtenerPostulacionUseCase;
  private listarUseCase: ListarPostulacionesUseCase;
  private revisarUseCase: RevisarPostulacionUseCase;
  private aprobarUseCase: AprobarPostulacionUseCase;
  private rechazarUseCase: RechazarPostulacionUseCase;
  private anularUseCase: AnularPostulacionUseCase;

  constructor(repository: PostulacionRepository) {
    this.crearUseCase = new CrearPostulacionUseCase(repository);
    this.obtenerUseCase = new ObtenerPostulacionUseCase(repository);
    this.listarUseCase = new ListarPostulacionesUseCase(repository);
    this.revisarUseCase = new RevisarPostulacionUseCase(repository);
    this.aprobarUseCase = new AprobarPostulacionUseCase(repository);
    this.rechazarUseCase = new RechazarPostulacionUseCase(repository);
    this.anularUseCase = new AnularPostulacionUseCase(repository);
  }

  async crear(input: CrearPostulacionDTO): Promise<PostulacionDTO> {
    return this.crearUseCase.execute(input);
  }

  async obtener(input: ObtenerPostulacionDTO): Promise<PostulacionDTO> {
    return this.obtenerUseCase.execute(input);
  }

  async listar(input: ListarPostulacionesDTO): Promise<ListaPostulacionesDTO> {
    return this.listarUseCase.execute(input);
  }

  async revisar(input: RevisarPostulacionDTO): Promise<PostulacionDTO> {
    return this.revisarUseCase.execute(input);
  }

  async aprobar(input: AprobarPostulacionDTO): Promise<PostulacionDTO> {
    return this.aprobarUseCase.execute(input);
  }

  async rechazar(input: RechazarPostulacionDTO): Promise<PostulacionDTO> {
    return this.rechazarUseCase.execute(input);
  }

  async anular(input: AnularPostulacionDTO): Promise<PostulacionDTO> {
    return this.anularUseCase.execute(input);
  }
}
