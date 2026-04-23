#!/usr/bin/env python
"""Seed 10 postulaciones REGISTRADA para Reconstruccion de vivienda 2026."""
import os, sys, django
from datetime import date
from decimal import Decimal
from seed_setup import setup_django_path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
setup_django_path()
django.setup()

from infrastructure.database.models import (
    Programa, Etapa, Ciudadano, Postulacion, GestionHogarEtapa1, MiembroHogar,
)

programa = Programa.objects.get(id=21)
etapa1 = Etapa.objects.get(id=78)

FAMILIAS = [
    {
        'radicado': 'RAD-REC-202604-0001',
        'titular': {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76301001','primer_nombre':'Carlos','segundo_nombre':'Andrés','primer_apellido':'Muñoz','segundo_apellido':'Caicedo','fecha_nacimiento':date(1978,3,12),'sexo':'MASCULINO','nacionalidad':'Colombiana','telefono':'3101234001','correo_electronico':'carlos.munoz@correo.com','departamento_nacimiento':'Cauca','municipio_nacimiento':'Popayán'},
        'predio': {'departamento':'Cauca','municipio':'Popayán','zona':'URBANA','tipo_predio':'Casa','comuna':'Comuna 3','barrio_vereda':'Barrio Alfonso López','direccion':'Cra 6 # 15-32','estrato':'1','es_propietario':True,'numero_predial':'19001000003001','matricula_inmobiliaria':'120-80001','avaluo_catastral':'32000000','numero_matricula_agua':'AC-REC-001','numero_contrato_energia':'CE-REC-001','tiempo_residencia':'20 años','tiene_dependientes':True,'personas_con_discapacidad_hogar':False,'acepta_terminos_condiciones':True},
        'miembros': [
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76301001','primer_nombre':'Carlos','segundo_nombre':'Andrés','primer_apellido':'Muñoz','segundo_apellido':'Caicedo','fecha_nacimiento':date(1978,3,12),'parentesco':'PADRE','es_cabeza_hogar':True,'nivel_educativo':'Secundaria completa','situacion_laboral':'INDEPENDIENTE','ingresos_mensuales':Decimal('1200000'),'fuente_ingresos':'Albañilería','pertenece_sisben':True,'grupo_sisben':'B','puntaje_sisben':Decimal('28.5')},
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76301002','primer_nombre':'Martha','segundo_nombre':'Lucía','primer_apellido':'Caicedo','segundo_apellido':'Ruiz','fecha_nacimiento':date(1980,7,25),'parentesco':'CONYUGE','es_cabeza_hogar':False,'nivel_educativo':'Primaria completa','situacion_laboral':'HOGAR','pertenece_sisben':True,'grupo_sisben':'B','puntaje_sisben':Decimal('28.5')},
        ],
    },
    {
        'radicado': 'RAD-REC-202604-0002',
        'titular': {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76302001','primer_nombre':'Luz','segundo_nombre':'Marina','primer_apellido':'Valencia','segundo_apellido':'Ordóñez','fecha_nacimiento':date(1970,11,8),'sexo':'FEMENINO','nacionalidad':'Colombiana','telefono':'3151234002','correo_electronico':'luz.valencia@correo.com','departamento_nacimiento':'Cauca','municipio_nacimiento':'Popayán'},
        'predio': {'departamento':'Cauca','municipio':'Popayán','zona':'URBANA','tipo_predio':'Casa','comuna':'Comuna 7','barrio_vereda':'Barrio El Empedrado','direccion':'Cll 4 # 9-18','estrato':'2','es_propietario':True,'numero_predial':'19001000007001','matricula_inmobiliaria':'120-80002','avaluo_catastral':'45000000','numero_matricula_agua':'AC-REC-002','numero_contrato_energia':'CE-REC-002','tiempo_residencia':'30 años','tiene_dependientes':True,'personas_con_discapacidad_hogar':True,'acepta_terminos_condiciones':True},
        'miembros': [
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76302001','primer_nombre':'Luz','segundo_nombre':'Marina','primer_apellido':'Valencia','segundo_apellido':'Ordóñez','fecha_nacimiento':date(1970,11,8),'parentesco':'MADRE','es_cabeza_hogar':True,'nivel_educativo':'Primaria incompleta','situacion_laboral':'HOGAR','pertenece_sisben':True,'grupo_sisben':'A','puntaje_sisben':Decimal('18.2')},
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76302002','primer_nombre':'Jorge','segundo_nombre':'Elías','primer_apellido':'Gómez','segundo_apellido':'Valencia','fecha_nacimiento':date(1992,5,14),'parentesco':'HIJO','es_cabeza_hogar':False,'nivel_educativo':'Técnico','situacion_laboral':'EMPLEADO','ingresos_mensuales':Decimal('1300000'),'fuente_ingresos':'Operario fábrica','pertenece_sisben':True,'grupo_sisben':'A','puntaje_sisben':Decimal('18.2')},
            {'tipo_documento':'REGISTRO_CIVIL','numero_documento':'1061830001','primer_nombre':'Sofía','segundo_nombre':'','primer_apellido':'Gómez','segundo_apellido':'Paz','fecha_nacimiento':date(2020,2,10),'parentesco':'NIETA','es_cabeza_hogar':False,'pertenece_sisben':True,'grupo_sisben':'A','puntaje_sisben':Decimal('18.2')},
        ],
    },
    {
        'radicado': 'RAD-REC-202604-0003',
        'titular': {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76303001','primer_nombre':'Pedro','segundo_nombre':'Antonio','primer_apellido':'Chaves','segundo_apellido':'Luna','fecha_nacimiento':date(1965,6,20),'sexo':'MASCULINO','nacionalidad':'Colombiana','telefono':'3201234003','correo_electronico':'pedro.chaves@correo.com','departamento_nacimiento':'Cauca','municipio_nacimiento':'Popayán'},
        'predio': {'departamento':'Cauca','municipio':'Popayán','zona':'URBANA','tipo_predio':'Casa','comuna':'Comuna 2','barrio_vereda':'Barrio Bolívar','direccion':'Cra 10 # 3-56','estrato':'1','es_propietario':True,'numero_predial':'19001000002001','matricula_inmobiliaria':'120-80003','avaluo_catastral':'28000000','numero_matricula_agua':'AC-REC-003','numero_contrato_energia':'CE-REC-003','tiempo_residencia':'40 años','tiene_dependientes':False,'personas_con_discapacidad_hogar':False,'acepta_terminos_condiciones':True},
        'miembros': [
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76303001','primer_nombre':'Pedro','segundo_nombre':'Antonio','primer_apellido':'Chaves','segundo_apellido':'Luna','fecha_nacimiento':date(1965,6,20),'parentesco':'PADRE','es_cabeza_hogar':True,'nivel_educativo':'Primaria completa','situacion_laboral':'INDEPENDIENTE','ingresos_mensuales':Decimal('900000'),'fuente_ingresos':'Carpintería','pertenece_sisben':True,'grupo_sisben':'A','puntaje_sisben':Decimal('15.0')},
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76303002','primer_nombre':'Rosa','segundo_nombre':'Elena','primer_apellido':'Luna','segundo_apellido':'Díaz','fecha_nacimiento':date(1968,9,3),'parentesco':'CONYUGE','es_cabeza_hogar':False,'nivel_educativo':'Primaria completa','situacion_laboral':'HOGAR','pertenece_sisben':True,'grupo_sisben':'A','puntaje_sisben':Decimal('15.0')},
        ],
    },
    {
        'radicado': 'RAD-REC-202604-0004',
        'titular': {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76304001','primer_nombre':'Sandra','segundo_nombre':'Milena','primer_apellido':'Bolaños','segundo_apellido':'Cerón','fecha_nacimiento':date(1988,1,15),'sexo':'FEMENINO','nacionalidad':'Colombiana','telefono':'3181234004','correo_electronico':'sandra.bolanos@correo.com','departamento_nacimiento':'Cauca','municipio_nacimiento':'Popayán'},
        'predio': {'departamento':'Cauca','municipio':'Popayán','zona':'URBANA','tipo_predio':'Apartamento','comuna':'Comuna 4','barrio_vereda':'Barrio La Estancia','direccion':'Cll 21 # 7-10 Apto 302','estrato':'2','es_propietario':True,'numero_predial':'19001000004001','matricula_inmobiliaria':'120-80004','avaluo_catastral':'52000000','numero_matricula_agua':'AC-REC-004','numero_contrato_energia':'CE-REC-004','tiempo_residencia':'8 años','tiene_dependientes':True,'personas_con_discapacidad_hogar':False,'acepta_terminos_condiciones':True},
        'miembros': [
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76304001','primer_nombre':'Sandra','segundo_nombre':'Milena','primer_apellido':'Bolaños','segundo_apellido':'Cerón','fecha_nacimiento':date(1988,1,15),'parentesco':'MADRE','es_cabeza_hogar':True,'nivel_educativo':'Universitario','situacion_laboral':'EMPLEADO','ingresos_mensuales':Decimal('1800000'),'fuente_ingresos':'Secretaria','pertenece_sisben':True,'grupo_sisben':'B','puntaje_sisben':Decimal('32.1')},
            {'tipo_documento':'TARJETA_IDENTIDAD','numero_documento':'1061840001','primer_nombre':'Mateo','segundo_nombre':'','primer_apellido':'Bolaños','segundo_apellido':'Cerón','fecha_nacimiento':date(2013,4,22),'parentesco':'HIJO','es_cabeza_hogar':False,'nivel_educativo':'Secundaria incompleta','situacion_laboral':'','pertenece_sisben':True,'grupo_sisben':'B','puntaje_sisben':Decimal('32.1')},
            {'tipo_documento':'REGISTRO_CIVIL','numero_documento':'1061840002','primer_nombre':'Isabella','segundo_nombre':'','primer_apellido':'Bolaños','segundo_apellido':'Cerón','fecha_nacimiento':date(2019,8,5),'parentesco':'HIJA','es_cabeza_hogar':False,'pertenece_sisben':True,'grupo_sisben':'B','puntaje_sisben':Decimal('32.1')},
        ],
    },
    {
        'radicado': 'RAD-REC-202604-0005',
        'titular': {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76305001','primer_nombre':'Hernán','segundo_nombre':'Darío','primer_apellido':'Mosquera','segundo_apellido':'Prado','fecha_nacimiento':date(1975,10,30),'sexo':'MASCULINO','nacionalidad':'Colombiana','telefono':'3121234005','correo_electronico':'hernan.mosquera@correo.com','departamento_nacimiento':'Cauca','municipio_nacimiento':'Popayán'},
        'predio': {'departamento':'Cauca','municipio':'Popayán','zona':'RURAL','tipo_predio':'Finca','comuna':'','barrio_vereda':'Vereda El Charco','direccion':'Km 5 vía Popayán-Coconuco','estrato':'1','es_propietario':True,'numero_predial':'19001000090001','matricula_inmobiliaria':'120-80005','avaluo_catastral':'22000000','numero_matricula_agua':'AC-REC-005','numero_contrato_energia':'CE-REC-005','tiempo_residencia':'25 años','tiene_dependientes':True,'personas_con_discapacidad_hogar':False,'acepta_terminos_condiciones':True},
        'miembros': [
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76305001','primer_nombre':'Hernán','segundo_nombre':'Darío','primer_apellido':'Mosquera','segundo_apellido':'Prado','fecha_nacimiento':date(1975,10,30),'parentesco':'PADRE','es_cabeza_hogar':True,'nivel_educativo':'Primaria incompleta','situacion_laboral':'INDEPENDIENTE','ingresos_mensuales':Decimal('800000'),'fuente_ingresos':'Agricultura','pertenece_sisben':True,'grupo_sisben':'A','puntaje_sisben':Decimal('12.0')},
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76305002','primer_nombre':'Blanca','segundo_nombre':'Nelly','primer_apellido':'Prado','segundo_apellido':'Ortega','fecha_nacimiento':date(1978,4,18),'parentesco':'CONYUGE','es_cabeza_hogar':False,'nivel_educativo':'Primaria completa','situacion_laboral':'HOGAR','pertenece_sisben':True,'grupo_sisben':'A','puntaje_sisben':Decimal('12.0')},
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76305003','primer_nombre':'Diego','segundo_nombre':'Fernando','primer_apellido':'Mosquera','segundo_apellido':'Prado','fecha_nacimiento':date(2000,12,1),'parentesco':'HIJO','es_cabeza_hogar':False,'nivel_educativo':'Secundaria completa','situacion_laboral':'DESEMPLEADO','pertenece_sisben':True,'grupo_sisben':'A','puntaje_sisben':Decimal('12.0')},
        ],
    },
    {
        'radicado': 'RAD-REC-202604-0006',
        'titular': {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76306001','primer_nombre':'Adriana','segundo_nombre':'Patricia','primer_apellido':'Solarte','segundo_apellido':'Erazo','fecha_nacimiento':date(1983,8,9),'sexo':'FEMENINO','nacionalidad':'Colombiana','telefono':'3171234006','correo_electronico':'adriana.solarte@correo.com','departamento_nacimiento':'Cauca','municipio_nacimiento':'Popayán'},
        'predio': {'departamento':'Cauca','municipio':'Popayán','zona':'URBANA','tipo_predio':'Casa','comuna':'Comuna 6','barrio_vereda':'Barrio María Oriente','direccion':'Cll 70 # 2-15','estrato':'1','es_propietario':False,'numero_predial':'19001000006001','matricula_inmobiliaria':'120-80006','avaluo_catastral':'25000000','numero_matricula_agua':'AC-REC-006','numero_contrato_energia':'CE-REC-006','tiempo_residencia':'12 años','tiene_dependientes':True,'personas_con_discapacidad_hogar':False,'acepta_terminos_condiciones':True},
        'miembros': [
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76306001','primer_nombre':'Adriana','segundo_nombre':'Patricia','primer_apellido':'Solarte','segundo_apellido':'Erazo','fecha_nacimiento':date(1983,8,9),'parentesco':'MADRE','es_cabeza_hogar':True,'nivel_educativo':'Técnico','situacion_laboral':'INDEPENDIENTE','ingresos_mensuales':Decimal('1100000'),'fuente_ingresos':'Venta de comidas','pertenece_sisben':True,'grupo_sisben':'B','puntaje_sisben':Decimal('25.0')},
            {'tipo_documento':'TARJETA_IDENTIDAD','numero_documento':'1061860001','primer_nombre':'Camila','segundo_nombre':'Andrea','primer_apellido':'Solarte','segundo_apellido':'Erazo','fecha_nacimiento':date(2010,3,20),'parentesco':'HIJA','es_cabeza_hogar':False,'nivel_educativo':'Secundaria incompleta','situacion_laboral':'','pertenece_sisben':True,'grupo_sisben':'B','puntaje_sisben':Decimal('25.0')},
        ],
    },
    {
        'radicado': 'RAD-REC-202604-0007',
        'titular': {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76307001','primer_nombre':'Jairo','segundo_nombre':'Enrique','primer_apellido':'Collazos','segundo_apellido':'Bravo','fecha_nacimiento':date(1960,2,28),'sexo':'MASCULINO','nacionalidad':'Colombiana','telefono':'3141234007','correo_electronico':'jairo.collazos@correo.com','departamento_nacimiento':'Cauca','municipio_nacimiento':'Popayán'},
        'predio': {'departamento':'Cauca','municipio':'Popayán','zona':'URBANA','tipo_predio':'Casa','comuna':'Comuna 1','barrio_vereda':'Barrio Centro','direccion':'Cra 5 # 6-42','estrato':'2','es_propietario':True,'numero_predial':'19001000001001','matricula_inmobiliaria':'120-80007','avaluo_catastral':'60000000','numero_matricula_agua':'AC-REC-007','numero_contrato_energia':'CE-REC-007','tiempo_residencia':'50 años','tiene_dependientes':False,'personas_con_discapacidad_hogar':True,'acepta_terminos_condiciones':True},
        'miembros': [
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76307001','primer_nombre':'Jairo','segundo_nombre':'Enrique','primer_apellido':'Collazos','segundo_apellido':'Bravo','fecha_nacimiento':date(1960,2,28),'parentesco':'PADRE','es_cabeza_hogar':True,'nivel_educativo':'Secundaria completa','situacion_laboral':'PENSIONADO','ingresos_mensuales':Decimal('1000000'),'fuente_ingresos':'Pensión','pertenece_sisben':True,'grupo_sisben':'B','puntaje_sisben':Decimal('30.0')},
        ],
    },
    {
        'radicado': 'RAD-REC-202604-0008',
        'titular': {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76308001','primer_nombre':'Fabián','segundo_nombre':'Alexis','primer_apellido':'Rivera','segundo_apellido':'Gómez','fecha_nacimiento':date(1990,5,5),'sexo':'MASCULINO','nacionalidad':'Colombiana','telefono':'3001234008','correo_electronico':'fabian.rivera@correo.com','departamento_nacimiento':'Cauca','municipio_nacimiento':'Popayán'},
        'predio': {'departamento':'Cauca','municipio':'Popayán','zona':'URBANA','tipo_predio':'Lote','comuna':'Comuna 9','barrio_vereda':'Barrio Lomas de Granada','direccion':'Mz H Casa 14','estrato':'1','es_propietario':True,'numero_predial':'19001000009001','matricula_inmobiliaria':'120-80008','avaluo_catastral':'18000000','numero_matricula_agua':'AC-REC-008','numero_contrato_energia':'CE-REC-008','tiempo_residencia':'5 años','tiene_dependientes':True,'personas_con_discapacidad_hogar':False,'acepta_terminos_condiciones':True},
        'miembros': [
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76308001','primer_nombre':'Fabián','segundo_nombre':'Alexis','primer_apellido':'Rivera','segundo_apellido':'Gómez','fecha_nacimiento':date(1990,5,5),'parentesco':'PADRE','es_cabeza_hogar':True,'nivel_educativo':'Técnico','situacion_laboral':'EMPLEADO','ingresos_mensuales':Decimal('1400000'),'fuente_ingresos':'Vigilante','pertenece_sisben':True,'grupo_sisben':'B','puntaje_sisben':Decimal('27.0')},
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76308002','primer_nombre':'Yenny','segundo_nombre':'Paola','primer_apellido':'Gómez','segundo_apellido':'López','fecha_nacimiento':date(1993,9,18),'parentesco':'CONYUGE','es_cabeza_hogar':False,'nivel_educativo':'Secundaria completa','situacion_laboral':'INDEPENDIENTE','ingresos_mensuales':Decimal('800000'),'fuente_ingresos':'Venta ambulante','pertenece_sisben':True,'grupo_sisben':'B','puntaje_sisben':Decimal('27.0')},
            {'tipo_documento':'REGISTRO_CIVIL','numero_documento':'1061880001','primer_nombre':'Samuel','segundo_nombre':'','primer_apellido':'Rivera','segundo_apellido':'Gómez','fecha_nacimiento':date(2022,1,15),'parentesco':'HIJO','es_cabeza_hogar':False,'pertenece_sisben':True,'grupo_sisben':'B','puntaje_sisben':Decimal('27.0')},
        ],
    },
    {
        'radicado': 'RAD-REC-202604-0009',
        'titular': {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76309001','primer_nombre':'Esperanza','segundo_nombre':'','primer_apellido':'Navia','segundo_apellido':'Cárdenas','fecha_nacimiento':date(1972,12,22),'sexo':'FEMENINO','nacionalidad':'Colombiana','telefono':'3221234009','correo_electronico':'esperanza.navia@correo.com','departamento_nacimiento':'Cauca','municipio_nacimiento':'Popayán'},
        'predio': {'departamento':'Cauca','municipio':'Popayán','zona':'RURAL','tipo_predio':'Casa','comuna':'','barrio_vereda':'Vereda Calibío','direccion':'Finca La Esperanza, Calibío','estrato':'1','es_propietario':True,'numero_predial':'19001000095001','matricula_inmobiliaria':'120-80009','avaluo_catastral':'20000000','numero_matricula_agua':'AC-REC-009','numero_contrato_energia':'CE-REC-009','tiempo_residencia':'35 años','tiene_dependientes':True,'personas_con_discapacidad_hogar':False,'acepta_terminos_condiciones':True},
        'miembros': [
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76309001','primer_nombre':'Esperanza','segundo_nombre':'','primer_apellido':'Navia','segundo_apellido':'Cárdenas','fecha_nacimiento':date(1972,12,22),'parentesco':'MADRE','es_cabeza_hogar':True,'nivel_educativo':'Primaria incompleta','situacion_laboral':'INDEPENDIENTE','ingresos_mensuales':Decimal('600000'),'fuente_ingresos':'Cultivo de café','pertenece_sisben':True,'grupo_sisben':'A','puntaje_sisben':Decimal('10.5')},
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76309002','primer_nombre':'Óscar','segundo_nombre':'Mauricio','primer_apellido':'Navia','segundo_apellido':'Cárdenas','fecha_nacimiento':date(1995,7,8),'parentesco':'HIJO','es_cabeza_hogar':False,'nivel_educativo':'Secundaria completa','situacion_laboral':'INDEPENDIENTE','ingresos_mensuales':Decimal('700000'),'fuente_ingresos':'Jornalero','pertenece_sisben':True,'grupo_sisben':'A','puntaje_sisben':Decimal('10.5')},
        ],
    },
    {
        'radicado': 'RAD-REC-202604-0010',
        'titular': {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76310001','primer_nombre':'William','segundo_nombre':'Alberto','primer_apellido':'Zúñiga','segundo_apellido':'Paz','fecha_nacimiento':date(1985,4,3),'sexo':'MASCULINO','nacionalidad':'Colombiana','telefono':'3051234010','correo_electronico':'william.zuniga@correo.com','departamento_nacimiento':'Cauca','municipio_nacimiento':'Popayán'},
        'predio': {'departamento':'Cauca','municipio':'Popayán','zona':'URBANA','tipo_predio':'Casa','comuna':'Comuna 8','barrio_vereda':'Barrio Los Comuneros','direccion':'Cra 25 # 40-12','estrato':'1','es_propietario':True,'numero_predial':'19001000008001','matricula_inmobiliaria':'120-80010','avaluo_catastral':'30000000','numero_matricula_agua':'AC-REC-010','numero_contrato_energia':'CE-REC-010','tiempo_residencia':'10 años','tiene_dependientes':True,'personas_con_discapacidad_hogar':False,'acepta_terminos_condiciones':True},
        'miembros': [
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76310001','primer_nombre':'William','segundo_nombre':'Alberto','primer_apellido':'Zúñiga','segundo_apellido':'Paz','fecha_nacimiento':date(1985,4,3),'parentesco':'PADRE','es_cabeza_hogar':True,'nivel_educativo':'Secundaria completa','situacion_laboral':'EMPLEADO','ingresos_mensuales':Decimal('1500000'),'fuente_ingresos':'Construcción','pertenece_sisben':True,'grupo_sisben':'B','puntaje_sisben':Decimal('29.0')},
            {'tipo_documento':'CEDULA_CIUDADANIA','numero_documento':'76310002','primer_nombre':'Diana','segundo_nombre':'Marcela','primer_apellido':'Paz','segundo_apellido':'Torres','fecha_nacimiento':date(1987,11,14),'parentesco':'CONYUGE','es_cabeza_hogar':False,'nivel_educativo':'Técnico','situacion_laboral':'EMPLEADO','ingresos_mensuales':Decimal('1200000'),'fuente_ingresos':'Auxiliar contable','pertenece_sisben':True,'grupo_sisben':'B','puntaje_sisben':Decimal('29.0')},
            {'tipo_documento':'TARJETA_IDENTIDAD','numero_documento':'1061800001','primer_nombre':'Valentina','segundo_nombre':'','primer_apellido':'Zúñiga','segundo_apellido':'Paz','fecha_nacimiento':date(2011,6,30),'parentesco':'HIJA','es_cabeza_hogar':False,'nivel_educativo':'Secundaria incompleta','situacion_laboral':'','pertenece_sisben':True,'grupo_sisben':'B','puntaje_sisben':Decimal('29.0')},
        ],
    },
]

creadas = 0
for i, datos in enumerate(FAMILIAS, 1):
    tit = datos['titular']
    ciudadano, _ = Ciudadano.objects.get_or_create(
        tipo_documento=tit['tipo_documento'],
        numero_documento=tit['numero_documento'],
        defaults={k: v for k, v in tit.items() if k not in ('tipo_documento', 'numero_documento')},
    )
    postulacion = Postulacion.objects.create(
        programa=programa, etapa_actual=etapa1, estado='REGISTRADA',
    )
    gestion = GestionHogarEtapa1.objects.create(
        postulacion=postulacion, etapa=etapa1, ciudadano=ciudadano,
        numero_radicado=datos['radicado'], **datos['predio'],
    )
    for m in datos['miembros']:
        MiembroHogar.objects.create(postulacion=gestion, **m)
    creadas += 1
    apellido = tit['primer_apellido']
    print(f"  [{i:02d}] {apellido} - {datos['radicado']} - {len(datos['miembros'])} miembros")

print(f"\nTotal creadas: {creadas} postulaciones en estado REGISTRADA")
