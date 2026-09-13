# Tres Limas fiscales: gasto e ingreso municipal de Lima Metropolitana y Callao (2018-2025)

## Radiografía distrital de los 50 gobiernos locales, por macro-sector y en detalle

**Fecha:** 2026-07-21 · **Tipo:** reporte descriptivo integrado (nota de gestión) · **Audiencia:** gerente municipal de planeamiento y presupuesto, analista de finanzas subnacionales, decisor de política fiscal territorial.
**Fuente:** data mart MEF (`fact_gasto_devengado`, `fact_ingresos`, SIAF) + `ref_poblacion_inei_2018_2026.csv` (INEI, población proyectada).
**Universo:** las 50 municipalidades distritales de Lima Metropolitana (43) y del Callao (7). Lente exclusivamente municipal (Gobierno Local).
**Periodo y montos:** 2018-2025, soles constantes de 2024 (deflactor IPC Nacional INEI).
**Nivel de confianza:** estudio descriptivo. Todas las comparaciones son transversales o de una misma unidad en el tiempo, el tipo de lectura que la naturaleza censal del SIAF sostiene sin diseño cuasi-experimental. No se afirma causalidad.

---

## Resumen ejecutivo

Lima no tiene una fiscalidad municipal, tiene tres. Vista de lejos, la Lima municipal luce sana: es fiscalmente autónoma (financia entre el 52% y el 69% de su ingreso con recursos propios) y ejecuta cada vez mejor su presupuesto (la tasa de ejecución sube de 0.78 en 2018 a 0.88 en 2025). Pero ese promedio es un espejismo estadístico: **el distrito típico gasta cerca de S/620 reales por habitante, no los S/1,077 del promedio**, que unos pocos distritos diminutos inflan. Bajo el agregado conviven un núcleo rico que vive de su propio predial, una periferia populosa que depende de la transferencia redistributiva, y un Callao que vive de la renta del puerto. Cuatro hallazgos sostienen el reporte.

**Primero, la autonomía fiscal mide de dónde viene el dinero, no cuán sano está el gobierno local.** Que Lima Centro financie el 92% de su ingreso con impuestos y tasas propias no la hace más resiliente que una periferia dependiente del FONCOMUN: sus recursos propios (casi la mitad, Recursos Directamente Recaudados) son procíclicos y atados al ciclo inmobiliario, sin amortiguador ante una caída local. Autonomía alta significa discrecionalidad de uso, no estabilidad del flujo.

**Segundo, hay dos dependencias, no una, y son institucionalmente distintas.** La periferia limeña (Norte, Sur, Este) vive del FONCOMUN, una transferencia redistributiva indexada al IGV nacional, estable y de libre disponibilidad. El Callao vive de otra cosa: la Renta de Aduanas del puerto, una renta de recurso volátil, atada al comercio exterior y restringida por ley a inversión. El Callao aparece rico (segundo en gasto por habitante) por una renta que no controla y sin colchón propio que amortigüe una caída del comercio: es una fragilidad encubierta, no una fortaleza.

**Tercero, el "boom de endeudamiento" municipal de 2024-2025 no existió como fenómeno del sector: fue una sola entidad.** El 98% del crédito municipal de esos dos años es la Municipalidad Metropolitana de Lima, financiando megaproyectos de escala metropolitana. Entre los municipios distritales, más de un tercio ni siquiera registró crédito. Sin desagregar, el agregado habría atribuido al conjunto un comportamiento que solo una entidad de régimen especial podía tener.

**Cuarto, recaudar bien y gastar bien son capacidades distintas, y el gasto municipal es geográficamente regresivo.** San Isidro, el segundo distrito más autónomo del universo, es también de los que peor ejecutan (0.76): la riqueza no compra ejecución. Y quienes más gastan por habitante son los distritos más ricos y menos poblados, no los más pobres y populosos: la fiscalidad municipal, leída como incidencia territorial, amplifica en vez de igualar. El FONCOMUN empuja en la dirección correcta, pero no alcanza a cerrar una brecha de casi tres a uno entre el centro y la periferia.

---

## Sección 0 — Cómo leer este reporte

Estos son **registros administrativos censales del SIAF**, no una muestra. El universo es la población completa de asientos presupuestales de los 50 gobiernos locales. Implicación práctica: cualquier diferencia numérica entre dos cifras "sería significativa" en una prueba de hipótesis, y eso es ruido, no información. Lo que importa es el tamaño del efecto y su relevancia de gestión.

