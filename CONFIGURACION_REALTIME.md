# Configuración de Supabase Realtime

Para que los mensajes se actualicen en tiempo real, necesitas habilitar Realtime en Supabase.

## Pasos para habilitar Realtime

1. **Ve a tu proyecto en Supabase Dashboard**
   - Abre tu proyecto en https://supabase.com/dashboard

2. **Habilita Realtime para la tabla `messages`**
   - Ve a **Database** > **Replication**
   - Busca la tabla `messages` en la lista
   - Activa el toggle para habilitar la replicación
   - Haz clic en **Enable** si aparece un botón

3. **Verifica que Realtime esté habilitado**
   - Deberías ver un indicador verde o "Enabled" junto a la tabla `messages`
   - También puedes verificar en **Database** > **Tables** > `messages` > **Replication**

## Notas importantes

- Realtime solo funciona para cambios en la base de datos (INSERT, UPDATE, DELETE)
- Los cambios se propagan en tiempo real a todos los clientes suscritos
- Asegúrate de que las políticas RLS permitan que los usuarios vean los mensajes

## Verificación

Después de habilitar Realtime, los mensajes deberían aparecer automáticamente sin necesidad de recargar la página.

