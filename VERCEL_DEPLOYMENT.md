# Guía de Despliegue en Vercel

## Variables de Entorno Requeridas

Para que el proyecto funcione correctamente en Vercel, necesitas configurar las siguientes variables de entorno en el dashboard de Vercel:

### Variables Requeridas:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Tu URL de Supabase (ejemplo: `https://xxxxx.supabase.co`)
   - Se encuentra en: Supabase Dashboard > Settings > API > Project URL

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Tu clave anónima (anon/public key) de Supabase
   - Se encuentra en: Supabase Dashboard > Settings > API > Project API keys > `anon` `public`

## Cómo Configurar las Variables en Vercel:

1. **Ve a tu proyecto en Vercel**
   - Abre https://vercel.com/dashboard
   - Selecciona tu proyecto "Klik"

2. **Ve a Settings**
   - Haz clic en "Settings" en el menú superior
   - Luego haz clic en "Environment Variables" en el menú lateral

3. **Agrega las variables**
   - Haz clic en "Add New"
   - Agrega cada variable:
     - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
     - **Value**: Tu URL de Supabase (ejemplo: `https://lgasvgxiqfaocyoqdtwt.supabase.co`)
     - **Environment**: Selecciona "Production", "Preview", y "Development"
     - Haz clic en "Save"
   
   - Repite para la segunda variable:
     - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **Value**: Tu clave anónima de Supabase
     - **Environment**: Selecciona "Production", "Preview", y "Development"
     - Haz clic en "Save"

4. **Redeploy**
   - Después de agregar las variables, ve a "Deployments"
   - Haz clic en los tres puntos (...) del último deployment
   - Selecciona "Redeploy"
   - O simplemente haz un nuevo push al repositorio

## Verificar que las Variables Están Configuradas:

Puedes verificar que las variables están configuradas correctamente:
1. Ve a Settings > Environment Variables
2. Deberías ver ambas variables listadas
3. Asegúrate de que estén habilitadas para todos los ambientes (Production, Preview, Development)

## Nota Importante:

⚠️ **Nunca subas tus variables de entorno al repositorio Git**. El archivo `.env.local` está en `.gitignore` por seguridad. Solo configura las variables en Vercel.

## Solución de Problemas:

### Error: "Command 'npm run build' exited with 1"

Este error generalmente ocurre por una de estas razones:

1. **Variables de entorno faltantes** (más común):
   - Ve a Settings > Environment Variables en Vercel
   - Asegúrate de que ambas variables estén configuradas:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Verifica que estén habilitadas para "Production", "Preview" y "Development"
   - Haz un redeploy después de agregar las variables

2. **Nombres incorrectos de variables**:
   - Los nombres deben ser exactamente:
     - `NEXT_PUBLIC_SUPABASE_URL` (con guiones bajos, no guiones)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (con guiones bajos, no guiones)
   - Verifica que no haya espacios al inicio o final de los valores

3. **Valores incorrectos**:
   - La URL debe comenzar con `https://` y terminar con `.supabase.co`
   - La clave anónima es una cadena larga que comienza con `eyJ...`
   - Asegúrate de copiar los valores completos sin espacios

4. **Después de agregar variables**:
   - **IMPORTANTE**: Debes hacer un redeploy después de agregar las variables
   - Ve a "Deployments" > Haz clic en los tres puntos (...) > "Redeploy"
   - O simplemente haz un nuevo push al repositorio

### Verificar el Log del Build:

Si el build sigue fallando:
1. Ve a "Deployments" en Vercel
2. Haz clic en el deployment fallido
3. Revisa los logs del build para ver el error específico
4. Busca mensajes como "Missing Supabase environment variables" o errores relacionados