Dos decisiones de lectura sostienen todo el reporte. La primera: **la Municipalidad Metropolitana de Lima y la Municipalidad Provincial del Callao se tratan aparte, y no por tamaño sino por competencia.** Ambas ejercen funciones de alcance metropolitano o provincial (transporte, vialidad estructurante) sobre un presupuesto registrado en una sola unidad ejecutora, pero el panel las atribuye a la población de un único distrito (el Cercado). Eso infla su gasto por habitante de forma brutal (la MML sale en más de S/8,000 por habitante cuando el resto ronda los S/300 a S/1,100) y las vuelve incomparables con un municipio distrital. Concentran entre el 26% y el 44% del gasto del universo y casi todo el crédito; se excluyen de las comparaciones per cápita.

La segunda: **se reporta el distrito mediano, no el promedio del universo.** La media del gasto por habitante duplica a la mediana porque un puñado de distritos diminutos (La Punta, Santa María del Mar) tiene per cápita altísimo por su denominador poblacional minúsculo. El distrito representativo de Lima y Callao gasta cerca de S/620 reales por habitante; hablar del promedio de S/1,077 sobreestima al distrito típico.

---

## Parte 1 — La Lima municipal como un todo

> **La pregunta:** ¿está sana la fiscalidad municipal de Lima, o el promedio esconde algo?

En el agregado, la Lima municipal devenga entre S/6,200 y S/8,900 millones reales al año y recauda entre S/7,500 y S/11,700 millones, con una recuperación fuerte en 2024-2025 tras el valle de la pandemia.

![Figura 1. Gasto e ingreso municipal agregado de Lima y Callao (2018-2025)](../imagenes/fig01_series_gasto_ingreso_lima_2018_2025_inmerge.png)

**Qué muestra.** Las tres series (PIM, devengado, ingreso recaudado) caen tras 2018, tocan piso en la pandemia y se recuperan con fuerza en 2024-2025. La brecha del ingreso sobre el gasto es en parte estructural (la formulación conservadora del ingreso bajo el Sistema Nacional de Presupuesto Público, Decreto Legislativo 1440, lo subestima, y los saldos de balance lo engrosan) y en parte, al final del periodo, el crédito de la MML contabilizado como recaudado antes de gastarse. No es superávit. Nota: el eje va en soles constantes con IPC Nacional, que subestima la porción real de inversión.

El ingreso supera siempre al gasto, y la brecha se ensancha justo al final del periodo. Es tentador leerla como ahorro o superávit, pero no lo es: **buena parte de ese ensanchamiento de 2024-2025 es el crédito de la Municipalidad Metropolitana de Lima entrando contablemente como ingreso recaudado, mientras el gasto que financiará madura en ejercicios posteriores.** No es plata que sobra, es financiamiento contratado y todavía no ejecutado.

La segunda buena noticia aparente es la ejecución. La tasa devengado/PIM sube diez puntos, de 0.78 a 0.88. Pero el hallazgo fuerte no está en el promedio, está en la distribución: en 2018, 29 de los 48 distritos comparables (el 60%) devengaban menos del 80% de su presupuesto y diez quedaban por debajo del 70%; en 2025 **solo dos distritos bajan del 80% y ninguno del 70%.** La subejecución severa, endémica hasta 2020, prácticamente desapareció. El boxplot lo muestra con claridad: no es que la media suba, es que toda la distribución se desplaza hacia arriba y se comprime contra el techo.

![Figura 3. Distribución entre distritos: (a) tasa de ejecución por año, (b) autonomía fiscal por macro-sector](../imagenes/fig03_distribucion_ejecucion_autonomia_2018_2025_inmerge.png)

**Qué muestra.** El panel (a) revela que la mejora de la ejecución no es de la media sino de toda la distribución, que sube y se comprime contra el techo (la subejecución severa, presente en 29 de 48 distritos en 2018, casi desaparece en 2025), reflejo de la maduración de la cadena certificación-compromiso-devengado del SIAF, no de un cambio de política. El panel (b) ordena la autonomía por zona y expone su heterogeneidad interna: cajas compactas en Lima Centro (autonomía uniformemente alta) frente a cajas anchas en la periferia y el Callao, donde el promedio de zona no describe a ningún distrito real.

