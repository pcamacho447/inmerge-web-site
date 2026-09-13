# Anexo técnico de auditoría: estructura del gasto de la Lima municipal distrital (2018-2025)

## La ficha de los 50 municipios, sus rankings, sus banderas y sus tipologías

*Pieza complementaria del informe **En qué gasta la Lima municipal**. Registro técnico, orientado a análisis y auditoría. Fuente: SIAF-SP del MEF, devengado y recaudación nominales 2018-2025, elaboración propia. Universo: 50 municipios (48 distritales más 2 provinciales). Los rankings, percentiles y el clustering excluyen a las 2 provinciales (Lima Metropolitana y Callao provincial) por no ser comparables con un distrito; se listan aparte al final de cada sección.*

### Cómo se construyó

Todas las cifras salen del panel `gold_panel_gasto_estructura_distrital` (gasto) y del `gold_panel_fiscal_distrital_lima` (ingreso), más consultas directas al detalle fino del fact (`fact_gasto_devengado`, `fact_ingresos`) para las banderas de auditoría. Definiciones clave:

- **Planilla real** = Personal (genérica 2.1) más CAS registrado en Bienes y Servicios. Corrige la subestimación del Personal por tercerización vía CAS antes de su reclasificación de 2024.
- **Autonomía fiscal** = ingreso propio (impuestos municipales más recursos directamente recaudados) sobre el recaudado sin crédito.
- **HHI de específica** = índice de Herfindahl sobre los shares de específica de gasto; mide qué tan concentrado está el gasto en pocas líneas (1 = todo en una).
- **Gasto sin producto** = devengado codificado con `PRODUCTO_PROYECTO = 3999999` (catch-all de gasto recurrente no proyectizado).
- **Tasa de reversión** = valor absoluto del devengado negativo sobre el devengado positivo (reversiones SIAF; normales hasta pocos puntos porcentuales).

---

## Sección A — Ficha de gasto de cada municipio

Composición de gasto de los 48 distritos comparables, promedio 2018-2025, ordenados por zona. `pc` = gasto por habitante y año (nominal). Los shares funcionales (serenazgo, limpieza, admin) son sobre el devengado total del municipio.

