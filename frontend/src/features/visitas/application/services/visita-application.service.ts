/**
 * Servicio de Aplicación para Visitas
 */

import { VisitaRepository } from '../../domain';
import {
  CrearVisitaDTO,
  ObtenerVisitaDTO,
  ListarVisitasDTO,
  IniciarVisitaDTO,
  CompletarVisitaDTO,
  CancelarVisitaDTO,
} from '../dtos/visita-in';
import { VisitaDTO, ListaVisitasDTO } from '../dtos/visita-out';
import {
  CrearVisitaUseCase,
  ObtenerVisitaUseCase,
  ListarVisitasUseCase,
  IniciarVisitaUseCase,
  CompletarVisitaUseCase,
  CancelarVisitaUseCase,
} from '../use-cases/visita-use-cases';

export class VisitaApplicationService {
  private crearUseCase: CrearVisitaUseCase;
  private obtenerUseCase: ObtenerVisitaUseCase;
  private listarUseCase: ListarVisitasUseCase;
  private iniciarUseCase: IniciarVisitaUseCase;
  private completarUseCase: CompletarVisitaUseCase;
  private cancelarUseCase: CancelarVisitaUseCase;

  constructor(repository: VisitaRepository) {
    this.crearUseCase = new CrearVisitaUseCase(repository);
    this.obtenerUseCase = new ObtenerVisitaUseCase(repository);
    this.listarUseCase = new ListarVisitasUseCase(repository);
    this.iniciarUseCase = new IniciarVisitaUseCase(repository);
    this.completarUseCase = new CompletarVisitaUseCase(repository);
    this.cancelarUseCase = new CancelarVisitaUseCase(repository);
  }

  async crear(input: CrearVisitaDTO): Promise<VisitaDTO> {
    return this.crearUseCase.execute(input);
  }

  async obtener(input: ObtenerVisitaDTO): Promise<VisitaDTO> {
    return this.obtenerUseCase.execute(input);
  }

  async listar(input: ListarVisitasDTO): Promise<ListaVisitasDTO> {
    return this.listarUseCase.execute(input);
  }

  async iniciar(input: IniciarVisitaDTO): Promise<VisitaDTO> {
    return this.iniciarUseCase.execute(input);
  }

  async completar(input: CompletarVisitaDTO): Promise<VisitaDTO> {
    return this.completarUseCase.execute(input);
  }

  async cancelar(input: CancelarVisitaDTO): Promise<VisitaDTO> {
    return this.cancelarUseCase.execute(input);
  }
}