La tercera lectura es la estructura del ingreso, y aquí conviene detenerse.

![Figura 2. Estructura del ingreso municipal: propios, transferencias y crédito (2018-2025)](../imagenes/fig02_composicion_ingreso_lima_2018_2025_inmerge.png)

**Qué muestra.** El bloque inferior (impuestos municipales más recursos directamente recaudados) domina de forma estable y sostiene la autonomía agregada, atípica frente al municipio promedio del país que vive de transferencia. El fenómeno del periodo es el segmento superior de crédito, que salta de un rango de 6% a 16% hasta 25% y 30% en 2024-2025 y agranda toda la barra. La figura es la fotografía del clasificador de fuentes del SIAF: separa lo propio (discrecional) de los recursos determinados (FONCOMUN, Canon y Renta de Aduanas, de destino restringido). El salto del crédito es composición contable de una sola entidad (lo desagrega la Figura 9), no un fortalecimiento del ingreso corriente del sector.

**La Lima municipal es, en agregado, fiscalmente autónoma: entre el 52% y el 69% de su ingreso son recursos propios (impuestos municipales y recursos directamente recaudados), y la autonomía sin crédito sube de 0.62 a 0.74.** Esto la distingue del municipio promedio del país, que vive de la transferencia. Pero autonomía no es resiliencia. El ingreso propio no es homogéneo: casi la mitad son Recursos Directamente Recaudados (tasas, licencias de edificación, derechos), una base fuertemente procíclica y atada al ciclo inmobiliario. Ante una contracción local, ese componente cae de golpe y sin amortiguador. El FONCOMUN de la periferia, indexado al IGV nacional, es en cambio un riesgo mancomunado con piso más estable. La conclusión es contraintuitiva: un distrito muy autónomo puede ser, en el margen, más expuesto a un shock local que uno que vive de una transferencia nacional.

El rasgo más marcado de la figura es el segmento superior, el crédito, que se dispara en 2024-2025 (de un rango de 6% a 16% del ingreso hasta 25% y 30%). La Parte 3 mostrará que ese salto es, casi entero, una sola entidad.

Dos matices cierran el panorama agregado. El gasto **corriente** domina y es rígido (planillas, limpieza, serenazgo, mantenimiento), mientras el gasto de **capital** oscila con el ciclo político (pico de 37% en 2018, valle COVID de 16%, recuperación a 29% en 2025). La distinción no es contable: el corriente es una inyección de demanda de efecto inmediato y bajo escape local, mientras la inversión opera sobre la productividad en el mediano plazo, con rezago de maduración largo, más fuga hacia contratistas de fuera y más riesgo de ejecución. Y la sobrerrecaudación (el recaudado supera al PIM de ingreso, de 1.07 en 2018 a 1.27 en 2025) no es un esfuerzo recaudatorio creciente sino la huella de la subpresupuestación estructural: bajo el Sistema Nacional de Presupuesto Público (Decreto Legislativo 1440), los municipios estiman su ingreso de forma conservadora y la recaudación efectiva los excede, sumada a la incorporación de saldos de balance.

Pero todo lo anterior es el promedio, y el promedio miente. **El gasto está fuertemente concentrado** (Gini de 0.58 en el devengado, 0.61 en la recaudación propia), y la media del gasto por habitante (S/1,077) queda un 74% por encima de la mediana (S/619), inflada por los distritos diminutos. La distribución real entre los 48 distritos comparables:

| Métrica (pooled 2023-2025) | p10 | p25 | Mediana | p75 | p90 | Media |
|---|---|---|---|---|---|---|
| Devengado por habitante (S/) | 293 | 368 | **619** | 1,045 | 1,500 | 1,077 |
| Ingreso propio por habitante (S/) | 107 | 180 | 353 | 845 | 1,280 | 753 |
| Autonomía fiscal | 0.29 | 0.46 | 0.68 | 0.87 | 0.95 | 0.66 |
| Tasa de ejecución | 0.76 | 0.81 | 0.87 | 0.93 | 0.95 | 0.86 |
| Participación de inversión | 0.06 | 0.09 | 0.14 | 0.19 | 0.27 | 0.16 |

---

## Parte 2 — Tres Limas fiscales

