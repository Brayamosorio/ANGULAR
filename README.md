# Proyecto 4 - Angular TODO

Variante del gestor de tareas original con una nueva paleta pastel y tipografias redondeadas. Conserva las operaciones de listar, crear, editar, completar y eliminar tareas apoyandose en la API `https://todoapitest.juansegaliz.com/todos`.

## Scripts principales

- `npm install`: descarga las dependencias del proyecto.
- `npm start`: sirve la aplicacion en `http://localhost:4200/`.
- `npm run build`: genera los artefactos de produccion en `dist/proyecto4-angular-js/browser`.
- `npm test`: ejecuta las pruebas unitarias.

## Docker

La imagen publicada se denomina `brayam05/proyecto4-angular-js:latest`.

### Construir la imagen

```bash
docker compose -f docker-compose.build.yml build
```

### Ejecutar el contenedor

```bash
docker compose -f docker-compose.run.yml up
```

El sitio quedara disponible en `http://localhost:8084/`.

### Publicar en Docker Hub

```bash
docker login --username brayam05
docker push brayam05/proyecto4-angular-js:latest
```

## Comandos utiles sin Docker Compose

```bash
docker build -t brayam05/proyecto4-angular-js:latest .
docker run -d -p 8084:80 --name proyecto4-angular-js brayam05/proyecto4-angular-js:latest
```