| Distrito | Zona | Func. dominante | Gen. dominante | pc | %corr | %cap | %planilla | %seren | %limp | %admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Bellavista | Callao | Planeamiento y gestion | Bienes y Servicios | S/ 701 | 89.1% | 10.9% | 31.0% | 11.5% | 26.7% | 34.3% |
| Carmen De La Legua Reynoso | Callao | Planeamiento y gestion | Bienes y Servicios | S/ 874 | 90.7% | 9.3% | 22.0% | 11.3% | 23.3% | 34.7% |
| La Perla | Callao | Planeamiento y gestion | Bienes y Servicios | S/ 618 | 88.5% | 11.5% | 38.4% | 13.6% | 27.8% | 29.9% |
| La Punta | Callao | Planeamiento y gestion | Bienes y Servicios | S/ 7,612 | 89.6% | 9.4% | 33.6% | 14.1% | 14.2% | 36.9% |
| Mi Peru | Callao | Planeamiento y gestion | Bienes y Servicios | S/ 714 | 76.5% | 22.8% | 26.2% | 14.7% | 18.4% | 29.0% |
| Ventanilla | Callao | Planeamiento y gestion | Bienes y Servicios | S/ 517 | 73.4% | 23.3% | 24.8% | 10.6% | 13.9% | 34.8% |
| Barranco | Lima Centro | Planeamiento y gestion | Bienes y Servicios | S/ 1,083 | 87.4% | 12.6% | 36.8% | 15.6% | 22.4% | 30.9% |
| Brena | Lima Centro | Planeamiento y gestion | Bienes y Servicios | S/ 372 | 87.9% | 12.1% | 28.9% | 7.8% | 25.9% | 33.7% |
| Jesus Maria | Lima Centro | Planeamiento y gestion | Bienes y Servicios | S/ 1,112 | 91.3% | 8.2% | 34.4% | 19.0% | 21.6% | 34.3% |
| La Victoria | Lima Centro | Planeamiento y gestion | Bienes y Servicios | S/ 698 | 92.1% | 7.9% | 23.4% | 15.4% | 26.9% | 28.3% |
| Lince | Lima Centro | Planeamiento y gestion | Bienes y Servicios | S/ 824 | 87.3% | 12.4% | 48.1% | 19.2% | 19.6% | 33.3% |
| Magdalena Del Mar | Lima Centro | Planeamiento y gestion | Bienes y Servicios | S/ 916 | 84.5% | 15.5% | 22.8% | 14.8% | 22.2% | 35.6% |
| Miraflores | Lima Centro | Planeamiento y gestion | Bienes y Servicios | S/ 2,206 | 85.0% | 15.0% | 36.8% | 15.7% | 23.4% | 28.6% |
| Pueblo Libre | Lima Centro | Planeamiento y gestion | Bienes y Servicios | S/ 534 | 91.0% | 9.0% | 39.8% | 17.4% | 25.6% | 36.3% |
| Rimac | Lima Centro | Ambiente (limpieza) | Bienes y Servicios | S/ 265 | 87.2% | 12.7% | 24.0% | 8.7% | 29.9% | 26.6% |
| San Borja | Lima Centro | Planeamiento y gestion | Bienes y Servicios | S/ 993 | 91.6% | 8.4% | 39.4% | 21.4% | 26.5% | 26.9% |
| San Isidro | Lima Centro | Planeamiento y gestion | Bienes y Servicios | S/ 3,478 | 83.2% | 16.8% | 36.7% | 17.0% | 18.4% | 31.6% |
| San Miguel | Lima Centro | Ambiente (limpieza) | Bienes y Servicios | S/ 524 | 90.4% | 9.1% | 39.8% | 15.4% | 31.9% | 27.8% |
| Santiago De Surco | Lima Centro | Ambiente (limpieza) | Bienes y Servicios | S/ 730 | 92.6% | 7.4% | 40.6% | 18.3% | 35.4% | 25.7% |
| Surquillo | Lima Centro | Ambiente (limpieza) | Bienes y Servicios | S/ 534 | 90.9% | 8.9% | 49.2% | 18.9% | 29.6% | 24.1% |
| Ate | Lima Este | Ambiente (limpieza) | Bienes y Servicios | S/ 350 | 76.4% | 22.3% | 28.1% | 10.6% | 29.0% | 20.1% |
| Chaclacayo | Lima Este | Ambiente (limpieza) | Bienes y Servicios | S/ 476 | 85.8% | 14.2% | 36.6% | 8.7% | 27.2% | 27.0% |
| Cieneguilla | Lima Este | Planeamiento y gestion | Bienes y Servicios | S/ 803 | 62.2% | 37.9% | 10.3% | 11.8% | 16.5% | 22.9% |
| El Agustino | Lima Este | Ambiente (limpieza) | Bienes y Servicios | S/ 266 | 79.4% | 20.6% | 16.1% | 12.3% | 26.6% | 22.1% |
| La Molina | Lima Este | Ambiente (limpieza) | Bienes y Servicios | S/ 858 | 86.8% | 12.4% | 34.8% | 12.3% | 35.8% | 28.8% |
| Lurigancho | Lima Este | Planeamiento y gestion | Bienes y Servicios | S/ 382 | 72.0% | 27.7% | 25.4% | 17.8% | 18.0% | 26.2% |
| San Juan De Lurigancho | Lima Este | Ambiente (limpieza) | Bienes y Servicios | S/ 204 | 86.7% | 13.3% | 18.4% | 13.3% | 34.4% | 21.4% |
| San Luis | Lima Este | Planeamiento y gestion | Bienes y Servicios | S/ 497 | 93.6% | 6.4% | 33.6% | 9.7% | 30.7% | 41.1% |
| Santa Anita | Lima Este | Ambiente (limpieza) | Bienes y Servicios | S/ 330 | 81.5% | 18.5% | 22.5% | 13.2% | 33.1% | 19.2% |
| Ancon | Lima Norte | Planeamiento y gestion | Bienes y Servicios | S/ 322 | 68.0% | 32.0% | 25.1% | 9.3% | 19.1% | 27.9% |
| Carabayllo | Lima Norte | Planeamiento y gestion | Bienes y Servicios | S/ 258 | 74.9% | 25.1% | 22.9% | 11.2% | 25.7% | 26.6% |
| Comas | Lima Norte | Ambiente (limpieza) | Bienes y Servicios | S/ 225 | 84.2% | 15.8% | 24.7% | 11.7% | 28.2% | 22.1% |
| Independencia | Lima Norte | Planeamiento y gestion | Bienes y Servicios | S/ 324 | 88.2% | 11.8% | 31.7% | 14.5% | 24.3% | 31.2% |
| Los Olivos | Lima Norte | Ambiente (limpieza) | Bienes y Servicios | S/ 275 | 87.1% | 12.9% | 34.6% | 11.1% | 36.7% | 22.5% |
| Puente Piedra | Lima Norte | Ambiente (limpieza) | Bienes y Servicios | S/ 329 | 69.5% | 30.5% | 23.6% | 14.7% | 25.5% | 16.7% |
| San Martin De Porres | Lima Norte | Ambiente (limpieza) | Bienes y Servicios | S/ 214 | 80.2% | 19.8% | 24.5% | 10.5% | 35.0% | 17.2% |
| Santa Rosa | Lima Norte | Planeamiento y gestion | Bienes y Servicios | S/ 354 | 57.3% | 42.7% | 21.5% | 11.1% | 17.0% | 29.8% |
| Chorrillos | Lima Sur | Planeamiento y gestion | Bienes y Servicios | S/ 334 | 83.2% | 15.9% | 18.3% | 10.9% | 24.8% | 33.4% |
| Lurin | Lima Sur | Planeamiento y gestion | Bienes y Servicios | S/ 796 | 84.9% | 13.4% | 20.4% | 20.7% | 18.6% | 28.1% |
| Pachacamac | Lima Sur | Planeamiento y gestion | Bienes y Servicios | S/ 419 | 83.5% | 16.5% | 25.1% | 9.6% | 17.8% | 35.9% |
| Pucusana | Lima Sur | Planeamiento y gestion | Bienes y Servicios | S/ 954 | 79.1% | 19.3% | 19.1% | 10.6% | 20.6% | 31.8% |
| Punta Hermosa | Lima Sur | Planeamiento y gestion | Bienes y Servicios | S/ 1,009 | 75.2% | 24.8% | 25.9% | 16.1% | 17.5% | 31.8% |
| Punta Negra | Lima Sur | Planeamiento y gestion | Bienes y Servicios | S/ 1,355 | 84.8% | 14.1% | 24.1% | 11.5% | 24.1% | 39.0% |
| San Bartolo | Lima Sur | Planeamiento y gestion | Bienes y Servicios | S/ 1,121 | 84.8% | 15.2% | 47.5% | 16.2% | 25.2% | 36.8% |
| San Juan De Miraflores | Lima Sur | Ambiente (limpieza) | Bienes y Servicios | S/ 239 | 82.6% | 17.1% | 24.4% | 8.6% | 30.1% | 25.7% |
| Santa Maria Del Mar | Lima Sur | Planeamiento y gestion | Bienes y Servicios | S/ 6,713 | 91.2% | 8.8% | 33.3% | 12.7% | 24.1% | 50.4% |
| Villa El Salvador | Lima Sur | Vivienda y desarrollo urbano | Activos / capital | S/ 292 | 60.7% | 39.3% | 16.8% | 12.4% | 19.4% | 15.7% |
| Villa Maria Del Triunfo | Lima Sur | Ambiente (limpieza) | Bienes y Servicios | S/ 244 | 66.3% | 33.7% | 19.5% | 11.2% | 23.2% | 20.6% |

