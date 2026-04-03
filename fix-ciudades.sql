UPDATE configuracion SET zonas = '[{"id":"z1","nombre":"Norte"},{"id":"z2","nombre":"Sur"},{"id":"z3","nombre":"Este"},{"id":"z4","nombre":"Oeste"},{"id":"z5","nombre":"Centro"}]'::jsonb WHERE tabla = 'ciudades' AND nombre = 'Caracas';
UPDATE configuracion SET zonas = '[{"id":"z6","nombre":"Norte"},{"id":"z7","nombre":"Sur"},{"id":"z8","nombre":"Este"},{"id":"z9","nombre":"Centro"}]'::jsonb WHERE tabla = 'ciudades' AND nombre = 'Valencia';
UPDATE configuracion SET zonas = '[{"id":"z10","nombre":"Norte"},{"id":"z11","nombre":"Sur"},{"id":"z12","nombre":"Centro"}]'::jsonb WHERE tabla = 'ciudades' AND nombre = 'Maracaibo';
UPDATE configuracion SET zonas = '[{"id":"z13","nombre":"Norte"},{"id":"z14","nombre":"Este"},{"id":"z15","nombre":"Oeste"},{"id":"z16","nombre":"Centro"}]'::jsonb WHERE tabla = 'ciudades' AND nombre = 'Barquisimeto';
DELETE FROM configuracion WHERE tabla = 'zonas';