> **La pregunta:** si el promedio esconde tanta desigualdad, ¿cómo se ordena el territorio?

Agrupados en cinco macro-sectores, los distritos revelan un gradiente de casi tres a uno en gasto por habitante y, sobre todo, dos modelos de dependencia radicalmente distintos.

![Figura 4. Macro-sectores de Lima Metropolitana y Callao: 50 distritos por zona](../imagenes/fig04_mapa_orientacion_zonas_lima_inmerge.png)

**Qué muestra.** La partición de los 50 distritos en cinco macro-sectores es una construcción analítica territorial, no una unidad del clasificador institucional del SIAF (cada distrito es un pliego de Gobierno Local independiente; la zona solo ordena la lectura). Su valor es servir de base a las figuras siguientes, donde la posición geográfica anticipa la fuente de financiamiento dominante: base predial propia en el núcleo consolidado, dependencia de FONCOMUN en las coronas populosas, Renta de Aduanas en el litoral chalaco.

| Zona | Gasto/hab (2025) | Autonomía | Inversión | De qué vive |
|---|---|---|---|---|
| Lima Centro | S/1,095 | 0.95 | 12.5% | Su propio predial y arbitrios |
| Callao | S/711 | 0.24 | 12.9% | La Renta de Aduanas del puerto |
| Lima Sur | S/437 | 0.61 | 25.4% | El FONCOMUN |
| Lima Este | S/408 | 0.73 | 18.5% | El FONCOMUN |
| Lima Norte | S/337 | 0.67 | 18.3% | El FONCOMUN |

**La periferia depende del FONCOMUN por diseño, no por casualidad.** El Fondo de Compensación Municipal no es una transferencia discrecional: es la distribución del Impuesto de Promoción Municipal (el 2% del IGV), con base constitucional en el artículo 196 y régimen en el TUO de la Ley de Tributación Municipal (Decreto Legislativo 776). Lo que recibe cada municipalidad no depende de lo que recauda en su territorio, sino de índices que el MEF aprueba anualmente sobre criterios de población, ruralidad y carencias. La fórmula pondera al alza a los distritos populosos, pobres y de menor densidad, exactamente el perfil de Lima Norte, Sur y Este, que capturan del FONCOMUN entre el 29% y el 34% de su ingreso, contra el 4.6% de Lima Centro, cuya base propia hace irrelevante el fondo.

![Figura 5. Estructura del ingreso municipal por macro-sector (2018-2025)](../imagenes/fig05_composicion_ingreso_zonas_inmerge.png)

**Qué muestra.** La figura separa dos modelos de financiamiento que el agregado ocultaba. Lima Centro se autofinancia (cerca del 92% propios, FONCOMUN irrelevante en 4.6%); la periferia (Norte, Sur, Este) descansa en el FONCOMUN (29% a 34%), transferencia redistributiva indexada al IGV y ponderada por norma hacia distritos populosos y pobres (base constitucional del artículo 196, régimen del Decreto Legislativo 776); y el Callao depende en 51% de lo que el rubro etiqueta "Canon" pero que en el puerto es Renta de Aduanas, una participación en lo recaudado por las aduanas, volátil y restringida por ley a inversión. Son dos dependencias distintas, con perfiles de riesgo opuestos.

**El Callao es otra historia, y conviene nombrarla bien: lo que lo sostiene no es canon, es Renta de Aduanas.** En el clasificador del SIAF, el rubro que aparece etiquetado como "Canon" agrupa en realidad "Canon y Sobrecanon, Regalías, Renta de Aduanas y Participaciones". En el Callao no hay mina ni pozo: ese 51% del ingreso es la participación en la Renta de Aduanas, una fracción de lo que recaudan las aduanas marítima y aérea del puerto. La distinción importa porque cambia la naturaleza del riesgo. Su base es el comercio exterior (importaciones, tipo de cambio), de una volatilidad atada al ciclo del comercio y no a una fórmula redistributiva estable; y comparte con el canon la restricción legal de destinarse a inversión, sin poder financiar gasto corriente permanente.

