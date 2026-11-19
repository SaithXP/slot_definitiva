# Space Odyssey — documento de diseño

## Alcance y estado actual

Este documento define una dirección para convertir **Space Odyssey** en el primer producto de demostración espacial del proyecto. Todas las mecánicas nuevas descritas aquí son propuestas: **no están implementadas**.

| Área | Implementado actualmente |
|---|---|
| Configuración | `js/games/space.js`: Space Odyssey, coste de 20 créditos, saldo inicial de 1.500 y siete símbolos: 🚀 🪐 🌙 ⭐ 👽 🛸 ☄️ |
| Cuadrícula | Cinco rodillos por tres filas (`COLUMNS = 5`, `ROWS = 3`). |
| Líneas y premios | Space usa 10 líneas fijas configuradas, con 2 créditos de apuesta por línea (20 por tirada). Cada línea paga por la combinación consecutiva más larga de 3, 4 o 5 símbolos desde el rodillo izquierdo; se suman los premios de líneas ganadoras. La tabla actual de Space sigue siendo 30, 70 y 250 créditos para cualquier símbolo. |
| Mecánicas especiales | Wild, Scatter, multiplicadores y Free Spins están desactivados. No hay handlers implementados para ellos. |
| Interfaz | Rodillos y símbolos como elementos HTML; una línea central decorativa; detención secuencial, resaltado de símbolos ganadores, saldo, estadísticas e historial. La tabla de premios muestra los importes configurados para 3/4/5 símbolos. |
| Presentación | Fondo azul oscuro y paneles azulados, con acentos cian (`#49c9f5`) y celeste claro (`#c7f5ff`). Los símbolos se representan con emojis del sistema. |

La configuración actual ya separa los datos de Space del motor compartido. El evaluador usa las líneas que declara un juego o, si no declara ninguna, conserva las tres filas horizontales históricas. El cálculo suma el pago de cada línea ganadora y el pipeline de mecánicas es únicamente una extensión preparada, todavía vacía. La interfaz mantiene los rodillos en DOM y puede dibujar las líneas configuradas y resaltar sus posiciones.

## 1. Concepto e identidad

**Nombre:** Space Odyssey

**Premisa:** una tripulación explora una región inestable del espacio y recolecta señales, artefactos y cristales mientras evita singularidades. Cada tirada representa un salto a un nuevo sector.

La identidad debe sentirse como una aventura de exploración cósmica, no como una interfaz genérica de casino:

- **Tono:** misterioso, optimista y de ciencia ficción aventurera.
- **Paleta base propuesta:** conservar el azul profundo actual y el cian; añadir violeta para anomalías y blanco frío para destellos.
- **Motivos gráficos:** mapas estelares, órbitas finas, paneles de nave y portales de nebulosa.
- **Lenguaje de interfaz:** “explorar”, “sector”, “salto” y “anomalía”; evitar cualquier referencia a dinero real.

## 2. Cuadrícula y líneas de pago

### Base actual

La máquina conserva una cuadrícula de **5 columnas × 3 filas**. Classic y Dragon continúan usando las tres filas horizontales históricas. Space Odyssey ahora declara las diez líneas fijas de la tabla siguiente; cada línea evalúa desde el primer rodillo y se detiene en el primer símbolo distinto.

### Líneas de Space Odyssey

La cuadrícula 5 × 3 usa **10 líneas fijas**, definidas como una secuencia de filas (0 = arriba, 1 = centro, 2 = abajo), una por rodillo:

| Línea | Filas por rodillo |
|---|---|
| 1 | 1-1-1-1-1 |
| 2 | 0-0-0-0-0 |
| 3 | 2-2-2-2-2 |
| 4 | 0-1-2-1-0 |
| 5 | 2-1-0-1-2 |
| 6 | 0-0-1-2-2 |
| 7 | 2-2-1-0-0 |
| 8 | 1-0-0-0-1 |
| 9 | 1-2-2-2-1 |
| 10 | 0-1-0-1-0 |

Cada línea paga de izquierda a derecha por **tres o más** símbolos coincidentes consecutivos; solo se paga el tramo más largo de cada línea y los premios de líneas distintas se acumulan. El coste total de 20 créditos se reparte en 2 créditos por línea. Wild, Scatter, Free Spins y multiplicadores siguen siendo propuestas no implementadas.

## 3. Símbolos y jerarquía propuesta

Propuesta de **10 símbolos**. Los importes de la tabla son pagos ficticios por una línea ganadora completa, expresados en créditos y pensados inicialmente para el coste actual de 20 créditos por tirada. En líneas normales se usan símbolos iguales; las sustituciones de Wild se describen más adelante.

