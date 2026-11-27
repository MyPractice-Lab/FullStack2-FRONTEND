# Documento de integración — The Zone

**Asignatura:** DSY1104 Desarrollo Fullstack II · Evaluación Parcial 3
**Equipo:** Maximiliano Provoste · Patricio Ormazabal · Basthian Vernal

---

## 1. Qué se integró y por qué

Hasta la Evaluación Parcial 2, la tienda **The Zone** era una aplicación React que guardaba todo en
`localStorage`. Eso tenía dos problemas de fondo: los datos vivían en el navegador de cada persona
(dos clientes nunca veían el mismo catálogo) y no existía seguridad real, porque el rol de la cuenta
era un campo más dentro de un JSON que el propio usuario podía editar desde la consola.

En esta entrega se construyó un **backend Spring Boot** con base de datos MySQL, y el frontend pasó
a consumirlo por **API REST**. La capa `src/data/` del frontend se conservó como punto único de
contacto con el servidor: cambió su implementación, no su rol dentro de la arquitectura.

## 2. Arquitectura

```
┌──────────────────────┐   HTTP/JSON    ┌──────────────────────┐   JDBC    ┌─────────┐
│  Frontend React 19   │ ─────────────> │  Backend Spring Boot │ ────────> │  MySQL  │
│  Vite + Bootstrap    │ <───────────── │  4.0.10 · Java 17    │ <──────── │   8.0   │
└──────────────────────┘  Bearer JWT    └──────────────────────┘           └─────────┘
        │                                         │
   localStorage:                            Capas internas:
   token + carrito                    web → servicio → repositorio → modelo
```

**Frontend** (repositorio `FullStack2`, rama de la EP3)

| Carpeta | Responsabilidad |
|---|---|
| `src/api/cliente.js` | Único lugar donde se llama a `fetch`. Arma la URL, adjunta el token, traduce los errores HTTP a excepciones `ErrorApi`. |
| `src/api/token.js` | Guarda, lee y borra el JWT en `localStorage`. |
| `src/data/` | Un módulo por recurso (`productos`, `categorias`, `usuarios`, `ordenes`, `sesion`). Expone funciones con nombres de dominio que devuelven promesas. |
| `src/hooks/usePeticion.js` | Hook que resuelve una promesa y entrega `{ datos, cargando, error, recargar }`. Evita repetir el mismo `useEffect` en cada página. |
| `src/contexto/` | `SesionContexto` (quién está conectado), `CatalogoContexto` (categorías, que casi todas las pantallas necesitan) y `CarritoContexto`. |

**Backend** (repositorio nuevo, proyecto `tienda`)

| Paquete | Responsabilidad |
|---|---|
| `modelo` | Entidades JPA: `Categoria`, `Producto`, `Usuario`, `Orden`, `OrdenLinea`, más los embebidos `Cliente`, `Direccion` y `Totales`. |
| `repositorio` | Interfaces `JpaRepository` con las consultas derivadas que se necesitan. |
| `dto` | Records de entrada y salida. El modelo no se expone nunca directamente. |
| `servicio` | Lógica de negocio y transacciones. |
| `web` | Controllers REST, documentación OpenAPI y el manejador global de errores. |
| `seguridad` | Emisión y validación de JWT, `UserDetailsService` y las reglas de acceso. |
| `config` | OpenAPI y el cargador de datos iniciales. |

## 3. Flujo de datos de una petición

Tomemos la pantalla de catálogo como ejemplo completo:

1. `Productos.jsx` llama a `usePeticion(listarProductos)`.
2. `listarProductos()` (en `src/data/productos.js`) llama a `api.obtener('/productos')`.
3. `cliente.js` resuelve la URL base (`VITE_API_URL`), agrega la cabecera `Authorization` si hay
   token guardado y hace el `fetch`.
4. En el backend, `ProductoControlador.listar()` recibe la petición. La cadena de filtros de
   seguridad ya decidió que `GET /api/productos` es público.
5. `ProductoServicio.listar()` consulta por el repositorio y convierte cada entidad a `ProductoDTO`
   con `Mapeador`.
6. La respuesta vuelve como JSON; `cliente.js` la parsea y `usePeticion` la deja en `datos`.
7. Si algo falla, `cliente.js` lanza `ErrorApi` con el mensaje que escribió el backend, y la página
   lo muestra en el componente `EstadoPeticion` sin romperse.