De ahí **la paradoja del Callao: segundo en gasto por habitante, pero último en autonomía.** Su riqueza es transferida, no recaudada. Peor aún, la renta parece desincentivar el esfuerzo fiscal propio: pese a su base portuaria e industrial, el Callao recauda apenas S/175 por habitante de recursos propios, por debajo de Lima Sur (S/245) y Lima Este (S/286), zonas más pobres. Su volatilidad se transmite al presupuesto de inversión en un patrón de arranque y freno, y su reparto entre siete municipalidades produce inequidades internas grotescas (La Punta, con menos de 4,000 habitantes, devenga S/9,339 por habitante). El Callao no es rico: es frágil con apariencia de rico.

Un tercer patrón cierra la comparación entre zonas, y es contraintuitivo: **la inversión es inversa a la riqueza.** La periferia invierte más (Lima Sur 25.4%) que el centro (12.5%). No es solo que la periferia tenga más brechas que cerrar: es que el FONCOMUN y la Renta de Aduanas son recursos determinados, inclinados o restringidos por norma a inversión, de modo que la composición del gasto hereda la restricción de destino de la fuente. La redistribución opera, pero opera empujando a la periferia a invertir con recursos que no genera.

Finalmente, un aviso sobre el propio corte por zona: **el promedio de zona es honesto en unas y engañoso en otras.** Lima Centro es homogéneamente autónoma (todos sus distritos entre 0.63 y 0.99) y Lima Norte es la más pareja en gasto por habitante (pobreza fiscal uniforme). Pero Lima Sur y el Callao mezclan distritos popular-masivos con balnearios diminutos de per cápita extremo, y su promedio de zona no describe a ningún distrito real. El boxplot de la Figura 3b lo hace visible: cajas compactas en Lima Centro, anchas y dispersas en la periferia y el Callao.

---

## Parte 3 — Mejores y peores

> **La pregunta:** dentro de este mapa, ¿quiénes son los mejores y los peores, y por qué?

El detalle distrital separa dos arquetipos con nitidez.

![Figura 7. Cuadrantes: autonomía fiscal vs gasto por habitante (2023-2025)](../imagenes/fig07_cuadrantes_autonomia_gasto_2023_2025_inmerge.png)

**Qué muestra.** La nube ordena el universo sobre el eje que más lo separa, la autonomía (la composición del clasificador de fuentes de cada distrito), y expone la regresividad territorial: los ricos y autónomos (Miraflores, San Isidro) están arriba a la derecha con gasto por habitante alto, mientras las burbujas grandes (distritos populosos como San Juan de Lurigancho) se agolpan abajo, con autonomía media-baja y gasto por habitante bajo. El gasto por habitante sube con la riqueza y baja con la población: la fiscalidad municipal amplifica en vez de igualar. Es asociación descriptiva (la riqueza es un confusor no controlado), y los per cápita extremos (La Punta) son artefacto del denominador poblacional minúsculo.

En la esquina superior derecha, **los ricos y autónomos:** Miraflores (autonomía 0.985), San Isidro (0.973), Jesús María, Surco, San Miguel, La Molina. Financian casi todo su gasto con su propio predial y sus arbitrios. En la esquina opuesta, **los dependientes:** Mi Perú (Callao, 0.071), La Punta (0.181), Ventanilla (0.192), Villa María del Triunfo, La Perla, Carmen de la Legua. El Callao copa esta cola con cinco de sus siete distritos. San Juan de Lurigancho, el distrito más poblado del país con 1.3 millones de habitantes, es un caso de dependencia media (autonomía cercana a 0.50): grande, de gasto por habitante bajo, con una necesidad que su base tributaria no acompaña.

Este mapa desmonta dos intuiciones cómodas. La primera: **que autonomía sea buena gestión.**

![Figura 8. Mejores y peores distritos: autonomía y ejecución (2023-2025)](../imagenes/fig08_ranking_mejores_peores_2023_2025_inmerge.png)

**Qué muestra.** Los dos rankings juntos desmontan que autonomía equivalga a buena gestión: son dimensiones institucionalmente distintas (una es origen del recurso en el clasificador de fuentes, la otra es avance en la cadena devengado/PIM). El eje de autonomía lo encabeza Lima Centro y lo cierra el Callao (Mi Perú 0.07); el de ejecución reordena la baraja y ubica a San Isidro, el segundo más autónomo, entre los peores ejecutores (0.76). Un distrito con ingreso propio abundante y saldos de balance enfrenta baja presión por gastar y ve su PIM inflado por esos saldos, lo que deprime la tasa por aritmética del carry-over, no por incapacidad.

