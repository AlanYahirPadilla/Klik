# Configuración de Supabase para Desarrollo

## Problema: "Email not confirmed"

Si estás recibiendo el error "Email not confirmed" al intentar iniciar sesión, es porque Supabase está requiriendo confirmación de email por defecto.

## Solución: Deshabilitar confirmación de email en desarrollo

Para deshabilitar la confirmación de email en tu proyecto de Supabase (solo para desarrollo):

1. **Ve a tu proyecto de Supabase**
   - Abre https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Ve a Authentication Settings**
   - En el menú lateral, haz clic en "Authentication"
   - Luego haz clic en "Settings" (Configuración)

3. **Deshabilita la confirmación de email**
   - Busca la sección "Email Auth"
   - Desactiva la opción "Enable email confirmations" (Confirmar emails)
   - O busca "Confirm email" y desactívala

4. **Guarda los cambios**
   - Haz clic en "Save" o "Guardar"

## Alternativa: Auto-confirmar emails en desarrollo

Si prefieres mantener la confirmación activa pero auto-confirmar en desarrollo:

1. Ve a **Authentication > Settings**
2. Busca **"SMTP Settings"** o **"Email Templates"**
3. En desarrollo, puedes usar el **Supabase CLI** para auto-confirmar:
   ```bash
   supabase auth users list
   supabase auth users update <user-id> --email-confirmed
   ```

## Verificar configuración actual

Para verificar si la confirmación está activa:
1. Ve a **Authentication > Settings**
2. Busca **"Email Auth"** o **"Email confirmation"**
3. Verifica el estado de la opción

## Nota importante

⚠️ **Solo deshabilita la confirmación de email en proyectos de desarrollo/pruebas.**
En producción, siempre debes mantener la confirmación de email activa por seguridad.

---

## Configuración de Storage (Buckets)

### Crear el bucket "posts" para imágenes

Para que las imágenes de posts y comentarios funcionen, necesitas crear un bucket en Supabase Storage:

1. **Ve a tu proyecto de Supabase**
   - Abre https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Ve a Storage**
   - En el menú lateral, haz clic en "Storage"

3. **Crea el bucket "posts"**
   - Haz clic en "New bucket" o "Crear bucket"
   - **Nombre del bucket:** `posts` (debe ser exactamente "posts")
   - **Marca "Public bucket"** ✅ (esto permite que las imágenes sean accesibles públicamente)
   - Haz clic en "Create bucket" o "Crear bucket"

4. **Configurar políticas (Opcional pero recomendado)**
   - Después de crear el bucket, ve a "Policies" o "Políticas"
   - Crea las siguientes políticas:
     - **INSERT:** `auth.role() = 'authenticated'` (usuarios autenticados pueden subir)
     - **SELECT:** `true` (público puede ver imágenes)
     - **UPDATE:** `(storage.foldername(name))[1] = auth.uid()::text` (usuarios pueden actualizar sus propias imágenes)
     - **DELETE:** `(storage.foldername(name))[1] = auth.uid()::text` (usuarios pueden eliminar sus propias imágenes)

### Verificar que el bucket existe

Si recibes el error "Bucket not found", significa que el bucket "posts" no existe. Sigue los pasos anteriores para crearlo.

### Notas sobre Storage

- El bucket debe llamarse exactamente `posts` (en minúsculas)
- Si lo haces público, las imágenes serán accesibles sin autenticación
- Las imágenes se organizan por usuario: `{user_id}/comments/{filename}` o `{user_id}/{filename}`