**Municipalidades provinciales (referencia, no comparables):**

| Distrito | Zona | Func. dominante | Gen. dominante | pc | %corr | %cap | %planilla | %seren | %limp | %admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Callao | Callao | Ambiente (limpieza) | Bienes y Servicios | S/ 732 | 83.5% | 16.5% | 18.3% | 5.2% | 30.1% | 27.7% |
| Lima | Lima Centro | Transporte | Activos / capital | S/ 6,912 | 47.8% | 40.9% | 14.7% | 5.9% | 7.8% | 22.7% |

### La línea concreta donde más gasta cada municipio

Específica de gasto #1 de cada distrito (mayor devengado acumulado 2018-2025) y su peso sobre el gasto positivo del municipio.

| Distrito | Zona | Específica #1 de gasto | % del gasto |
|---|---|---|---|
| Bellavista | Callao | Aseo, Limpieza Y Tocador | 48.8% |
| Carmen De La Legua Reynoso | Callao | Electricidad, Iluminacion Y Electronica | 54.6% |
| La Perla | Callao | Maquinas Y Equipos | 51.2% |
| La Punta | Callao | Contrato Administrativo De Servicios | 53.0% |
| Mi Peru | Callao | Elaboracion De Expedientes Tecnicos | 53.8% |
| Ventanilla | Callao | Combustibles Y Carburantes | 47.7% |
| Barranco | Lima Centro | Gratificaciones | 56.1% |
| Brena | Lima Centro | Alimentos Y Bebidas Para Consumo Humano | 63.1% |
| Jesus Maria | Lima Centro | De Edificaciones, Oficinas Y Estructuras | 57.2% |
| La Victoria | Lima Centro | Aseo, Limpieza Y Tocador | 68.8% |
| Lince | Lima Centro | Contrato Administrativo De Servicios | 61.3% |
| Magdalena Del Mar | Lima Centro | Combustibles Y Carburantes | 49.8% |
| Miraflores | Lima Centro | Elaboracion De Expedientes Tecnicos | 57.6% |
| Pueblo Libre | Lima Centro | Consultorias | 57.0% |
| Rimac | Lima Centro | De Mobiliario Y Similares | 64.4% |
| San Borja | Lima Centro | Cargos Bancarios | 61.6% |
| San Isidro | Lima Centro | Locacion De Servicios Realizados Por Persona Natural | 58.9% |
| San Miguel | Lima Centro | Para Transporte Terrestre | 50.4% |
| Santiago De Surco | Lima Centro | Consultorias | 48.6% |
| Surquillo | Lima Centro | Servicio De Suministro De Energia Electrica | 63.9% |
| Ate | Lima Este | De Vehiculos | 52.0% |
| Chaclacayo | Lima Este | Locación De Servicios Realizados Por Personas Naturales Relacionadas Al Rol De La Entidad | 62.9% |
| Cieneguilla | Lima Este | Elaboracion De Expedientes Tecnicos | 39.5% |
| El Agustino | Lima Este | Servicio De Publicidad | 50.5% |
| La Molina | Lima Este | Alimentos Y Bebidas Para Consumo Humano | 44.3% |
| Lurigancho | Lima Este | Contrato Administrativo De Servicios | 47.0% |
| San Juan De Lurigancho | Lima Este | Gratificaciones | 55.2% |
| San Luis | Lima Este | Repuestos Y Accesorios | 66.5% |
| Santa Anita | Lima Este | Contrato Administrativo De Servicios | 45.2% |
| Ancon | Lima Norte | Vestuario, Accesorios Y Prendas Diversas | 45.9% |
| Carabayllo | Lima Norte | Obreros Permanentes | 45.4% |
| Comas | Lima Norte | Equipos Computacionales Y Perifericos | 62.2% |
| Independencia | Lima Norte | Para Edificios Y Estructuras | 60.4% |
| Los Olivos | Lima Norte | Alimentos Y Bebidas Para Consumo Humano | 59.0% |
| Puente Piedra | Lima Norte | Alimentos Y Bebidas Para Consumo Humano | 47.9% |
| San Martin De Porres | Lima Norte | Repuestos Y Accesorios | 60.0% |
| Santa Rosa | Lima Norte | Locación De Servicios Realizados Por Personas Naturales Relacionadas Al Rol De La Entidad | 37.5% |
| Chorrillos | Lima Sur | Alimentos Y Bebidas Para Consumo Humano | 59.9% |
| Lurin | Lima Sur | Alimentos Y Bebidas Para Consumo Humano | 50.4% |
| Pachacamac | Lima Sur | Combustibles Y Carburantes | 57.4% |
| Pucusana | Lima Sur | Elaboracion De Expedientes Tecnicos | 56.8% |
| Punta Hermosa | Lima Sur | Alimentos Y Bebidas Para Consumo Humano | 46.7% |
| Punta Negra | Lima Sur | De Maquinarias Y Equipos | 53.2% |
| San Bartolo | Lima Sur | Locación De Servicios Realizados Por Personas Naturales Relacionadas Al Rol De La Entidad | 59.7% |
| San Juan De Miraflores | Lima Sur | Repuestos Y Accesorios | 57.7% |
| Santa Maria Del Mar | Lima Sur | Alimentos Y Bebidas Para Consumo Humano | 52.6% |
| Villa El Salvador | Lima Sur | Estudio De Preinversion | 48.0% |
| Villa Maria Del Triunfo | Lima Sur | Elaboracion De Expedientes Tecnicos | 54.4% |