| Jerarquía | Símbolo | Nombre / rol | 3 iguales | 4 iguales | 5 iguales |
|---|---|---|---:|---:|---:|
| Básico | 🛰️ | Satélite de reconocimiento | 5 | 15 | 50 |
| Básico | 🌙 | Luna helada | 5 | 20 | 60 |
| Básico | ☄️ | Cometa | 8 | 25 | 75 |
| Intermedio | 🚀 | Nave exploradora | 10 | 30 | 100 |
| Intermedio | 👽 | Viajero alienígena | 12 | 40 | 125 |
| Intermedio | 🛸 | Sonda no identificada | 15 | 50 | 150 |
| Premium | 🪐 | Planeta anillado | 20 | 75 | 200 |
| Premium | 💎 | Cristal de energía | 30 | 100 | 300 |
| Especial | 🌌 | Portal de nebulosa — Wild | 25 | 100 | 400 |
| Especial | 🕳️ | Singularidad — Scatter | Sin pago de línea; activa la función Scatter |

Los emojis son marcadores de prototipo. Para el producto visual final, sustituirlos por símbolos ilustrados coherentes entre sí y probar legibilidad en móvil.

## 4. Mecánicas propuestas

Son funciones nuevas. La configuración actual deja estas opciones en `false`, y el registro de mecánicas no contiene implementaciones.

### Wild — Portal de nebulosa 🌌

- Sustituye a cualquier símbolo de pago normal para completar una línea.
- No sustituye a la Singularidad Scatter.
- Una línea formada solo por Wild puede usar su propio pago de símbolo.
- Resaltar claramente los Wild que participaron en cada línea ganadora.

### Scatter — Singularidad 🕳️

- Cuenta en cualquier posición de la cuadrícula; no necesita estar en una línea.
- Tres, cuatro o cinco Scatters activan respectivamente 8, 12 o 20 Free Spins.
- No se sustituye con Wild.
- Mostrar el número de Scatters y la cantidad de giros concedidos en un mensaje de función.

### Free Spins

- Los giros gratuitos no descuentan créditos ni cambian el coste configurado de una tirada normal.
- Conservar la cuadrícula y las reglas de líneas; aplicar Wild, Scatter y multiplicadores durante la función.
- Permitir retrigger: Scatters que aparezcan durante los giros gratuitos conceden la misma cantidad correspondiente de giros adicionales.
- Presentar contador de giros restantes y un resumen de premios al finalizar.

### Multiplicadores

- Propuesta inicial: un multiplicador global **×2** en cada Free Spin; las ganancias de todas las líneas de ese giro se multiplican una vez por ×2.
- El multiplicador no altera los créditos apostados ni se aplica dos veces por línea.
- Mostrar el multiplicador activo antes de revelar los premios.
- Mantener esta regla acotada para el primer lanzamiento; multiplicadores aleatorios o acumulables se dejan para una iteración posterior.

## 5. Tabla de premios propuesta

La tabla de la sección de símbolos define el pago por línea de 3, 4 o 5 símbolos. La propuesta conserva el coste actual de 20 créditos por tirada normal y suma los pagos de líneas independientes.

Reglas complementarias:

1. Solo se paga la coincidencia consecutiva más larga de cada línea; no se paga además el subconjunto de tres dentro de una línea de cuatro o cinco.
2. Los Wild completan una combinación normal y no crean pagos múltiples por una misma línea.
3. Las ganancias de líneas se suman; luego se aplica una sola vez el multiplicador del giro gratuito, si corresponde.
4. El Scatter concede Free Spins según su cantidad, no un pago de línea.
5. Antes de equilibrar, simular un gran conjunto de tiradas y revisar frecuencia de premios, coste medio ficticio y máximos posibles. Los importes son valores de diseño iniciales, no una garantía de balance.

## 6. Mecánica de bonus original: Atlas de Anomalías

Durante los Free Spins, cada línea ganadora añade una **carga de salto** al Atlas. Al acumular tres cargas, se activa una breve elección entre tres rutas de anomalía:

- **Ruta de la Nebulosa:** concede 5 Free Spins adicionales.
- **Ruta del Pulsar:** aplica ×3 a las ganancias de la siguiente tirada gratuita.
- **Ruta del Agujero de Gusano:** otorga un premio fijo ficticio de 100 créditos.

El jugador elige una ruta en pantalla; después de mostrar la recompensa, el juego vuelve al contador de Free Spins. La carga no se conserva fuera de la función. Esta mecánica da identidad exploratoria y una decisión visible sin cambiar la cuadrícula ni añadir un segundo juego. Debe implementarse solo después de acordar cómo se combinan sus recompensas con el multiplicador base ×2 y el retrigger Scatter.

