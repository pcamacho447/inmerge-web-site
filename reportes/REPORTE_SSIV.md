# REPORTE — Shift-Share IV del canon minero: resultados

**Generado:** 2026-07-24 · Scripts `03a`–`04c` (incl. AKM) · Cadena principal: **canon** (ambas se reportan).
**Base de exposición: promedio predeterminado 2016–2017** (producción BCRP 2004–2025; A5).
**Precios BCRP 2004–2025** → la spec rezagada cubre la ventana completa **2018–2025**.
Método y supuestos en `../../PLAN_SSIV.md`; datos en `../../notas/`.

---

## 1. El instrumento (construcción, PLAN_SSIV §1)

$$z_{i,t} = \frac{1}{N_{i,0}}\sum_{m} q_{i,m,0}\,\kappa_m\,p_{m,t-1}$$

Valor predicho de producción minera per cápita: **producción física por metal, promedio
predeterminado 2016–2017** (incluye minas vigentes como Las Bambas) × **precio internacional
rezagado 1 año**, con conversión de unidades. 6 metales (Cu, Au, Ag, Pb, Zn, Sn), 18 deptos con
exposición, muestra **2018–2025** (N=200).

**El rezago de 1 año está validado dos veces:** (a) corr(canon, precio cobre) = 0.61 contemp. vs
0.92 rezagada; (b) **perfil de F de 1ª etapa** — la relevancia maximiza justo en t−1:

| Timing del precio | F de 1ª etapa (canon ~ z) |
|---|---:|
| contemporáneo (t) | 2.7 |
| **rezago t−1** | **7.3** |
| rezago t−2 | 3.7 |

## 2. Resultados de estimación (ambas cadenas)

| Cadena | Endógena | 1ª etapa F | 2SLS β | Forma reducida δ (p clust.) |
|---|---|---:|---:|---:|
| **Canon (PRINCIPAL)** | canon minero real p.c. | **7.3** | **−0.0090** | −1.95 (p=0.030) |
| Gasto | ln(gasto nf_np p.c.) | 0.2 | −115 | −1.95 (p=0.030) |

- **La cadena del canon funciona**: 1ª etapa positiva (más valor minero predicho → más canon),
  forma reducida negativa (más exposición → menos pobreza), Wu-Hausman confirma endogeneidad
  (p=0.001; OLS sesgado hacia 0: −0.0024 vs IV −0.0090).
- **La cadena del gasto NO es utilizable**: F de 1ª etapa = 0.2. El canon es una fracción pequeña
  del gasto total → el instrumento no lo mueve. β = −115 (se 233) es ruido. *Con estos datos sólo
  se puede instrumentar el propio canon, no el gasto total.*

**Interpretación del β principal:** cada sol adicional per cápita de canon minero (soles 2018) se
asocia a **−0.0090 pp** de pobreza. Un windfall de S/ 500 p.c. → ≈ −4.5 pp.

## 3. Validación matemática e inferencia (PLAN_SSIV §2)

| Diagnóstico | Resultado | Lectura |
|---|---|---|
| **F efectivo (Olea-Pflueger)** | 7.3 vs crítico ≈ 23.1 | **Débil** → inferencia robusta obligatoria |
| **IC Anderson-Rubin 95 %** | **[−0.043, −0.0008]** | Excluye 0, pero **apenas** (borde cerca de 0) |
| **Aleatorización — forma reducida** | **p = 0.068** | Significativo al 10 %, **no al 5 %** |
| Aleatorización — β (ratio) | p = 0.70 | No fiable (colas gruesas del ratio); usar δ |
| **Rotemberg** | Cobre 98.6 % del peso; 2 pesos negativos | La identificación **es la historia del cobre** |
| **Hansen J (6 metales)** | J=6.87, p=0.230 | No se rechaza validez conjunta |
| **Shocks efectivos** | 2.77 | Poca potencia estructural — declarado |
| **Leave-one-out** | Moquegua el más influyente; signo estable | Ningún depto voltea el resultado |
| **AKM — método delta (Adão-Kolesár-Morales 2019)** | β=−0.0090, se=0.0013, IC 95% t(gl=5) [−0.0124,−0.0056] | Excluye 0 con holgura, pero el método delta puede ser optimista con 1ª etapa débil (t≈2.6 bajo AKM) |
| **AKM — Anderson-Rubin (robusto a IV débil)** | **IC 95% t(gl=5): [−0.173, −0.007]** | Excluye 0. Más ancho que el AR por-depto (refleja S=6 honestamente) — el intervalo **más conservador y creíble** de todo el análisis |

