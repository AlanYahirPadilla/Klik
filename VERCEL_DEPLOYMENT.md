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

Si el build falla con errores relacionados con variables de entorno:
1. Verifica que las variables estén configuradas en Vercel
2. Verifica que los nombres de las variables sean exactamente:
   - `NEXT_PUBLIC_SUPABASE_URL` (con guiones bajos, no guiones)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (con guiones bajos, no guiones)
3. Verifica que los valores sean correctos (sin espacios al inicio o final)
4. Asegúrate de hacer un redeploy después de agregar/modificar las variables