---

## Sección B — Ficha de ingreso de cada municipio

De dónde sale el dinero de cada distrito, promedio 2018-2025. `Recaudado pc` nominal. `Autonomía` = ingreso propio sobre recaudado sin crédito. `Rubro #1` = mayor fuente recaudada.

| Distrito | Zona | Recaudado pc | %propio | %impuestos | %FONCOMÚN | %canon | Autonomía | Rubro #1 |
|---|---|---|---|---|---|---|---|---|
| Bellavista | Callao | S/ 718 | 40.3% | 18.1% | 4.9% | 50.5% | 40.3% | Canon |
| Carmen De La Legua Reynoso | Callao | S/ 910 | 30.3% | 15.7% | 6.0% | 59.2% | 30.3% | Canon |
| La Perla | Callao | S/ 680 | 27.5% | 12.0% | 5.9% | 62.2% | 27.5% | Canon |
| La Punta | Callao | S/ 8,642 | 17.1% | 3.6% | 6.5% | 73.5% | 17.1% | Canon |
| Mi Peru | Callao | S/ 770 | 5.0% | 1.8% | 20.2% | 69.9% | 5.0% | Canon |
| Ventanilla | Callao | S/ 515 | 18.9% | 9.2% | 30.1% | 43.5% | 18.9% | Canon |
| Barranco | Lima Centro | S/ 1,227 | 83.7% | 40.2% | 7.5% | 8.7% | 83.7% | Rec. dir. recaudados |
| Brena | Lima Centro | S/ 383 | 87.9% | 50.1% | 9.6% | 2.0% | 87.9% | Impuestos munic. |
| Jesus Maria | Lima Centro | S/ 1,126 | 89.1% | 38.2% | 3.1% | 7.2% | 89.1% | Rec. dir. recaudados |
| La Victoria | Lima Centro | S/ 687 | 88.3% | 38.9% | 9.6% | 1.1% | 88.3% | Rec. dir. recaudados |
| Lince | Lima Centro | S/ 978 | 92.5% | 47.4% | 5.6% | 1.8% | 92.5% | Impuestos munic. |
| Magdalena Del Mar | Lima Centro | S/ 953 | 92.5% | 48.9% | 5.0% | 2.3% | 92.5% | Impuestos munic. |
| Miraflores | Lima Centro | S/ 2,707 | 97.7% | 57.4% | 1.5% | 0.5% | 97.7% | Impuestos munic. |
| Pueblo Libre | Lima Centro | S/ 573 | 90.7% | 40.6% | 6.7% | 2.4% | 90.7% | Rec. dir. recaudados |
| Rimac | Lima Centro | S/ 229 | 67.5% | 27.1% | 28.7% | 2.7% | 67.5% | Rec. dir. recaudados |
| San Borja | Lima Centro | S/ 1,133 | 94.4% | 45.1% | 2.5% | 2.8% | 94.4% | Rec. dir. recaudados |
| San Isidro | Lima Centro | S/ 4,298 | 97.4% | 54.8% | 1.6% | 0.7% | 97.4% | Impuestos munic. |
| San Miguel | Lima Centro | S/ 577 | 93.3% | 41.6% | 5.6% | 0.9% | 93.3% | Rec. dir. recaudados |
| Santiago De Surco | Lima Centro | S/ 857 | 94.4% | 51.8% | 4.5% | 0.9% | 94.4% | Impuestos munic. |
| Surquillo | Lima Centro | S/ 590 | 91.1% | 46.6% | 6.9% | 1.8% | 91.1% | Impuestos munic. |
| Ate | Lima Este | S/ 344 | 62.2% | 34.9% | 32.7% | 4.7% | 62.2% | Impuestos munic. |
| Chaclacayo | Lima Este | S/ 440 | 72.8% | 50.1% | 24.1% | 2.3% | 72.8% | Impuestos munic. |
| Cieneguilla | Lima Este | S/ 840 | 44.2% | 30.5% | 48.5% | 6.2% | 44.2% | FONCOMÚN |
| El Agustino | Lima Este | S/ 213 | 68.5% | 38.8% | 21.3% | 9.6% | 68.5% | Impuestos munic. |
| La Molina | Lima Este | S/ 937 | 93.8% | 50.3% | 5.2% | 0.9% | 93.8% | Impuestos munic. |
| Lurigancho | Lima Este | S/ 346 | 48.3% | 33.6% | 41.9% | 8.1% | 48.3% | FONCOMÚN |
| San Juan De Lurigancho | Lima Este | S/ 205 | 45.9% | 25.8% | 46.5% | 7.4% | 45.9% | FONCOMÚN |
| San Luis | Lima Este | S/ 524 | 83.0% | 45.7% | 14.5% | 2.2% | 83.0% | Impuestos munic. |
| Santa Anita | Lima Este | S/ 360 | 81.6% | 39.5% | 15.4% | 2.6% | 81.6% | Rec. dir. recaudados |
| Ancon | Lima Norte | S/ 272 | 40.6% | 17.3% | 48.4% | 10.0% | 40.6% | FONCOMÚN |
| Carabayllo | Lima Norte | S/ 226 | 38.7% | 25.3% | 49.9% | 10.7% | 38.7% | FONCOMÚN |
| Comas | Lima Norte | S/ 184 | 59.3% | 32.0% | 31.1% | 9.1% | 59.3% | Impuestos munic. |
| Independencia | Lima Norte | S/ 301 | 70.6% | 44.2% | 22.9% | 5.7% | 70.6% | Impuestos munic. |
| Los Olivos | Lima Norte | S/ 273 | 82.2% | 38.3% | 15.2% | 2.2% | 82.2% | Rec. dir. recaudados |
| Puente Piedra | Lima Norte | S/ 344 | 32.7% | 20.6% | 56.0% | 10.8% | 32.7% | FONCOMÚN |
| San Martin De Porres | Lima Norte | S/ 194 | 69.2% | 35.1% | 25.0% | 4.2% | 69.2% | Impuestos munic. |
| Santa Rosa | Lima Norte | S/ 283 | 36.2% | 19.9% | 52.9% | 6.9% | 36.2% | FONCOMÚN |
| Chorrillos | Lima Sur | S/ 379 | 71.0% | 34.4% | 25.8% | 2.8% | 71.0% | Rec. dir. recaudados |
| Lurin | Lima Sur | S/ 800 | 74.5% | 55.2% | 21.3% | 4.0% | 74.5% | Impuestos munic. |
| Pachacamac | Lima Sur | S/ 439 | 29.7% | 18.8% | 60.3% | 9.6% | 29.7% | FONCOMÚN |
| Pucusana | Lima Sur | S/ 1,010 | 56.1% | 44.2% | 38.5% | 4.8% | 56.1% | Impuestos munic. |
| Punta Hermosa | Lima Sur | S/ 1,248 | 56.3% | 41.7% | 25.5% | 17.0% | 56.3% | Impuestos munic. |
| Punta Negra | Lima Sur | S/ 1,573 | 47.2% | 34.0% | 46.9% | 5.1% | 47.2% | FONCOMÚN |
| San Bartolo | Lima Sur | S/ 1,219 | 55.1% | 28.7% | 38.5% | 6.1% | 55.1% | FONCOMÚN |
| San Juan De Miraflores | Lima Sur | S/ 214 | 66.2% | 32.2% | 28.5% | 4.5% | 66.2% | Rec. dir. recaudados |
| Santa Maria Del Mar | Lima Sur | S/ 7,248 | 72.5% | 32.6% | 25.6% | 1.5% | 72.5% | Rec. dir. recaudados |
| Villa El Salvador | Lima Sur | S/ 319 | 54.8% | 27.9% | 33.4% | 9.0% | 54.8% | FONCOMÚN |
| Villa Maria Del Triunfo | Lima Sur | S/ 253 | 32.0% | 14.9% | 54.2% | 13.5% | 32.0% | FONCOMÚN |

