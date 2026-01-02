Esta es una de las discusiones más profundas y valiosas en la ingeniería de software: **¿Debemos usar colaboradores reales o dobles de prueba (mocks/stubs) para dependencias internas?**

Para sustentar el uso de un `validatorMock` frente a desarrolladores que prefieren usar la implementación real, debemos recurrir a los fundamentos de **Clean Architecture**, la teoría de **Testing de Software** (Escuela de Londres vs. Escuela de Chicago) y los **Principios SOLID**.

Aquí tienes el sustento técnico de nivel Senior para defender esta decisión:

---

## 1. El Principio de Inversión de Dependencias (DIP)

Según Uncle Bob en _Clean Architecture_, las capas de alto nivel (Casos de Uso) no deben depender de capas de bajo nivel (Detalles de implementación).

- **El Argumento:** Si usamos la implementación real de `JoiValidator` en el test del Caso de Uso, estamos acoplando el test de la **Lógica de Negocio** a una **Librería de Terceros**.
- **La Consecuencia:** Si Joi cambia su API o decides migrar a Zod, todos los tests de tus Casos de Uso fallarán, aunque la lógica de negocio no haya cambiado. Al usar un `mock`, el test del Caso de Uso solo verifica que "si el validador dice que está mal, el caso de uso reacciona correctamente". Eso es **desacoplamiento real**.

## 2. Definición de "Unidad" (Escuela de Londres vs. Chicago)

Existen dos corrientes principales en TDD:

- **Escuela de Chicago (Classicist):** Valida el estado final. Prefiere usar objetos reales a menos que sea un proceso lento (como DB).
- **Escuela de Londres (Mockist):** Valida el comportamiento y la comunicación entre objetos.

**En Arquitectura Hexagonal, la Escuela de Londres es la norma.** ¿Por qué? Porque el objetivo de la arquitectura es proteger el **Hexágono Interior**. El `Validator` es un **Puerto (Interface)**. Un Unit Test en esta arquitectura debe validar cómo el Caso de Uso interactúa con sus Puertos, no cómo funcionan los Adaptadores.

## 3. El Problema de la "Fragilidad en Cascada"

Si usas la clase real y el esquema de Joi tiene un error de sintaxis, el test del Caso de Uso fallará.

- **Sustento:** Un test unitario debe tener **una sola razón para fallar**. Si el test de `CreateSubscription` falla porque escribiste mal una regla en Joi, el test está "mintiendo" sobre dónde está el error.
- **Solución:** 1. Testeas el `JoiValidator` en su propio test de infraestructura (verificando que las reglas de Joi sean correctas).

2.  Testeas el `UseCase` con un mock (verificando que el flujo de control sea correcto).

## 4. Estabilidad vs. Volatilidad

Robert C. Martin habla sobre el **Principio de Dependencias Estables**. Debemos depender de cosas que cambien menos que nosotros.

- La interfaz `Validator` es **estable** (un método `validate`).
- La librería `Joi` es **volátil** (es código ajeno, sujeto a actualizaciones, parches de seguridad o cambios de breaking changes).
  Al usar un mock, el test del Caso de Uso depende de la interfaz estable, no de la implementación volátil.

---

### Cuadro Comparativo para el Debate Técnico

| Criterio                    | Usar Implementación Real (Joi)                  | Usar Mock/Stub (Puerto)                          |
| --------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| **Tipo de Test**            | Sociable (Test de Integración encubierto)       | Solitario (Unitario puro)                        |
| **Velocidad**               | Más lento (Carga la librería y parsea esquemas) | Instantáneo                                      |
| **Localización de errores** | Difícil (¿Falló la lógica o falló Joi?)         | Precisa (Falló la orquestación)                  |
| **Mantenibilidad**          | Baja (Cambios en Joi rompen tests de negocio)   | Alta (Cambios en Joi solo rompen su propio test) |

---

### ¿Cuál es el "Acuerdo de Paz"?

Para convencer a los desarrolladores escépticos, puedes proponer la **Pirámide de Testing** aplicada a Clean Architecture:

1. **Tests Unitarios (con Mocks):** Para cada Caso de Uso, asegurando que la orquestación es correcta (aquí es donde vive tu `validatorMock`).
2. **Tests de Adaptadores (Reales):** Un test específico para `JoiSubscriptionValidator` que use Joi real para asegurar que el esquema bloquea lo que debe bloquear.
3. **Tests de Integración:** Un test que use ambos reales para asegurar que "los cables están bien conectados".

**Conclusión para tu equipo:** "Hacemos mock del validador en el Caso de Uso porque no estamos testeando _si Joi funciona_, estamos testeando _qué hace nuestro negocio cuando la validación falla_. La corrección del esquema de Joi es responsabilidad de otro test".

¿Te gustaría que diseñáramos un ejemplo de cómo sería ese **Test de Adaptador** para que vean cómo se complementan ambos enfoques?

---

# Fundamentos de Test-Driven Development (TDD)

## Por qué las pruebas deben ejecutarse en aislamiento (Isolation)

---

## 1. ¿Qué es realmente TDD?

**Test-Driven Development (TDD)** no es simplemente “escribir pruebas”.
Es una **técnica de diseño** donde las pruebas:

- Definen el comportamiento esperado
- Guían la estructura del código
- Fuerzan límites claros entre componentes

En TDD:

1. **Red** → el test falla y define el problema
2. **Green** → se implementa lo mínimo para pasar
3. **Refactor** → se mejora el diseño sin cambiar el comportamiento

Si las pruebas **no influyen en el diseño**, no es TDD: es testing tardío.