San Isidro, el segundo distrito más autónomo del universo, tiene una de las peores tasas de ejecución (0.757). No es solo que recaudar y ejecutar sean capacidades distintas: hay un mecanismo económico detrás. Un distrito con ingreso propio abundante y saldos de balance acumulados enfrenta una restricción presupuestaria efectivamente blanda. La presión por devengar el presupuesto dentro del año es baja porque los servicios ya están provistos y las brechas de infraestructura, cerradas; su subejecución es en parte deliberada (proyectos de alto estándar, maduración plurianual). Y hay un componente puramente contable: donde el recaudado supera de forma persistente al devengado y se incorporan saldos de balance, el presupuesto (denominador de la tasa) se infla con recursos que no estaban destinados a ejecutarse ese año, deprimiendo la ejecución por aritmética, no por incapacidad. La peor ejecución, por lo demás, se concentra en los distritos balneario del sur (Punta Hermosa 0.711, Pachacámac 0.716), no en los pobres populosos.

La segunda intuición que cae: **que el crédito municipal haya crecido como sector.**

![Figura 9. El endeudamiento municipal 2024-2025 es casi solo la MML](../imagenes/fig09_concentracion_credito_2024_2025_inmerge.png)

**Qué muestra.** La figura resuelve el "boom de endeudamiento" que aparecía en la Figura 2: el 98% del crédito municipal de 2024-2025 es una sola entidad, la MML (S/5,975 millones), mientras el resto registra montos marginales y más de un tercio de los distritos no tuvo crédito. Es lo que predicen las reglas de endeudamiento subnacional (topes de deuda sobre ingresos corrientes de los Decretos Legislativos 1437 y 1275, aval del MEF para grandes operaciones): solo un pliego con la escala de ingresos y el objeto metropolitano de la MML puede montar operaciones de ese tamaño. Sin desagregar, el agregado habría atribuido al sector el comportamiento de una entidad de régimen especial.

El salto del crédito que se veía en el agregado (Figura 2) es, en el 98%, la Municipalidad Metropolitana de Lima: S/5,975 millones para megaproyectos de transporte y vialidad. No es el sector: más de un tercio de los distritos ni siquiera registró crédito en esos dos años. Y solo la MML podía hacerlo. El crédito municipal está sujeto al Sistema Nacional de Endeudamiento (Decreto Legislativo 1437) y a reglas fiscales subnacionales (Decreto Legislativo 1275) que fijan topes de deuda respecto de los ingresos corrientes; las operaciones con aval del Gobierno Nacional requieren autorización del MEF. Solo un pliego con la escala de ingresos y el objeto de inversión metropolitano de la MML puede montar operaciones de esa magnitud dentro de esos topes; un distrito promedio choca con el límite mucho antes. El patrón, además, calza con el calendario político: las gestiones electas en octubre de 2022 concentran su deuda de inversión en los años dos y tres del mandato. No es un shock macro, es un ciclo de gestión.

Debajo del agregado autónomo hay, finalmente, una dependencia estructural que conviene no perder de vista: **117 de las 144 observaciones distrito-año (el 81%) gastan por habitante más de lo que recaudan por cuenta propia.** La autonomía del agregado la cargan unos pocos distritos ricos de Lima Centro; el distrito representativo sigue necesitando la transferencia para financiar su gasto.

Las coropletas resumen las tres Limas fiscales en un solo vistazo: el núcleo autónomo de servicios (alta autonomía, baja inversión), la periferia inversora dependiente, y el Callao rentista de la costa.

![Figura 6. Perfil fiscal de los distritos: gasto por habitante, autonomía, ejecución e inversión (promedio 2023-2025)](../imagenes/fig06_coropletas_distritales_lima_2023_2025_inmerge.png)

**Qué muestra.** Las cuatro capas leen cuatro dimensiones del mismo registro presupuestal sobre la misma unidad. Autonomía e inversión son casi inversas en el espacio: la periferia y el Callao invierten mayor proporción de su gasto (18% a 25%) que el centro autónomo (12.5%), porque el FONCOMUN y la Renta de Aduanas son recursos determinados que la norma inclina o restringe a inversión, y la composición del gasto hereda ese destino. Las dos provinciales (MML y Callao) van tramadas y aparte: su gasto de alcance supra-distrital, registrado en una sola unidad ejecutora pero atribuido a la población de un solo distrito, no es comparable (régimen especial de la Ley 27972).

