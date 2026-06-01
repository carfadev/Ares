# AGENTS.md

## Objetivo del proyecto

Aplicación web PWA para la gestión de operaciones logísticas y de seguridad, desarrollada con React, TypeScript, TailwindCSS y Firebase.

El sistema permite registrar:

* Cargues y descargues.
* Aperturas de rejas.
* Aperturas de cuartos de seguridad.
* Novedades operativas.
* Evidencias fotográficas.
* Dashboard administrativo.

---

## Reglas generales

* Mantener código limpio, legible y modular.
* Priorizar seguridad sobre rapidez de implementación.
* No introducir dependencias innecesarias.
* No modificar funcionalidades existentes sin justificación.
* No eliminar código existente sin autorización explícita.
* No generar código duplicado.
* Seguir principios SOLID cuando sea aplicable.
* Utilizar TypeScript estricto.
* Mantener separación clara entre UI, lógica de negocio y acceso a datos.

---

## Arquitectura

* React + TypeScript.
* TailwindCSS para estilos.
* Firebase Authentication.
* Firestore Database.
* Firebase Storage.
* Firebase Cloud Functions.
* React Router para navegación.
* Componentes reutilizables.

---

## Seguridad

* Toda funcionalidad debe asumir usuarios autenticados.
* Nunca confiar en datos enviados por el cliente.
* Utilizar Firestore Rules como primera línea de seguridad.
* Utilizar Cloud Functions para operaciones sensibles.
* Registrar trazabilidad mediante UID.
* Implementar App Check cuando corresponda.
* Validar entradas antes de persistir datos.
* Evitar exponer información sensible en cliente.

---

## Firebase

* Utilizar colecciones tipadas.
* Evitar consultas innecesarias.
* Minimizar lecturas y escrituras.
* Utilizar índices cuando sea necesario.
* Almacenar imágenes en Firebase Storage.
* Guardar únicamente metadatos y URLs en Firestore.

---

## Calidad del código

* Componentes pequeños y reutilizables.
* Evitar archivos excesivamente largos.
* Utilizar nombres descriptivos.
* Manejo consistente de errores.
* Estados de carga y errores visibles para el usuario.
* Evitar lógica compleja dentro del JSX.

---

## Antes de generar código

Siempre analizar:

1. Seguridad.
2. Escalabilidad.
3. Rendimiento.
4. Mantenibilidad.
5. Compatibilidad con la arquitectura existente.

Nunca generar soluciones rápidas que comprometan la calidad del proyecto.