---

## Sección C — Rankings

![Distritos con mayor gasto per cápita, serenazgo y obras (2018-2025)](../../../figuras/eda/estr_fig11_rankings_inmerge.png)

### Gasto per cápita

| # | Top (más) | valor | Bottom (menos) | valor |
|---|---|---|---|---|
| 1 | La Punta | S/ 7,612 | San Juan De Lurigancho | S/ 204 |
| 2 | Santa Maria Del Mar | S/ 6,713 | San Martin De Porres | S/ 214 |
| 3 | San Isidro | S/ 3,478 | Comas | S/ 225 |
| 4 | Miraflores | S/ 2,206 | San Juan De Miraflores | S/ 239 |
| 5 | Punta Negra | S/ 1,355 | Villa Maria Del Triunfo | S/ 244 |
| 6 | San Bartolo | S/ 1,121 | Carabayllo | S/ 258 |
| 7 | Jesus Maria | S/ 1,112 | Rimac | S/ 265 |
| 8 | Barranco | S/ 1,083 | El Agustino | S/ 266 |

### % del gasto en serenazgo

| # | Top (más) | valor | Bottom (menos) | valor |
|---|---|---|---|---|
| 1 | San Borja | 21.4% | Brena | 7.8% |
| 2 | Lurin | 20.7% | San Juan De Miraflores | 8.6% |
| 3 | Lince | 19.2% | Chaclacayo | 8.7% |
| 4 | Jesus Maria | 19.0% | Rimac | 8.7% |
| 5 | Surquillo | 18.9% | Ancon | 9.3% |
| 6 | Santiago De Surco | 18.3% | Pachacamac | 9.6% |
| 7 | Lurigancho | 17.8% | San Luis | 9.7% |
| 8 | Pueblo Libre | 17.4% | San Martin De Porres | 10.5% |