---

## Qué dejar en claro

1. **La autonomía fiscal ordena el universo, pero no predice ni gestión ni resiliencia.** Es la variable que más separa a los distritos, pero un distrito autónomo puede ejecutar mal (San Isidro) y su ingreso propio puede ser más volátil que una transferencia nacional.
2. **Hay dos dependencias, no una.** La redistributiva (FONCOMUN, estable, de libre uso) y la de renta de recurso (Renta de Aduanas del Callao, volátil y atada a inversión) exigen lecturas y políticas distintas.
3. **El gasto municipal es geográficamente regresivo.** Los distritos ricos y menos poblados gastan por habitante varias veces más que los pobres y populosos (San Isidro S/3,531 y Miraflores S/2,510 frente a San Juan de Lurigancho S/284). El FONCOMUN empuja en la dirección correcta pero no cierra la brecha. Como el valor social de un sol de gasto es mayor donde el gasto es menor, esto es una ineficiencia asignativa territorial, no solo una inequidad. Con la salvedad de que es la regresividad del estrato municipal únicamente: el gasto nacional y regional, fuera de este lente, podría atenuarla.
4. **El corte distrital fue decisivo.** Sin él, el "boom de crédito" se habría atribuido al sector, la autonomía se habría confundido con buena gestión, y el Callao se habría contado como un distrito rico más. Los tres hallazgos viven en el detalle, no en el agregado.
5. **La palanca de política es la recaudación propia de la periferia** (catastro predial, cobranza de arbitrios), con la advertencia de que el techo es bajo donde el valor del suelo es bajo. La transferencia seguirá siendo necesaria.

---

## Limitaciones y advertencias

- **Estudio descriptivo.** No se identifica ningún efecto causal; la relación autonomía-ejecución es una asociación transversal con la riqueza distrital como confusor no controlado.
- **No se afirma resiliencia ni vulnerabilidad ante shocks** a partir de la autonomía: el argumento de riesgo de la fuente propia es una hipótesis de mecanismo, no un resultado medido (haría falta descomponer la varianza del recaudado por rubro).
- **La subejecución no equivale a mala gestión:** la tasa devengado/PIM mezcla incapacidad, lentitud deliberada y un denominador inflado por saldos de balance.
- **No se comparan niveles reales de inversión entre años:** el panel deflacta todo con IPC Nacional, pero la inversión en obras debería deflactarse con el índice de Materiales de Construcción. La participación de inversión (ratio nominal intra-año) es válida; el crecimiento del monto real de inversión, no, sin re-deflactar por categoría.
- **Lente municipal.** No cubre el gasto nacional ni regional ejecutado en cada distrito; la regresividad afirmada es solo del estrato municipal.
- **Provinciales no comparables:** MML y Municipalidad Provincial del Callao se excluyen de las comparaciones per cápita por competencia, no por tamaño.
- **Distritos muy pequeños** (La Punta, Santa María del Mar, Punta Negra) gobiernan la varianza per cápita de Lima Sur y Callao; La Punta es evidencia sugestiva del rentismo chalaco, no un caso representativo.
- **Nota sobre citas normativas:** de alta confianza el Decreto Legislativo 1440 (SNPP), el Decreto Legislativo 776 / TUO de la Ley de Tributación Municipal (FONCOMUN e Impuesto de Promoción Municipal), la Ley 27506 (Canon), la Ley 27972 (Ley Orgánica de Municipalidades, régimen especial de la MML) y los Decretos Legislativos 1437 y 1275 (endeudamiento y reglas fiscales subnacionales). El número exacto de la ley de participación en renta de aduanas del Callao debe verificarse antes de imprimirlo; el contenido descrito es fiel al régimen.

---

*Panel de sustento: `pipeline/03_gold/gold_panel_fiscal_distrital_lima/` (diccionario en `pipeline/catalog/`). Gates de calidad en `deliverables/reportes/qa/`. Figuras (9, paleta de marca Inmerge): `deliverables/figuras/eda/fig01_*_inmerge.png` a `fig09_*_inmerge.png`, script `pipeline/scripts/04_eda/geografico/fig_fiscal_lima_inmerge.py`. Tablas en `deliverables/tablas/eda/geografico/`.*