## 7. Dirección artística y experiencia visual

- **Escenario:** cabina panorámica con el campo de juego como ventana de la nave; siluetas de planetas y nebulosas lentas en el fondo.
- **Marco:** panel tecnológico con bordes cian, reflejos azul hielo y acentos violeta para Wild/Scatter.
- **Símbolos:** ilustraciones vectoriales o texturas con silueta clara, contraste alto y animación breve. Evitar depender del diseño de emoji del sistema.
- **Giro:** transición vertical con desenfoque y aceleración/desaceleración; detener los rodillos en secuencia como ahora, con un pequeño “acople” visual por rodillo.
- **Premio:** trazar brevemente cada línea ganadora y emitir destellos desde los símbolos implicados; reservar una animación más intensa para Scatter y bonus.
- **Free Spins:** cambiar el fondo a una zona de anomalía, mostrar el contador y mantener controles comprensibles.
- **Accesibilidad y móvil:** mantener botones, saldo, tabla y mensajes como HTML accesible; ofrecer opción de reducir movimiento, no depender solo del color y escalar el escenario sin recortar rodillos.
- **Juego responsable:** conservar el aviso visible de demostración, créditos ficticios y ausencia de apuestas o premios reales.

## 8. Qué desarrollar con PixiJS

PixiJS se propone para la **capa de presentación**, no para sustituir el motor matemático ni la persistencia:

- Crear una aplicación/canvas responsive para el marco, fondo espacial, rodillos y símbolos.
- Gestionar texturas de símbolos y atlas de sprites, incluyendo estados normales, iluminados, Wild y Scatter.
- Animar el giro, el frenado secuencial, el resplandor de líneas ganadoras y las transiciones de función.
- Dibujar y animar las 10 líneas de pago sobre la cuadrícula.
- Añadir efectos con sprites y filtros moderados: partículas, brillo, distorsión de portal y destello de premio; respetar límites de rendimiento en móvil.
- Cambiar la geometría y escala según el tamaño de pantalla y liberar recursos al cambiar de escena o juego.
- Mantener accesibilidad, selector, estadísticas, historial, mensajes y controles en DOM superpuesto; sincronizar el canvas con las decisiones/resultados del motor.

La integración requerirá incorporar y fijar una versión de PixiJS y disponer de sus recursos localmente. El proyecto hoy se ejecuta abriendo `index.html` directamente y no declara dependencias externas; esa forma de ejecución debe verificarse en una prueba técnica, porque la carga de módulos y recursos puede requerir servir el proyecto por HTTP o empaquetar los assets. No introducir PixiJS antes de decidir y documentar cómo se ejecutará la demo sin depender de una CDN.

## 9. Orden recomendado de implementación

1. **Cerrar el diseño matemático:** confirmar líneas, símbolos, tabla, orden de evaluación, pagos Wild y reglas de retrigger/multiplicadores.
2. **Ampliar el contrato de configuración:** describir líneas, pagos por símbolo y opciones de mecánica sin acoplar Space al motor.
3. **Implementar y probar el evaluador de líneas:** cubrir las diez rutas, coincidencias desde el primer rodillo y solo el tramo ganador más largo.
4. **Implementar Wild y Scatter en el motor compartido:** incluir pruebas deterministas para sustituciones, conteos en cualquier posición y exclusiones.
5. **Añadir estado de Free Spins y multiplicadores:** separar giros normales y gratuitos, aplicar pagos en un orden documentado y persistir el estado de una función activa si se recarga.
6. **Implementar el Atlas de Anomalías:** añadir estados, elección, recompensas y pruebas de interacciones/retrigger.
7. **Hacer una prueba técnica pequeña de PixiJS:** cargar texturas locales, renderizar una cuadrícula 5 × 3 y validar escritorio, móvil y política de ejecución local.
8. **Migrar la presentación gradualmente a PixiJS:** primero fondo y símbolos, después animación de rodillos y líneas; conservar los controles y datos actuales en HTML.
9. **Integrar, validar y ajustar:** probar selector de juegos, saldos e historiales independientes, compatibilidad móvil, accesibilidad, rendimiento y balance de premios.

La primera entrega de producto debería limitarse a la cuadrícula de 5 × 3, líneas fijas, símbolos definitivos, Wild, Scatter y Free Spins. El bonus y los efectos PixiJS más elaborados pueden añadirse después de estabilizar las reglas y validar la experiencia básica.