### % del gasto en limpieza (ambiente)

| # | Top (más) | valor | Bottom (menos) | valor |
|---|---|---|---|---|
| 1 | Los Olivos | 36.7% | Ventanilla | 13.9% |
| 2 | La Molina | 35.8% | La Punta | 14.2% |
| 3 | Santiago De Surco | 35.4% | Cieneguilla | 16.5% |
| 4 | San Martin De Porres | 35.0% | Santa Rosa | 17.0% |
| 5 | San Juan De Lurigancho | 34.4% | Punta Hermosa | 17.5% |
| 6 | Santa Anita | 33.1% | Pachacamac | 17.8% |
| 7 | San Miguel | 31.9% | Lurigancho | 18.0% |
| 8 | San Luis | 30.7% | San Isidro | 18.4% |

### % del gasto en obras

| # | Top (más) | valor | Bottom (menos) | valor |
|---|---|---|---|---|
| 1 | Santa Rosa | 36.1% | Santa Maria Del Mar | 4.5% |
| 2 | Villa El Salvador | 33.2% | Pueblo Libre | 4.5% |
| 3 | Cieneguilla | 31.6% | San Luis | 4.6% |
| 4 | Puente Piedra | 26.4% | San Miguel | 4.7% |
| 5 | Ancon | 25.8% | San Borja | 4.8% |
| 6 | Villa Maria Del Triunfo | 25.2% | La Punta | 5.0% |
| 7 | Lurigancho | 23.3% | Santiago De Surco | 5.0% |
| 8 | Carabayllo | 21.4% | Jesus Maria | 5.3% |

### % del gasto en planilla real

| # | Top (más) | valor | Bottom (menos) | valor |
|---|---|---|---|---|
| 1 | Surquillo | 49.2% | Cieneguilla | 10.3% |
| 2 | Lince | 48.1% | El Agustino | 16.1% |
| 3 | San Bartolo | 47.5% | Villa El Salvador | 16.8% |
| 4 | Santiago De Surco | 40.6% | Chorrillos | 18.3% |
| 5 | Pueblo Libre | 39.8% | San Juan De Lurigancho | 18.4% |
| 6 | San Miguel | 39.8% | Pucusana | 19.1% |
| 7 | San Borja | 39.4% | Villa Maria Del Triunfo | 19.5% |
| 8 | La Perla | 38.4% | Lurin | 20.4% |

### Autonomía fiscal

| # | Top (más) | valor | Bottom (menos) | valor |
|---|---|---|---|---|
| 1 | Miraflores | 97.7% | Mi Peru | 5.0% |
| 2 | San Isidro | 97.4% | La Punta | 17.1% |
| 3 | San Borja | 94.4% | Ventanilla | 18.9% |
| 4 | Santiago De Surco | 94.4% | La Perla | 27.5% |
| 5 | La Molina | 93.8% | Pachacamac | 29.7% |
| 6 | San Miguel | 93.3% | Carmen De La Legua Reynoso | 30.3% |
| 7 | Magdalena Del Mar | 92.5% | Villa Maria Del Triunfo | 32.0% |
| 8 | Lince | 92.5% | Puente Piedra | 32.7% |

---

## Sección D — Cacería forense: banderas de auditoría

Un hallazgo sistémico enmarca esta sección: **cerca del 55% de todo el gasto municipal se codifica como 'sin producto' (recurrente no proyectizado)**. Es la norma, no una anomalía por sí sola, pero es el principal límite de trazabilidad del gasto local. Sobre esa base, se marcan los municipios que se despegan de la distribución en tres dimensiones: gasto sin producto, reversiones y concentración (HHI).

![Gasto sin producto vs concentración del gasto (HHI) por distrito (2018-2025)](../../../figuras/eda/estr_fig12_caceria_auditoria_inmerge.png)