**Decisión de diseño importante:** el frontend **no envía precios ni totales**. Al pagar manda solo
`{ id, cantidad }` por línea; el servidor busca cada producto, aplica el precio de oferta si
corresponde, calcula subtotales, IVA y despacho, y recién entonces guarda. Así el total no se puede
manipular desde el navegador, que era exactamente lo que pasaba en la EP2.

## 4. Endpoints

Todos bajo `/api`. La documentación interactiva queda en `http://localhost:8080/swagger-ui.html`.

### Autenticación

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| POST | `/auth/login` | público | Valida correo y clave; devuelve el JWT y los datos de la cuenta. |
| POST | `/auth/registro` | público | Crea un cliente y lo deja con sesión iniciada. El rol queda fijo en `cliente`. |
| GET | `/auth/yo` | autenticado | Devuelve la cuenta dueña del token. El frontend lo usa al recargar la página. |

### Categorías y productos

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/categorias` · `/categorias/{slug}` | público |
| POST · PUT · DELETE | `/categorias` · `/categorias/{id}` | administrador |
| GET | `/productos` (acepta `?categoria=slug`) · `/productos/{id}` | público |
| GET | `/productos/criticos` | administrador |
| POST · PUT · DELETE | `/productos` · `/productos/{id}` | administrador |

### Usuarios

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/usuarios` | administrador |
| GET · PUT | `/usuarios/{id}` | autenticado, solo la cuenta propia salvo que sea administrador |
| POST | `/usuarios` | administrador |
| DELETE | `/usuarios/{id}` | administrador |