---

## 2. Primer principio clave: Pruebas en aislamiento

### Definición

Una prueba en aislamiento valida **una sola unidad de comportamiento**, sin depender de:

- Red
- Base de datos
- Sistema de archivos
- APIs externas
- Tiempo
- Implementaciones reales de librerías de terceros

Esto **no es una preferencia**, es una **condición necesaria** para que TDD funcione como técnica de diseño.

---

## 3. ¿Por qué NO usar implementaciones reales de third-party libraries en unit tests?

### Principio 1: Una prueba debe fallar por una sola razón

Si se usa una librería real, una prueba puede fallar por:

- Cambios en la API externa
- Bugs en la librería
- Estado global interno
- Problemas de entorno
- Latencia o I/O oculto

Resultado:
❌ No sabes **qué rompiste realmente**

TDD exige **causalidad clara**.

---

### Principio 2: Las pruebas describen TU contrato, no el de terceros

Una librería externa:

- No fue diseñada por ti
- No está bajo tu control
- Ya tiene su propio set de pruebas

Si la usas directamente en unit tests:

- Acoplas tus tests a detalles internos ajenos
- Duplicas pruebas que no te corresponden

**En TDD solo importa cómo TU código usa la librería**, no cómo la librería funciona internamente.

---

### Principio 3: El aislamiento fuerza buen diseño

Usar stubs, spies o mocks:

- Obliga a definir interfaces claras
- Fomenta inyección de dependencias
- Reduce acoplamiento
- Hace explícitos los límites del sistema

Los tests actúan como **primeros consumidores del diseño**.
Si un test es difícil de escribir sin usar una dependencia real, **el diseño es el problema**, no el test.

---

### Principio 4: Feedback rápido

TDD depende de ciclos rápidos **Red → Green → Refactor**.

Las implementaciones reales suelen:

- Inicializar recursos
- Ejecutar lógica pesada
- Tener I/O implícito

Un **unit test debe ejecutarse en milisegundos**, no en segundos.

Tests lentos ⇒ menos ciclos ⇒ peor diseño.

---

## 4. “Las librerías no deberían mockearse” — Análisis del argumento

### Argumento común

> “Si mockeas una librería, no sabes si funcionará en producción”

### Respuesta técnica

Eso **no es responsabilidad del unit test**.

Para eso existen:

- Integration tests
- Contract tests
- End-to-End tests

Cada tipo de prueba tiene un propósito distinto.
Intentar validar todo en unit tests rompe el diseño y la mantenibilidad.

---

## 5. ¿Cuándo SÍ usar implementaciones reales?

Regla profesional clara:

| Tipo de prueba    | ¿Implementación real? | Objetivo principal |
| ----------------- | --------------------- | ------------------ |
| Unit tests        | ❌ No                 | Diseño y lógica    |
| Integration tests | ✅ Sí                 | Integración real   |
| End-to-End tests  | ✅ Sí                 | Flujo completo     |

**TDD se practica principalmente en el nivel unitario.**

---

## 6. ¿Por qué stubs y spies NO son “hacer trampa”?

En TDD:

- Un **stub** define respuestas esperadas
- Un **spy** valida efectos observables
- Un **mock** define contratos explícitos

No falsean la realidad.
La **modelan de forma controlada** para diseñar correctamente.

La pregunta correcta en TDD no es:

> “¿Funciona con todo el sistema?”

Sino:

> “¿Qué necesito de esta dependencia para cumplir este comportamiento?”

---

## 7. Regla de oro

> **Si un unit test necesita una dependencia real para pasar, el diseño está demasiado acoplado.**

Y una aún más fuerte:

> **Si necesitas defender el uso de librerías reales en unit tests, entonces el test no es unitario.**

---

## 8. Conclusión

Las pruebas en aislamiento:

- No son una moda
- No son dogma
- Son una consecuencia directa de querer:
  - Buen diseño
  - Bajo acoplamiento
  - Feedback rápido
  - Código mantenible

TDD no trata de “probar más”, sino de **diseñar mejor desde el inicio**.

# Ejemplo de TDD en React (ESM)

## MAL vs BIEN (Unit Tests Aislados + Límites Claros)

Este ejemplo muestra un escenario **muy común en React**:

- Un componente obtiene datos desde un servidor (límite externo: `fetch` / HTTP).
- Muestra estados de loading / error / éxito.
- Aplica una pequeña lógica de UI (renderizar una lista).

La pregunta clave es:

> **¿Estamos probando React + nuestra lógica,
> o React + red + implementación real de fetch?**

---

## ✅ Requerimiento de negocio

Construir un componente `<UsersList />` que:

- Al montarse, cargue `/api/users`
- Mientras carga: muestre `"Loading..."`
- En éxito: renderice los nombres de los usuarios
- En error: muestre `"Something went wrong"`

---

## ❌ MAL: Componente acoplado directamente a `fetch`

### ¿Por qué está mal?

- Usa `fetch` global real
- Depende del entorno (jsdom, polyfills, configuración)
- Difícil de controlar errores y tiempos
- Tests frágiles, lentos o inestables
- El componente queda acoplado a detalles de transporte

---

### Implementación (mal)

