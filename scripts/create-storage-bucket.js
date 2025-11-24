/**
 * Script para crear el bucket de Storage en Supabase
 * 
 * INSTRUCCIONES:
 * 1. Abre la consola del navegador en tu aplicación (F12)
 * 2. Copia y pega este código completo
 * 3. Asegúrate de estar autenticado en Supabase
 * 4. Ejecuta el código
 * 
 * O mejor aún, ve al Dashboard de Supabase:
 * 1. Ve a Storage en el menú lateral
 * 2. Click en "New bucket"
 * 3. Nombre: "posts"
 * 4. Marca "Public bucket" (para que las imágenes sean accesibles públicamente)
 * 5. Click "Create bucket"
 */

// Si quieres crear el bucket programáticamente desde la consola:
async function createStorageBucket() {
  // Necesitas tu cliente de Supabase
  // Esto solo funciona si tienes acceso al cliente desde la consola
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'TU_SUPABASE_URL'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY'
  
  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        name: 'posts',
        public: true, // Hacer el bucket público para que las imágenes sean accesibles
        file_size_limit: 5242880, // 5MB límite
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Bucket "posts" creado exitosamente!', data)
    } else {
      console.error('❌ Error al crear bucket:', data)
      if (data.message?.includes('already exists')) {
        console.log('ℹ️ El bucket ya existe, puedes continuar')
      }
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Ejecutar
// createStorageBucket()

console.log(`
📋 INSTRUCCIONES PARA CREAR EL BUCKET:

Opción 1 (Recomendada - Dashboard):
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a "Storage" en el menú lateral
4. Click en "New bucket"
5. Nombre: "posts"
6. Marca "Public bucket" ✅
7. Click "Create bucket"

Opción 2 (Desde la consola):
Ejecuta: createStorageBucket()
`)

