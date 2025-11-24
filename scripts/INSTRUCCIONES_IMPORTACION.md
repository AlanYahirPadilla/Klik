# Instrucciones para Importar la Base de Datos en Supabase

## Pasos para ejecutar el script SQL

1. **Accede a tu proyecto de Supabase**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto de pruebas

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - O ve directamente a: `https://supabase.com/dashboard/project/[TU_PROJECT_ID]/sql`

3. **Ejecuta el script completo**
   - Haz clic en "New query"
   - Abre el archivo `scripts/00_import_all.sql` desde tu proyecto
   - Copia TODO el contenido del archivo
   - Pégalo en el editor SQL de Supabase
   - Haz clic en "Run" o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verifica que todo se creó correctamente**
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver las siguientes tablas:
     - `profiles`
     - `posts`
     - `likes`
     - `follows`
     - `comments`
     - `conversations`
     - `conversation_participants`
     - `messages`
     - `saved_posts`
     - `blocked_users`

## Notas importantes

- El script incluye `IF NOT EXISTS` y `DROP POLICY IF EXISTS`, por lo que es seguro ejecutarlo múltiples veces
- Todas las tablas tienen Row Level Security (RLS) habilitado
- Se crean automáticamente los índices necesarios para optimizar las consultas
- El trigger `handle_new_user()` se crea automáticamente para crear perfiles cuando un usuario se registra

## Usuario Admin (Opcional)

Si deseas crear un usuario administrador, puedes ejecutar el script `007_create_admin_user.sql` después, pero ten en cuenta que:
- Insertar directamente en `auth.users` puede requerir permisos especiales
- Es mejor crear el usuario a través de la interfaz de Supabase Auth o mediante la API

## Solución de problemas

Si encuentras algún error:
1. Verifica que estés en el proyecto correcto de Supabase
2. Asegúrate de tener permisos de administrador en el proyecto
3. Revisa los mensajes de error en el SQL Editor
4. Si una tabla ya existe, el script la omitirá gracias a `IF NOT EXISTS`