### Municipios con banderas (outliers sobre la cola de la distribución)

| Distrito | Zona | N° banderas | Detalle |
|---|---|---|---|
| San Luis | Lima Este | 3 | gasto sin-producto 70% | reversiones 6.3% | concentracion HHI 0.47 |
| Rimac | Lima Centro | 2 | reversiones 4.4% | concentracion HHI 0.45 |
| Punta Negra | Lima Sur | 2 | gasto sin-producto 65% | reversiones 4.0% |
| Carmen De La Legua Reynoso | Callao | 1 | gasto sin-producto 62% |
| La Victoria | Lima Centro | 1 | concentracion HHI 0.50 |
| Brena | Lima Centro | 1 | concentracion HHI 0.43 |
| La Punta | Callao | 1 | gasto sin-producto 66% |
| Surquillo | Lima Centro | 1 | concentracion HHI 0.44 |
| Chaclacayo | Lima Este | 1 | reversiones 5.8% |
| Chorrillos | Lima Sur | 1 | reversiones 8.3% |
| Lurin | Lima Sur | 1 | reversiones 4.3% |
| Santa Maria Del Mar | Lima Sur | 1 | gasto sin-producto 67% |

Umbrales: gasto sin producto y HHI de específica por encima del percentil 90 de los comparables; reversiones sobre 4%; una sola obra sobre el 40% del capital. Son señales para revisar, no acusaciones: pueden reflejar particularidades legítimas (un municipio pequeño con poca actividad, un año con una obra grande).

### Tabla completa de banderas de gasto (48 comparables)

| Distrito | Zona | % sin producto | Reversión | HHI especif. | Obra #1 (% capital) |
|---|---|---|---|---|---|
| Bellavista | Callao | 58.6% | 2.0% | 0.31 | 9.4% |
| Carmen De La Legua Reynoso | Callao | 61.7% | 1.5% | 0.35 | 31.2% |
| La Perla | Callao | 61.4% | 1.0% | 0.34 | 12.8% |
| La Punta | Callao | 65.5% | 0.6% | 0.36 | 27.2% |
| Mi Peru | Callao | 55.5% | 1.7% | 0.35 | 9.3% |
| Ventanilla | Callao | 58.5% | 2.2% | 0.30 | 12.4% |
| Barranco | Lima Centro | 58.1% | 0.8% | 0.37 | 13.2% |
| Brena | Lima Centro | 57.6% | 1.8% | 0.43 | 20.4% |
| Jesus Maria | Lima Centro | 60.2% | 1.4% | 0.38 | 26.4% |
| La Victoria | Lima Centro | 61.3% | 0.7% | 0.50 | 17.4% |
| Lince | Lima Centro | 56.7% | 0.6% | 0.43 | 13.2% |
| Magdalena Del Mar | Lima Centro | 58.1% | 3.0% | 0.31 | 6.2% |
| Miraflores | Lima Centro | 53.0% | 0.1% | 0.39 | 19.3% |
| Pueblo Libre | Lima Centro | 56.1% | 1.3% | 0.38 | 16.4% |
| Rimac | Lima Centro | 51.9% | 4.4% | 0.45 | 9.6% |
| San Borja | Lima Centro | 54.3% | 0.9% | 0.42 | 12.8% |
| San Isidro | Lima Centro | 58.7% | 0.1% | 0.39 | 14.0% |
| San Miguel | Lima Centro | 57.3% | 2.2% | 0.32 | 12.1% |
| Santiago De Surco | Lima Centro | 54.5% | 0.3% | 0.32 | 21.6% |
| Surquillo | Lima Centro | 51.5% | 3.2% | 0.44 | 7.9% |
| Ate | Lima Este | 48.3% | 2.7% | 0.33 | 10.9% |
| Chaclacayo | Lima Este | 58.7% | 5.8% | 0.43 | 16.5% |
| Cieneguilla | Lima Este | 38.6% | 0.9% | 0.27 | 7.0% |
| El Agustino | Lima Este | 46.3% | 2.5% | 0.33 | 11.6% |
| La Molina | Lima Este | 53.9% | 1.9% | 0.29 | 16.4% |
| Lurigancho | Lima Este | 45.2% | 1.0% | 0.28 | 8.1% |
| San Juan De Lurigancho | Lima Este | 47.7% | 0.2% | 0.38 | 19.7% |
| San Luis | Lima Este | 70.1% | 6.3% | 0.47 | 19.3% |
| Santa Anita | Lima Este | 44.1% | 0.5% | 0.31 | 10.8% |
| Ancon | Lima Norte | 47.0% | 3.4% | 0.30 | 12.5% |
| Carabayllo | Lima Norte | 47.4% | 2.0% | 0.30 | 7.5% |
| Comas | Lima Norte | 53.2% | 3.0% | 0.42 | 8.5% |
| Independencia | Lima Norte | 58.5% | 2.2% | 0.41 | 17.2% |
| Los Olivos | Lima Norte | 54.8% | 0.6% | 0.39 | 18.1% |
| Puente Piedra | Lima Norte | 37.4% | 1.2% | 0.30 | 11.3% |
| San Martin De Porres | Lima Norte | 43.8% | 1.1% | 0.41 | 4.6% |
| Santa Rosa | Lima Norte | 33.4% | 0.8% | 0.26 | 15.3% |
| Chorrillos | Lima Sur | 57.8% | 8.3% | 0.39 | 9.2% |
| Lurin | Lima Sur | 51.1% | 4.3% | 0.32 | 11.8% |
| Pachacamac | Lima Sur | 58.4% | 3.2% | 0.38 | 6.8% |
| Pucusana | Lima Sur | 58.0% | 1.8% | 0.37 | 10.1% |
| Punta Hermosa | Lima Sur | 49.9% | 0.2% | 0.29 | 11.3% |
| Punta Negra | Lima Sur | 65.3% | 4.0% | 0.36 | 13.5% |
| San Bartolo | Lima Sur | 51.4% | 1.9% | 0.40 | 18.4% |
| San Juan De Miraflores | Lima Sur | 52.0% | 1.6% | 0.39 | 7.8% |
| Santa Maria Del Mar | Lima Sur | 67.5% | 2.9% | 0.35 | 8.0% |
| Villa El Salvador | Lima Sur | 38.4% | 0.1% | 0.29 | 11.6% |
| Villa Maria Del Triunfo | Lima Sur | 41.1% | 2.0% | 0.34 | 9.8% |