```jsx
// UsersList.bad.jsx (ESM)
import React, { useEffect, useState } from "react";

export function UsersListBad() {
  const [state, setState] = useState({
    status: "idle",
    users: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, status: "loading" }));
      try {
        const res = await fetch("/api/users"); // ⚠️ dependencia dura
        if (!res.ok) throw new Error("HTTP error");
        const users = await res.json();

        if (!cancelled) setState({ status: "success", users, error: null });
      } catch (err) {
        if (!cancelled) setState({ status: "error", users: [], error: err });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") return <p>Loading...</p>;
  if (state.status === "error") return <p>Something went wrong</p>;

  return (
    <ul>
      {state.users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

---

### Test (mal)

```jsx
// UsersList.bad.test.jsx
import { render, screen } from "@testing-library/react";
import { UsersListBad } from "./UsersList.bad.jsx";

test("renders users", async () => {
  render(<UsersListBad />);

  // ❌ esto falla o se cuelga si fetch no está bien configurado
  expect(await screen.findByText("Loading...")).toBeInTheDocument();
});
```

⚠️ Este test:

- No está aislado
- Depende del entorno
- No es TDD limpio
- Convierte los tests en una batalla con tooling

---

## ✅ BIEN: Inyectar un límite (boundary) y probar en aislamiento

### Principio clave

- Sacar la lógica de red del componente
- Definir una dependencia pequeña: `usersApi`
- El componente depende de una **interfaz**, no de `fetch`
- En tests: se stubbea la interfaz
- En producción: se conecta a fetch/axios

Esto produce tests:

- rápidos
- deterministas
- enfocados en comportamiento de UI
- fáciles de mantener

---

## 1️⃣ Crear un módulo API pequeño (boundary)

```js
// usersApi.js (ESM)
export function createUsersApi({ httpClient }) {
  if (!httpClient?.get) throw new Error("httpClient.get is required");

  return {
    async listUsers() {
      const res = await httpClient.get("/api/users");
      return res.data;
    },
  };
}
```

---

### Adaptador de producción para fetch

```js
// fetchHttpClient.js (ESM)
export const fetchHttpClient = {
  async get(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP error");
    const data = await res.json();
    return { data };
  },
};
```

---

## 2️⃣ El componente depende del boundary, no de fetch

```jsx
// UsersList.jsx (ESM)
import React, { useEffect, useState } from "react";