### Órdenes

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/ordenes` | público (un invitado puede comprar; si viene token, la orden queda asociada) |
| GET | `/ordenes` | administrador |
| GET | `/ordenes/mias` | autenticado |
| GET | `/ordenes/{codigo}` | público (lo necesita la boleta del invitado tras pagar) |
| PATCH | `/ordenes/{codigo}/estado` | administrador |

## 5. Seguridad

**Autenticación con JWT.** `POST /api/auth/login` verifica la clave con `BCryptPasswordEncoder` —
las claves se guardan hasheadas, nunca en claro— y firma un token HS512 con el asunto (el correo) y
el rol como *claim*. El token dura 120 minutos, configurable en `tienda.jwt.duracion-minutos`.

**Validación en cada petición.** `JwtFiltro` corre antes del filtro de autenticación estándar, lee
la cabecera `Authorization: Bearer <token>`, verifica la firma y la expiración, carga la cuenta y
deja la autenticación en el contexto de seguridad. Si el token es inválido o la cuenta está
desactivada, la petición sigue como anónima y las reglas de acceso la rechazan.

**Sesión sin estado.** El backend no guarda sesiones (`SessionCreationPolicy.STATELESS`): el token
es la única prueba de identidad, así que la API puede escalar a varias instancias sin estado
compartido.

**Roles.** Cada usuario tiene rol `administrador` o `cliente`, que se traduce a la autoridad
`ROLE_ADMINISTRADOR` o `ROLE_CLIENTE`. Las reglas de la cadena de filtros se declaran por método y
ruta, de lo más específico a lo más general.

**Dos capas de restricción, a propósito.** El frontend esconde el panel de administración con
`RutaAdmin.jsx`, y el backend lo bloquea con `hasRole("ADMINISTRADOR")`. La del frontend es
comodidad —no mostrar botones que no sirven—; la del backend es la que de verdad protege, porque un
cliente puede editar el `localStorage` para fingir ser administrador, pero no puede falsificar la
firma del token. Escribir un rol falso en el navegador no abre nada: el servidor valida el token,
no lo que diga la pantalla.

**Protecciones extra en los controllers.** Un cliente autenticado solo puede ver y editar su propia
cuenta (`exigirPropiaOAdministrador`) y no puede ascenderse de rol: aunque mande `rol:
administrador` en el cuerpo, el controller descarta ese campo cuando quien pide no es administrador.

**CORS.** Solo se aceptan los orígenes declarados en `tienda.cors.origenes`, con los métodos y
cabeceras que la aplicación usa. En desarrollo el frontend además pasa por el proxy de Vite, así
que las peticiones salen del mismo origen.

**CSRF deshabilitado.** Es correcto para una API sin estado que se autentica por cabecera y no por
cookie: sin cookie de sesión no hay petición que el navegador pueda enviar automáticamente en
nombre del usuario.

## 6. Gestión de la sesión en el frontend

El problema a resolver es que al recargar la página React pierde todo su estado.

1. Al iniciar sesión se guardan dos cosas en `localStorage`: el **token** (`zone_token`) y los
   **datos visibles** de la cuenta (`zone_sesion`), sin la clave.
2. Al montar, `SesionContexto` lee esos datos para pintar la interfaz de inmediato y, en paralelo,
   llama a `GET /api/auth/yo` para **revalidar** contra el servidor.
3. Si el token sigue siendo válido, refresca los datos; si expiró o fue manipulado, borra todo y
   deja la sesión cerrada.
4. Mientras revalida expone `revalidando: true`, y `RutaAdmin` lo usa para no expulsar al
   administrador a `/login` durante ese instante.

Esto es lo que hace que la sesión sobreviva a un F5 **sin confiar en lo guardado**: lo guardado
sirve para la primera pintada, pero la verdad la tiene el servidor.

## 7. Manejo de errores

`ManejadorErrores` traduce cada excepción a un JSON uniforme con `momento`, `estado`, `error`,
`mensaje` y, en las validaciones, un mapa `campos`:

| Excepción | HTTP | Cuándo |
|---|---|---|
| `RecursoNoEncontradoExcepcion` | 404 | El id o el slug no existe. |
| `ReglaNegocioExcepcion` | 409 | Se viola una regla: correo repetido, sin stock, oferta mayor que el precio, categoría con productos. |
| `CredencialesInvalidasExcepcion` | 401 | Correo inexistente, clave incorrecta o cuenta desactivada. |
| `AccesoDenegadoExcepcion` | 403 | Un cliente intenta ver o editar una cuenta ajena. |
| `MethodArgumentNotValidException` | 400 | Falla una anotación de validación; el mapa `campos` permite pintar el error bajo cada input. |

## 8. Pruebas

| Proyecto | Comando | Qué cubre |
|---|---|---|
| Unitarias (jsdom) | `npm run test:unit` | 8 casos de componentes, sin red. |
| Integración (Chromium) | `npm run test:funcional` | 4 casos de extremo a extremo **contra el backend y la base de datos reales**: compra completa, pago rechazado, validaciones del registro y registro válido. |

Las funcionales son pruebas de integración de verdad: levantan la aplicación en un navegador,
pegan contra la API y verifican el resultado. El estado de los 12 casos al cierre de la entrega es
**12 pasando**.

## 9. Configuración

**Backend** (`src/main/resources/application.properties`)

| Propiedad | Para qué |
|---|---|
| `spring.datasource.url` / `username` / `password` | Conexión a MySQL. Es lo único que cambia al pasar de Docker local a Amazon RDS. |
| `spring.jpa.hibernate.ddl-auto=update` | Hibernate crea y ajusta las tablas al arrancar. |
| `tienda.jwt.secreto` | Clave de firma. **En el servidor hay que reemplazarla** por una de al menos 32 caracteres y pasarla por variable de entorno. |
| `tienda.jwt.duracion-minutos` | Vigencia del token. |
| `tienda.cors.origenes` | Orígenes autorizados. |
| `tienda.semillas.activas` | Carga los datos iniciales si las tablas están vacías. |

**Frontend**

| Archivo | Valor | Para qué |
|---|---|---|
| `.env` | `VITE_API_URL=/api` | Desarrollo: pasa por el proxy de Vite hacia el puerto 8080. |
| `.env.production` | `VITE_API_URL=/api` | Producción: Nginx sirve los estáticos y redirige `/api` al backend. |

## 10. Cómo levantarlo

```bash
# 1. Base de datos
docker run -d --name thezone-mysql -p 3307:3306 \
  -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=thezone mysql:8.0

# 2. Backend  (http://localhost:8080 · Swagger en /swagger-ui.html)
cd tienda && mvn spring-boot:run

# 3. Frontend (http://localhost:5173)
cd tienda-online && npm install && npm run dev
```

Cuentas que crea la semilla:

| Rol | Correo | Clave |
|---|---|---|
| Administrador | `admin@thezone.cl` | `Admin123` |
| Cliente | `pedro@example.com` | `Cliente123` |

## 11. Deuda técnica conocida

- `GET /api/ordenes/{codigo}` es público porque un invitado necesita ver su boleta después de pagar,
  y los códigos son secuenciales (`ORDER00001`), o sea adivinables. Lo correcto sería un token de un
  solo uso en la URL de la boleta. Se dejó así por alcance de la entrega.
- `ddl-auto=update` sirve para desarrollar, pero en un sistema real el esquema debería versionarse
  con Flyway o Liquibase.
- El secreto del JWT está en el archivo de propiedades. Debe salir de ahí antes de cualquier uso
  que no sea esta evaluación.