---

## Sección E — Tipologías de gasto (metodología del clustering)

Agrupamiento de los 48 distritos comparables por su estructura de gasto mediante k-means (`random_state=42`) sobre ocho shares estandarizados: capital, planilla real, bienes y servicios, serenazgo, limpieza, administración, protección social y transporte. Ninguna variable de tamaño ni per cápita entra al modelo: agrupa por **forma** del gasto, no por escala.

### Selección de k

| k | Inercia | Silhouette |
|---|---|---|
| 3 | 217.8 | 0.2231 |
| 4 | 175.3 | 0.2360 |
| 5 | 162.1 | 0.2197 |
| 6 | 148.2 | 0.2006 |

Se eligió **k = 5** por interpretabilidad (su silhouette está a menos de 0.02 del máximo). El silhouette en torno a 0.22 es modesto y honesto: las estructuras de gasto municipal forman un **continuo**, no cinco islas separadas. Las tipologías son tendencias dominantes, no compartimentos estancos.

### Perfil medio de cada tipología

| Tipología | n | pc (mediana) | Autonomía | %capital | %planilla | %seren | %limp | %admin | %prot.soc |
|---|---|---|---|---|---|---|---|---|---|
| administracion-intensiva | 15 | S/ 714 | 54.3% | 13.7% | 25.8% | 12.4% | 22.2% | 35.1% | 6.8% |
| proteccion social-intensiva | 12 | S/ 266 | 65.4% | 17.0% | 25.7% | 11.2% | 30.0% | 23.5% | 12.5% |
| planilla real-intensiva | 13 | S/ 858 | 84.7% | 11.3% | 40.2% | 16.9% | 26.4% | 30.4% | 4.5% |
| capital/inversion-intensiva | 3 | S/ 292 | 42.4% | 35.0% | 20.4% | 11.0% | 20.6% | 21.4% | 14.0% |
| capital/inversion+transporte | 5 | S/ 382 | 43.5% | 32.7% | 21.4% | 14.3% | 18.9% | 25.5% | 6.1% |

### Municipios de cada tipología

- **administracion-intensiva** (15): Bellavista, Brena, Carmen De La Legua Reynoso, Chorrillos, La Punta, La Victoria, Lurin, Magdalena Del Mar, Mi Peru, Pachacamac, Pucusana, Punta Negra, San Luis, Santa Maria Del Mar, Ventanilla
- **planilla real-intensiva** (13): Barranco, Jesus Maria, La Molina, La Perla, Lince, Miraflores, Pueblo Libre, San Bartolo, San Borja, San Isidro, San Miguel, Santiago De Surco, Surquillo
- **proteccion social-intensiva** (12): Ate, Carabayllo, Chaclacayo, Comas, El Agustino, Independencia, Los Olivos, Rimac, San Juan De Lurigancho, San Juan De Miraflores, San Martin De Porres, Santa Anita
- **capital/inversion+transporte** (5): Cieneguilla, Lurigancho, Puente Piedra, Punta Hermosa, Santa Rosa
- **capital/inversion-intensiva** (3): Ancon, Villa El Salvador, Villa Maria Del Triunfo

---

*Tablas fuente en `deliverables/tablas/eda/geografico/`: `perfil_distrital_maestro.csv`, `perfil_distrital_rankings.csv`, `perfil_distrital_distribucion.csv`, `caceria_gasto_distrital.csv`, `caceria_ingreso_distrital.csv`, `caceria_flags_resumen.csv`, `caceria_top_especifica_gasto.csv`, `caceria_top_proyecto_capital.csv`, `tipologias_perfil.csv`, `tipologias_asignacion.csv`, `tipologias_seleccion_k.csv`. Gates data-qa: Fases 1, 2 y 3 en PASS (`deliverables/reportes/qa/`).*