export function UsersList({ usersApi }) {
  const [state, setState] = useState({ status: "idle", users: [] });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: "loading", users: [] });

      try {
        const users = await usersApi.listUsers();
        if (!cancelled) setState({ status: "success", users });
      } catch {
        if (!cancelled) setState({ status: "error", users: [] });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [usersApi]);

  if (state.status === "loading") return <p>Loading...</p>;
  if (state.status === "error") return <p>Something went wrong</p>;

  return (
    <ul>
      {state.users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

---

## 3️⃣ Tests unitarios (bien) con React Testing Library

> Estos tests **NO necesitan fetch real**.

```jsx
// UsersList.test.jsx (ESM)
import { render, screen } from "@testing-library/react";
import { UsersList } from "./UsersList.jsx";

describe("<UsersList /> (unit)", () => {
  test("muestra loading y luego renderiza usuarios", async () => {
    const usersApi = {
      listUsers: vi.fn().mockResolvedValue([
        { id: "1", name: "Ana" },
        { id: "2", name: "Luis" },
      ]),
    };

    render(<UsersList usersApi={usersApi} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Luis")).toBeInTheDocument();
    expect(usersApi.listUsers).toHaveBeenCalledTimes(1);
  });

  test("muestra UI de error cuando falla el API", async () => {
    const usersApi = {
      listUsers: vi.fn().mockRejectedValue(new Error("boom")),
    };

    render(<UsersList usersApi={usersApi} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });
});
```

> Nota:
>
> - `vi.fn()` es de **Vitest**
> - Si usas Jest, reemplázalo por `jest.fn()`

---

## 4️⃣ Test de integración (opcional y controlado)

Este es el lugar correcto para probar:

> “¿Funciona el boundary con fetch real?”

```js
// usersApi.integration.test.js
import { createUsersApi } from "./usersApi.js";
import { fetchHttpClient } from "./fetchHttpClient.js";

test("integration: usersApi usa el adaptador fetch", async () => {
  const api = createUsersApi({ httpClient: fetchHttpClient });

  // Normalmente aquí usarías MSW para mockear /api/users
  const users = await api.listUsers();

  expect(Array.isArray(users)).toBe(true);
});
```

---

## Lección clave de TDD en React

> **No acoples componentes a detalles de I/O.
> Acóplalos a una interfaz pequeña e inyéctala.**

Esto te da:

- tests unitarios realmente aislados
- mejor diseño de componentes
- refactors seguros (fetch → axios → GraphQL)
- arquitectura más clara

---

Perfecto. Vamos a este paso **clave**, porque aquí es donde TDD deja de verse como “testing” y se entiende como **una herramienta de arquitectura**.

Voy a explicarlo **de forma conceptual, práctica y progresiva**, conectando **TDD → decisiones arquitectónicas**, sin dogma.

---

# Cómo TDD guía la arquitectura (no al revés)

## Idea central (la más importante)

> **En TDD no diseñas la arquitectura primero.
> La arquitectura emerge como consecuencia de escribir tests fáciles.**

Si un test es:

- difícil de escribir
- lento
- frágil
- dependiente de infraestructura

👉 eso es una **señal arquitectónica**, no un problema de testing.

---

## 1️⃣ TDD fuerza límites claros (Boundaries)

### Qué ocurre al escribir el primer test

Cuando escribes un test primero, inevitablemente te preguntas:

- ¿Qué necesito para ejecutar este comportamiento?
- ¿De qué depende realmente esta lógica?
- ¿Qué puedo controlar desde el test?

Ese razonamiento **obliga a separar**:

- lógica de negocio
- infraestructura (HTTP, DB, tiempo, storage, frameworks)

### Resultado arquitectónico

Aparecen **límites explícitos**:

```
[ UI / Controller ]
        |
[ Application / Use Case ]
        |
[ Boundary / Port ]
        |
[ Infrastructure ]
```

No porque “Clean Architecture lo dice”,
sino porque **sin esos límites los tests son imposibles o horribles**.

---

## 2️⃣ TDD empuja hacia Dependency Inversion (SOLID)

### Observación clave

En TDD:

- el test necesita controlar las dependencias
- lo que se controla debe **entrar**, no crearse internamente

Eso conduce naturalmente a:

- inyección de dependencias
- inversión de dependencias (DIP)

### Ejemplo conceptual

❌ Arquitectura guiada por implementación:

```js
function service() {
  const db = new RealDatabase();
  return db.save();
}
```

Imposible de testear en aislamiento.

✅ Arquitectura guiada por TDD:

```js
function createService({ database }) {
  return {
    execute(data) {
      return database.save(data);
    },
  };
}
```

👉 **No es teoría SOLID**
👉 Es una consecuencia directa de querer tests simples

---

## 3️⃣ TDD define qué es “core” y qué es “detalle”

Una de las mayores contribuciones de TDD a la arquitectura es esta pregunta:

> **¿Qué parte del sistema merece tests unitarios rápidos?**

Respuesta implícita:

- lo que cambia por reglas de negocio
- lo que genera valor
- lo que debe ser estable

Eso se convierte en el **core del sistema**.

Todo lo demás:

- frameworks
- HTTP
- ORM
- UI
- storage

👉 se vuelve **detalle intercambiable**

### Arquitectura resultante

```
Core (altamente testeado, rápido)
--------------------------------
- reglas
- casos de uso
- validaciones

Outer layers (menos tests, más integración)
------------------------------------------
- React
- Express
- DB
- APIs externas
```

TDD **protege el core** y empuja los detalles hacia afuera.

---

## 4️⃣ TDD reduce acoplamiento (de verdad)

### Señal clara de acoplamiento

Si al escribir un test necesitas:

- mockear medio sistema
- inicializar 10 cosas
- conocer detalles internos

👉 **acoplamiento excesivo**

### Qué hace TDD

- penaliza el acoplamiento
- recompensa la simplicidad
- hace evidente cuándo una clase hace demasiado

Esto lleva a:

- clases pequeñas
- funciones con una responsabilidad
- composición en lugar de herencia

No por “clean code”,
sino porque **si no lo haces, el test se vuelve inmanejable**.

---

## 5️⃣ TDD guía la forma de los módulos

### Pregunta típica en TDD

> “¿Qué necesito importar para probar este comportamiento?”

Si la respuesta es:

- muchos imports
- dependencias cruzadas
- módulos circulares

👉 el diseño es incorrecto

### Arquitectura emergente

TDD favorece:

- módulos con una sola razón de cambio
- dependencias unidireccionales
- árboles de dependencias, no grafos caóticos

Esto encaja perfectamente con:

- feature-based architecture
- vertical slices
- bounded contexts

---

## 6️⃣ TDD define niveles de prueba → niveles de arquitectura

Sin que nadie lo “imponga”, aparece esto:

| Nivel de test | Nivel arquitectónico |
| ------------- | -------------------- |
| Unit          | Core / Domain        |
| Integration   | Boundaries           |
| E2E           | Sistema completo     |

Si intentas:

- probar DB en unit tests → arquitectura incorrecta
- probar reglas en E2E → feedback lento

👉 **Los niveles de test revelan los niveles del sistema**

---

## 7️⃣ TDD evita Big Design Up Front (BDUF)

### Diferencia clave

❌ BDUF:

- Diseñas toda la arquitectura
- Luego escribes código
- Luego adaptas tests

✅ TDD:

- Diseñas un comportamiento
- El diseño mínimo emerge
- Refactorizas cuando hay presión real

La arquitectura **evoluciona con evidencia**, no con suposiciones.

---

## 8️⃣ Señales arquitectónicas que TDD te da gratis

Cuando haces TDD correctamente, aparecen señales claras:

| Señal en tests  | Significado arquitectónico  |
| --------------- | --------------------------- |
| Tests difíciles | Acoplamiento                |
| Mucho mocking   | Clases demasiado grandes    |
| Tests lentos    | Infraestructura filtrándose |
| Tests frágiles  | Dependencias implícitas     |
| Tests simples   | Buen diseño                 |

Los tests se convierten en **sensores de diseño**.

---

## 9️⃣ Regla práctica (muy importante)

> **Si para testear algo necesitas conocer demasiados detalles del sistema, la arquitectura está fallando.**

Y otra aún más fuerte:

> **La arquitectura correcta hace que los tests se escriban solos.**

---

## 1️⃣0️⃣ Resumen corto

- TDD no “aplica” una arquitectura
- TDD **revela** la arquitectura correcta
- Las decisiones no se toman por moda
- Se toman porque hacen los tests:

  - simples
  - rápidos
  - aislados
  - expresivos

---

# Anti-patrones Arquitectónicos Detectados por TDD

TDD no es solo una técnica de desarrollo — es una **herramienta de diagnóstico arquitectónico**.
Cuando se practica correctamente, expone problemas de arquitectura **muy temprano**, incluso antes de que aparezcan bugs en producción.

A continuación se presentan los **anti-patrones arquitectónicos más comunes** que TDD revela de forma confiable, **por qué ocurren** y **cómo TDD empuja hacia un mejor diseño**.

---

## 1. “God Object” (Clases Grandes que lo Saben Todo)

### Síntomas en TDD

- Los tests requieren muchos mocks/stubs
- La preparación del test es larga y compleja
- Un pequeño cambio rompe muchos tests

### Olor arquitectónico (Architectural Smell)

- Demasiadas responsabilidades
- Lógica de negocio + orquestación + infraestructura mezcladas
- Viola el principio de Responsabilidad Única (SRP)

### Ejemplo de olor arquitectónico (Architectural Smell)

```js
class OrderService {
  constructor(db, mailer, payment, logger, cache) { ... }
  processOrder() { ... }
}
```

### Lo que TDD revela

Escribir tests se siente doloroso y verboso.

👉 Respuesta de TDD:

- Separar responsabilidades
- Extraer colaboradores pequeños
- Mover la lógica a unidades enfocadas

**Presión de TDD → objetos pequeños y componibles**

---

## 2. Dependencias Codificadas (Sin Inyección de Dependencias)

### Síntomas en TDD

- Imposible testear sin DB / API reales
- Necesidad de “hackear” globals
- Tests dependientes del entorno

### Olor arquitectónico (Architectural Smell)

- Alto acoplamiento
- Sin inversión de dependencias
- Dependencias ocultas

### Ejemplo de olor (Architectural Smell)

```js
function sendEmail() {
  const client = new SmtpClient();
  client.send(...);
}
```

### Lo que TDD revela

No puedes sustituir dependencias en los tests.

👉 Respuesta de TDD:

- Inyectar dependencias
- Depender de interfaces, no de implementaciones

```js
function createMailer({ smtpClient }) {
  return {
    send(email) {
      smtpClient.send(email);
    },
  };
}
```

**Presión de TDD → Inversión de Dependencias (SOLID)**

---

## 3. Infraestructura Filtrándose al Core

### Síntomas en TDD

- Unit tests que tocan DB, HTTP o filesystem
- Tests lentos
- Fallos intermitentes

### Olor arquitectónico (Architectural Smell)

- La lógica de negocio depende de infraestructura
- Las reglas no están aisladas

### Ejemplo de olor (Architectural Smell)

```js
function calculateInvoice() {
  const data = db.query(...);
  return data.total * TAX;
}
```

### Lo que TDD revela

No puedes testear reglas sin infraestructura.

👉 Respuesta de TDD:

- Extraer la lógica de negocio
- Empujar infraestructura detrás de límites

**Presión de TDD → Arquitectura Limpia / Hexagonal**

---

## 4. Sobre-mocking (Mockear Todo)

### Síntomas en TDD

- Tests que validan detalles de implementación
- Refactors rompen muchos tests
- Tests que parecen scripts, no comportamientos

### Olor arquitectónico (Architectural Smell)

- Límites mal definidos
- Tests acoplados a internals
- Testing por miedo

### Ejemplo de olor arquitectónico (Architectural Smell)

```js
expect(repo.save).toHaveBeenCalled();
expect(logger.log).toHaveBeenCalled();
expect(cache.set).toHaveBeenCalled();
```

### Lo que TDD revela

Tests frágiles que bloquean refactors.

👉 Corrección desde TDD:

- Mockear solo **límites**
- Afirmar **comportamiento observable**, no llamadas internas

**Presión de TDD → diseño orientado a comportamiento**

---

## 5. Modelo de Dominio Anémico

### Síntomas en TDD

- Tests centrados en mover datos
- Lógica dispersa en servicios
- Objetos que solo contienen datos

### Olor arquitectónico (Architectural Smell)

- Sin comportamiento en el dominio
- Reglas en código procedural

### Ejemplo de olor (Architectural Smell)

```js
function applyDiscount(order) {
  if (order.total > 100) order.discount = 0.1;
}
```

### Lo que TDD revela

Difícil testear comportamiento coherente.

👉 Respuesta de TDD:

- Mover comportamiento a objetos de dominio

```js
class Order {
  applyDiscount() { ... }
}
```

**Presión de TDD → dominios ricos**

---

## 6. Arquitectura “Test-After” (Tests como Pensamiento Posterior)

### Síntomas en TDD

- Tests añadidos después
- Código resistente al testing
- Muchos workarounds en tests

### Olor arquitectónico (Architectural Smell)

- Diseño sin testabilidad
- Complejidad oculta
- Arquitectura rígida

### Lo que TDD revela

Agregar tests tarde es costoso.

👉 Respuesta de TDD:

- Diseñar test-first
- Dejar que los tests moldeen el diseño

**Presión de TDD → arquitectura evolutiva**

---

## 7. Exceso de Tests End-to-End

### Síntomas en TDD

- Feedback lento
- Fallos difíciles de depurar
- Pocos unit tests

### Olor arquitectónico (Architectural Smell)

- Falta de límites claros
- Miedo a refactorizar
- Modularidad débil

### Lo que TDD revela

Se está compensando una mala arquitectura.

👉 Respuesta de TDD:

- Reforzar unit e integration tests
- Mover complejidad al core testeable

**Presión de TDD → pirámide de tests balanceada**

---

## 8. Estado Mutable Compartido

### Síntomas en TDD

- Tests pasan solos pero fallan en conjunto
- Tests dependientes del orden
- Fallos aleatorios

### Olor arquitectónico (Architectural Smell)

- Estado global
- Efectos secundarios ocultos
- Comportamiento no determinista

### Ejemplo de olor (Architectural Smell)

```js
let config = {};
export function setConfig(c) {
  config = c;
}
```

### Lo que TDD revela

Tests inestables (flaky).

👉 Respuesta de TDD:

- Hacer el estado explícito
- Pasar estado y dependencias explícitamente

**Presión de TDD → diseño funcional y explícito**

---

## 9. Dependencias Circulares

### Síntomas en TDD

- Dificultad para aislar módulos
- Mocking complejo
- Imports enredados

### Olor arquitectónico (Architectural Smell)

- Límites de módulo pobres
- Dependencias bidireccionales

### Lo que TDD revela

Los tests requieren demasiado contexto.

👉 Respuesta de TDD:

- Romper ciclos
- Introducir puertos / interfaces

**Presión de TDD → flujo de dependencias unidireccional**

---

## 10. Regla de Oro (Diagnóstico Arquitectónico)

> **Si escribir un unit test es más difícil que escribir el código productivo,
> la arquitectura está fallando.**

Y una aún más fuerte:

> **La arquitectura correcta hace que el camino correcto sea el más fácil de testear.**

---

## Resumen

TDD expone problemas arquitectónicos temprano porque:

- Penaliza el acoplamiento
- Castiga dependencias ocultas
- Recompensa simplicidad y claridad

No solo prueba código —
**enseña a la arquitectura cómo mejorar**.

---

**Clean Architecture** y **Hexagonal Architecture (Ports & Adapters)** son dos formas muy relacionadas de diseñar sistemas para que sean **fáciles de probar**, **fáciles de cambiar** y **resistentes al acoplamiento** con frameworks, bases de datos y servicios externos.

---

## 1) ¿Qué problema vienen a resolver?

En muchos proyectos el código termina así:

- La lógica de negocio depende de Express/React
- La lógica de negocio depende del ORM/DB
- La lógica de negocio depende de fetch/axios/Stripe/SendGrid
- Todo está mezclado, y cambiar algo “pequeño” rompe muchas cosas

Eso genera:

- tests lentos y frágiles
- refactors dolorosos
- lock-in a herramientas (ORM, DB, framework)
- dificultad para aislar el “core” del sistema

**Clean/Hexagonal** buscan esto:

> Mantener la lógica de negocio **independiente** de detalles externos.

---

## 2) Clean Architecture: idea central

Clean Architecture (popularizada por Robert C. Martin) propone separar el sistema en **capas concéntricas**, donde:

✅ **Las dependencias siempre apuntan hacia adentro** (Dependency Rule).
El centro es lo más importante y estable; lo externo cambia más.

### Capas típicas

1. **Entities (Dominio)**

   - Reglas de negocio puras
   - Modelos con comportamiento (no solo datos)
   - Estables, deberían cambiar poco

2. **Use Cases (Application / Interactors)**

   - Orquestan reglas del dominio para cumplir un caso de uso
   - Ej: “Registrar usuario”, “Procesar orden”, “Generar factura”
   - Definen el flujo del negocio (inputs/outputs)

3. **Interface Adapters**

   - Traducen datos entre mundo externo y el core
   - Controladores (Express), Presenters, Repositorios
   - Mapean DTOs, validan inputs, formatean outputs

4. **Frameworks & Drivers**

   - React, Express, DB, ORM, servicios externos
   - Son detalles reemplazables

### Visual rápido

```
[ Frameworks & Drivers ]  -> React, Express, DB, HTTP
        |
[ Interface Adapters ]    -> controllers, presenters, repositories
        |
[ Use Cases ]             -> application logic (orchestration)
        |
[ Entities ]              -> domain rules (core)
```

**Regla de oro:** lo de afuera puede cambiar sin romper lo de adentro.

---

## 3) Hexagonal Architecture: idea central

Hexagonal Architecture (Alistair Cockburn) describe el sistema como un **hexágono** (metáfora) donde el núcleo se comunica con el exterior mediante **puertos** y **adaptadores**.

### Conceptos clave

- **Core**: tu lógica (dominio + casos de uso)
- **Ports (Puertos)**: interfaces que el core define para comunicarse
- **Adapters (Adaptadores)**: implementaciones concretas de esos puertos

Hay dos tipos de interacciones:

### A) Inbound (entrada al sistema)

Quién llama al core:

- HTTP controller
- UI (React)
- CLI
- Cron job
- Queue consumer

### B) Outbound (salida del sistema)

Lo que el core necesita:

- DB
- Email service
- Payment gateway
- External API

### Visual mental

```
          Inbound adapters
      (HTTP / UI / CLI / Jobs)
                 |
             [  CORE  ]
                 |
          Outbound adapters
   (DB / Email / Payments / APIs)
```

El core **no conoce** Postgres, Express, Stripe, etc.
Solo conoce **interfaces**.

---

## 4) ¿En qué se parecen y en qué se diferencian?

### Se parecen en lo esencial

Ambas buscan:

- independencia del framework
- boundaries claros
- inversión de dependencias
- mejor testabilidad
- facilidad para cambiar infraestructura

### Diferencia principal (práctica)

- **Clean Architecture** suele explicarse como **capas** (circles).
- **Hexagonal** se explica como **puertos/adaptadores** (boundary-driven).

En la práctica, muchas implementaciones modernas son una mezcla:
**Clean + Hex (Ports & Adapters)**.

---

## 5) Regla de dependencias (la más importante)

> **El core no depende de nada externo.
> Lo externo depende del core.**

Eso se logra con:

- interfaces/contratos
- dependency injection
- composición en el borde (composition root)

---

## 6) Ejemplo corto (para hacerlo tangible)

### Caso de uso (core) — no sabe de DB ni email

```js
export function createRegisterUser({ userRepo, hasher, notifier }) {
  return async ({ email, password }) => {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw new Error("EmailAlreadyTaken");

    const passwordHash = await hasher.hash(password);
    const user = await userRepo.save({ email, passwordHash });

    await notifier.userRegistered({ id: user.id, email: user.email });

    return { id: user.id, email: user.email };
  };
}
```

### Adaptador DB (afuera)

```js
export function createPgUserRepo({ db }) {
  return {
    async findByEmail(email) {
      /* SQL */
    },
    async save(data) {
      /* SQL */
    },
  };
}
```

### Composición (borde)

```js
const registerUser = createRegisterUser({
  userRepo: createPgUserRepo({ db }),
  hasher: bcryptHasher,
  notifier: createNotifier({ mailer }),
});
```

---

## 7) Beneficios reales

- ✅ Unit tests rápidos y aislados (core)
- ✅ Menos flakiness en CI
- ✅ Refactor seguro y frecuente
- ✅ Menos “lock-in” a frameworks/DB/proveedores
- ✅ Evolución por features sin romper todo
- ✅ Mejor separación entre “qué” y “cómo”

---

## 8) Malentendidos comunes

### “Esto es demasiado para apps pequeñas”

No necesariamente. Puedes aplicar lo mínimo:

- 1 use case
- 1 port
- 1 adapter
  Y crecer solo cuando el proyecto lo pida.

### “Esto es puro boilerplate”

Si lo haces sin necesidad, sí.
Pero si TDD te está “doliento” por dependencias reales y acoplamiento, entonces no es boilerplate: es **control de complejidad**.

---

## 9) Regla práctica para saber si lo necesitas

Si te pasa esto:

- tus unit tests requieren DB/HTTP
- tienes que mockear demasiadas cosas
- cambiar la DB o el proveedor de email rompe el core
- todo está “pegado” a frameworks

👉 Clean/Hex te va a ayudar mucho.

---

Si quieres, el siguiente paso lo hacemos ultra práctico:

- Te propongo una estructura de carpetas (feature-based) para Node + React
- Te muestro qué va en **core**, qué va en **adapters**, y qué en **composition root**
- Y definimos una estrategia de tests (unit/integration/e2e) alineada con Clean/Hex

---

# Cómo TDD guía Clean Architecture / Hexagonal en la práctica

La manera más útil de entender esto es así:

> **TDD no “impone” Clean Architecture o Hexagonal.
> TDD te empuja hacia ellas porque hacen que los tests unitarios sean fáciles, rápidos y estables.**

Cuando intentas hacer TDD en serio, empiezan a doler ciertas cosas:

- dependencias reales (DB, HTTP, filesystem)
- frameworks metidos en tu lógica
- funciones “grandes” con demasiadas responsabilidades

El dolor de los tests es una señal de diseño.
Clean/Hexagonal son respuestas prácticas a ese dolor.

---

## 1) La idea base: Puertos y Adaptadores (Ports & Adapters)

**Hexagonal =** tu lógica central (Core) no depende de infraestructura.

### Estructura mental

- **Core (Dominio / Casos de uso)**: reglas de negocio, decisiones, validaciones
- **Ports (Puertos)**: interfaces que el core necesita (persistencia, pagos, email)
- **Adapters (Adaptadores)**: implementaciones concretas (Postgres, Stripe, SendGrid, fetch/axios)
- **Drivers**: UI/HTTP que invoca los casos de uso (Express controller, React event handler)

Visualmente:

```

```

        [ React / Express / CLI ]
                  |
            (Driver / Inbound)
                  |
            [ Use Case / App ]
                  |
              (Outbound Port)
                  |

[ Adapter: DB / HTTP / Queue / Email ]

```

```

TDD te obliga a crear esos **puertos** porque si no, tus unit tests son un caos.

---

## 2) Ejemplo práctico: “Registrar usuario” (Node.js)

### Requerimiento de negocio

- Registrar un usuario con `email` y `password`
- Si el email ya existe → error `EmailAlreadyTaken`
- Si no existe:
  - guardar usuario (hash de password)
  - emitir evento `UserRegistered` (opcional)
  - devolver `{ id, email }`

---

## 3) ❌ Diseño NO guiado por TDD (acoplado)

Esto suele pasar cuando se empieza por implementación:

```js
// registerUser.bad.js
import bcrypt from "bcrypt";
import { db } from "./db.js"; // implementación real
import { sendWelcomeEmail } from "./mailer.js"; // implementación real

export async function registerUser(email, password) {
  const existing = await db.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rowCount > 0) throw new Error("EmailAlreadyTaken");

  const hash = await bcrypt.hash(password, 10);

  const result = await db.query(
    "INSERT INTO users(email, password_hash) VALUES($1,$2) RETURNING id,email",
    [email, hash]
  );

  await sendWelcomeEmail(email);

  return result.rows[0];
}
```

### ¿Qué pasa con TDD aquí?

Para testear:

- necesitas DB
- necesitas configurar bcrypt
- necesitas mailer
- tus tests son lentos, frágiles y dolorosos

👉 El test te “grita”: **necesitas límites**.

---

## 4) ✅ Diseño guiado por TDD (Clean/Hexagonal emergente)

TDD te empuja a separar:

- **Use case** (core): orquesta reglas
- **Ports**: `userRepo`, `hasher`, `notifier`

### 4.1 Definir el caso de uso (Core)

```js
// registerUser.js (Core / Use Case)
export class EmailAlreadyTaken extends Error {}

export function createRegisterUser({ userRepo, hasher, notifier }) {
  if (!userRepo?.findByEmail || !userRepo?.save) {
    throw new Error("userRepo with findByEmail() and save() is required");
  }
  if (!hasher?.hash) throw new Error("hasher.hash() is required");
  if (!notifier?.userRegistered)
    throw new Error("notifier.userRegistered() is required");

  return async function registerUser({ email, password }) {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw new EmailAlreadyTaken();

    const passwordHash = await hasher.hash(password);

    const user = await userRepo.save({ email, passwordHash });

    await notifier.userRegistered({ id: user.id, email: user.email });

    return { id: user.id, email: user.email };
  };
}
```

✅ No DB aquí
✅ No bcrypt aquí
✅ No email provider aquí
✅ Solo reglas y orquestación

Eso es Clean/Hexagonal en acción.

---

## 5) Unit tests primero (TDD real)

Estos tests son **rápidos** y **deterministas** porque stubbeas puertos:

```js
// registerUser.test.js
import { createRegisterUser, EmailAlreadyTaken } from "./registerUser.js";

describe("RegisterUser (use case)", () => {
  test("throws EmailAlreadyTaken if email exists", async () => {
    const userRepo = {
      findByEmail: jest.fn().mockResolvedValue({ id: "u1", email: "a@a.com" }),
      save: jest.fn(),
    };
    const hasher = { hash: jest.fn() };
    const notifier = { userRegistered: jest.fn() };

    const registerUser = createRegisterUser({ userRepo, hasher, notifier });

    await expect(
      registerUser({ email: "a@a.com", password: "123" })
    ).rejects.toBeInstanceOf(EmailAlreadyTaken);

    expect(userRepo.save).not.toHaveBeenCalled();
    expect(notifier.userRegistered).not.toHaveBeenCalled();
  });

  test("saves user with hashed password and notifies", async () => {
    const userRepo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue({ id: "u2", email: "b@b.com" }),
    };
    const hasher = { hash: jest.fn().mockResolvedValue("hashed-123") };
    const notifier = { userRegistered: jest.fn().mockResolvedValue(undefined) };

    const registerUser = createRegisterUser({ userRepo, hasher, notifier });

    const result = await registerUser({ email: "b@b.com", password: "pwd" });

    expect(hasher.hash).toHaveBeenCalledWith("pwd");
    expect(userRepo.save).toHaveBeenCalledWith({
      email: "b@b.com",
      passwordHash: "hashed-123",
    });
    expect(notifier.userRegistered).toHaveBeenCalledWith({
      id: "u2",
      email: "b@b.com",
    });
    expect(result).toEqual({ id: "u2", email: "b@b.com" });
  });
});
```

Fíjate:

- no hay infraestructura
- no hay mocking masivo
- el diseño es claro
- los tests describen el comportamiento

👉 Eso es TDD guiando arquitectura.

---

## 6) Adaptadores (Infrastructure) conectan el mundo real

Los adaptadores implementan los puertos.

### 6.1 Adapter: hasher con bcrypt

```js
// bcryptHasher.js
import bcrypt from "bcrypt";

export const bcryptHasher = {
  async hash(password) {
    return bcrypt.hash(password, 10);
  },
};
```

### 6.2 Adapter: userRepo con Postgres (ejemplo)

```js
// pgUserRepo.js
export function createPgUserRepo({ db }) {
  return {
    async findByEmail(email) {
      const res = await db.query(
        "SELECT id, email FROM users WHERE email = $1",
        [email]
      );
      return res.rowCount ? res.rows[0] : null;
    },
    async save({ email, passwordHash }) {
      const res = await db.query(
        "INSERT INTO users(email, password_hash) VALUES($1,$2) RETURNING id,email",
        [email, passwordHash]
      );
      return res.rows[0];
    },
  };
}
```

### 6.3 Adapter: notifier (email/event)

```js
// notifier.js
export function createNotifier({ mailer }) {
  return {
    async userRegistered({ email }) {
      await mailer.sendWelcome(email);
    },
  };
}
```

---

## 7) Composición en el borde (Composition Root)

En Clean/Hexagonal, el “ensamble” se hace en el borde (por ejemplo en Express):

```js
// app.js (Composition Root)
import { createRegisterUser } from "./registerUser.js";
import { bcryptHasher } from "./bcryptHasher.js";
import { createPgUserRepo } from "./pgUserRepo.js";
import { createNotifier } from "./notifier.js";
import { db } from "./db.js";
import { mailer } from "./mailer.js";

const userRepo = createPgUserRepo({ db });
const notifier = createNotifier({ mailer });

export const registerUser = createRegisterUser({
  userRepo,
  hasher: bcryptHasher,
  notifier,
});
```

Aquí sí está permitido tener infraestructura, porque **este módulo no es el core**.

---

## 8) Qué te da esto en la vida real

- Unit tests súper rápidos (core)
- Integración probada por separado (adapters)
- Refactors seguros
- Cambiar DB/email provider sin tocar el core
- CI más estable y rápido

---

## 9) Regla práctica para aplicar esto con TDD

> **Escribe primero el test del caso de uso.
> Si para pasarlo necesitas DB/HTTP/frameworks, crea un puerto y stubbealo.
> Luego crea adaptadores reales y pruébalos con integration tests.**

---

## Próximo paso sugerido

Si te parece, el siguiente paso puede ser:

1. ✅ El mismo ejemplo pero en **React** (use case + adapter + UI)
2. ✅ Cómo estructurar carpetas por feature (vertical slice) con Clean/Hex
3. ✅ Qué integration tests escribir para `pgUserRepo` y `notifier`
4. ✅ Cómo encaja esto con CI/CD (pipeline + coverage + test splitting)