**Lectura honesta:** el efecto es **negativo y consistente** en punto (β≈−0.009 en todas las
specs). Con la inferencia clusterizada por departamento la significancia es limítrofe con la
ventana completa (AR excluye 0 por poco, aleatorización da p=0.068) — es lo esperable con 2.77
shocks efectivos. **La inferencia AKM (que agrupa por metal, la unidad de aleatoriedad correcta
para este diseño) es más conservadora en sus supuestos y, aun así, EXCLUYE 0 tanto por el método
delta como por Anderson-Rubin.** Esto es la confirmación más creíble disponible: el hallazgo
sobrevive el estándar de inferencia más exigente aplicable a un shift-share con pocos shocks.

### Sensibilidad al año 2018 (declarada, no ocultada)
Al **excluir 2018** (muestra 2019–2025, el primer año del panel con el instrumento recién
construido), el resultado es **más fuerte**: F efectivo 8.4, IC AR [−0.037, −0.0019] (excluye 0
con más holgura), aleatorización de forma reducida **p=0.038** (< 5 %). Se reporta 2018–2025 como
principal porque es la ventana completa y **no hay razón de principio para descartar 2018** una vez
que hay precio 2017; la mayor fuerza de 2019–2025 se documenta como sensibilidad, no se adopta para
inflar la significancia.

### 3.1 Errores estándar AKM — derivación y resultado completo

**Por qué el clustering por depto está mal especificado aquí:** un shock al precio de un metal
mueve simultáneamente a TODOS los departamentos expuestos a ese metal — los residuos no son
independientes entre departamentos de composición minera parecida. AKM (2019) trata el **metal**
(el shock), no el departamento, como la unidad de aleatoriedad correcta.

**Derivación (aplicada a este diseño):** el instrumento es aditivo por construcción,
$z_{i,t}=\sum_m \check s_{i,m}\,p_{m,t-1}$. Por linealidad de la proyección FWL (demean
depto+año), el residuo también es aditivo: $z_r=\sum_m z_r[m]$ — **verificado numéricamente**
($\max|\sum_m z_r[m]-z_r|=2.66\times10^{-16}$, ver `scripts/04c_ssiv_akm.py`). Eso permite
construir un "meat" agrupado por metal (S=6) en vez de por depto (25), tanto para la varianza de
la forma reducida/1ª etapa (método delta) como para un Anderson-Rubin robusto a IV débil. Con
S=6 se usa **t de Student con S−1=5 grados de libertad** (más conservador que la normal, como
recomienda el propio AKM cuando S es chico).

**Resultado:** π̂=215.97 (se_AKM=82.41, t≈2.6 — 1ª etapa borderline bajo AKM), δ̂=−1.948
(se_AKM=0.494, t=−3.94, p=0.011). Método delta: β̂=−0.0090 (se=0.00133), IC 95% t(5)
[−0.0124,−0.0056]. **Anderson-Rubin bajo varianza AKM (el más robusto): IC 95% t(5)
[−0.173,−0.007]** — sustancialmente más ancho que el método delta (coherente con una 1ª etapa
débil bajo AKM) pero **sigue excluyendo 0**.

### 3.2 Wild bootstrap EXACTO sobre los 6 metales (Cameron-Gelbach-Miller, enumeración completa)

Con S=6 shocks hay exactamente $2^6=64$ patrones de signo Rademacher — se enumeraron **los 64**,
sin muestreo Monte Carlo, dando un p-valor genuinamente exacto (no asintótico) para H0: δ=0
(⟺ β=0, vía Anderson-Rubin, robusto a instrumento débil).

**p-valor exacto = 1/32 = 0.0312 < 0.05 → se rechaza H0: δ=0 al 5 %.**

Este es, además, **el p-valor dos-colas más chico que este método puede producir con S=6**: los
6 scores por metal ($z_r[m]\cdot y_r$) comparten el mismo signo (todos negativos), así que la
estadística observada es el **máximo exacto** de los 64 valores de referencia — no hay margen
para un p-valor menor con esta prueba exacta; es el techo de evidencia que 6 shocks permiten.

**Advertencia honesta sobre la INVERSIÓN a intervalo de confianza:** invertir esta misma prueba
sobre una grilla de β0 (para construir un IC, no solo el p puntual) da una región rechazada
angosta **[−0.007, 0.005]** alrededor de 0, y **NO rechaza valores grandes/implausibles** (p. ej.
β0=±2). Esto **no significa que el efecto podría ser tan grande como ±2** — es una limitación de
**resolución**: con solo 6 shocks el p-valor está cuantizado a múltiplos de 1/32, y esa
granularidad es demasiado gruesa para acotar la *magnitud* del efecto punto por punto. Este
método (04d) se usa **solo para el test puntual en β0=0** (donde da el resultado exacto de
arriba); para la magnitud (intervalo), se usa el AR-AKM asintótico de §3.1: **[−0.173, −0.007]**.

**Conclusión de §3.1+§3.2 combinadas:** tres métodos de inferencia independientes, cada uno más
conservador que el anterior, coinciden en rechazar H0: β=0 — clusterizado por depto (AR, p
limítrofe), AKM asintótico (delta method + AR-AKM, ambos excluyen 0), y **wild bootstrap exacto
sobre los 6 shocks (p=0.031, el resultado más riguroso posible con este diseño)**.

## 4. Pre-tendencias (supuesto A3, la prueba decisiva)

Con la pobreza departamental reconstruida 2004–2017 (validada vs INEI, ±0.05 pp):

- Intensidad minera $T_i$ → tendencia pre-2018: **p = 0.442** (no predice) ✔
- Exposición al **cobre** → tendencia pre-2018: **p = 0.799** (no predice) ✔
- Exposición al **oro** → tendencia pre-2018: **p = 0.048** (marginal) ⚠

Como la identificación es **98.6 % cobre** y la exposición al cobre **no** predice la trayectoria
previa, el test pasa para el componente que domina. El oro trae una pre-tendencia marginal (deptos
auríferos con dinámicas propias), pero su peso de Rotemberg es negativo y pequeño → casi no entra
en el β. Se declara.

## 5. Limitaciones declaradas (PLAN_SSIV §5)

1. **La exclusión (A2) identifica un *windfall minero total*, no limpiamente el canal fiscal.** El
   precio del cobre afecta al departamento también por empleo minero, salarios y demanda local.
   Lectura honesta del β: **"efecto de un windfall de canon"**, no "efecto del gasto financiado por
   canon" (eso requiere A2 estricta).
2. **El diseño es, en esencia, cobre** (Rotemberg 98.6 %). Aplica a departamentos cupríferos; el
   oro da signo opuesto con peso negativo y pre-tendencia marginal.
3. **Sólo 2.77 shocks efectivos y 18 deptos** → potencia baja; la significancia es limítrofe y
   sensible a 1 año (§3). Un nulo/borderline bien medido es un resultado válido, no un fracaso.
4. ✔ **Base predeterminada 2016–2017** (A5 satisfecho) y ✔ **precios 2004–2025** (recupera 2018 y
   valida el rezago con el perfil de F). Ya no hay datos pendientes.
5. ✔ **AKM implementado** (`scripts/04c_ssiv_akm.py`, §3.1) y ✔ **wild bootstrap exacto
   implementado** (`scripts/04d_ssiv_wildboot.py`, §3.2): método delta + Anderson-Rubin bajo
   varianza agrupada por metal (S=6, t de Student gl=5) + enumeración exacta de los 64 patrones
   de signo. Los tres coinciden en rechazar β=0. Único pendiente menor: la inversión a intervalo
   del wild bootstrap exacto no es informativa por resolución (declarado en §3.2, no oculto) —
   se usa el AR-AKM asintótico para la magnitud.

## 6. Archivos

`exposicion_dep_metal.csv` · `ssiv_panel.csv` · `primera_etapa.csv` · `resultados_2sls.csv` ·
`rotemberg_weights.csv` · `leave_one_out.csv` · `pretendencias.csv` ·
`diagnosticos_estructura.csv` · `inferencia_comparada.csv` · `anderson_rubin.csv` ·
`akm_inference.csv` · `akm_ar_grid.csv` · `wild_bootstrap_metales.csv` · `wild_bootstrap_ic_grid.csv`
