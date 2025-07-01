
TODA ESTA INFORMACION ES SACADA DESDE LA PAGINA OFICIAL DE KHIPU 
(https://docs.khipu.com/payment-solutions/instant-payments/khipu-client-web)


1. Todas las solicitudes de API deben realizarse a través de HTTPS. Las llamadas realizadas a través de HTTP simple fallarán. Las solicitudes de API sin la cabecera de autenticación también fallarán.

2.Enviar un correo electrónico de cobro
Puedes hacer que Khipu envíe automáticamente un correo electrónico con el cobro que generas. Lo único que necesitas es llenar un par de campos al momento de invocar al método GET /payments:

payer_name: Es el nombre de la persona que debe pagar.
payer_email: Es la dirección de correo electrónico del pagador.
send_email: Si envías true Khipu enviará la solicitud de pago por correo.
Es importante notar algunas cosas:

Si send_email es true, los otros campos (payer_name y payer_email) serán obligatorios.
El contenido del campo body no se envía en el correo electrónico. Solo se despliega en la página de pago.
Si además de enviar true en el campo send_email, también envías true en el campo send_reminders, además del correo inicial de cobro, se enviarán otros dos correos de recordatorio con una separación de una semana entre cada uno, siempre y cuando el cobro no haya sido pagado o eliminado al momento de gestionar el recordatorio.


4. (YA IMPLEMENTADO 
Este paso es opcional, pero puede ser útil para algunos comercios. En la llamada anterior para crear pagos puede verse el parámetro “ID del banco para pagar”. Este ID sirve para crear un pago con un banco ya elegido (solo de los bancos soportados por Khipu). Para obtener este id se puede usar la llamada al método GET /banks que entrega el listado de los bancos soportados por Khipu, sus nombres, su id y otra información.

El resultado de la llamada contiene el valor banks que es un listado de bancos. Cada banco tiene un bank_id con el valor que podemos usar para crear pagos configurados.)


3.Banco de pruebas (demobank)
Las cuentas de cobro de desarrollo solo pueden recibir pagos desde Bancos de pruebas. Estos bancos son bancos creados por Khipu para hacer pruebas.

El banco de prueba permite probar que el proceso de pago esté completo, incluyendo ir al banco y depositar a Khipu o utilizar la transferencia simplificada. Como estos bancos no operan con dinero real, puedes hacer todas las transferencias que desees pues nunca se acaba el saldo.

Estos bancos, además, tienen instrucciones en pantalla para poder entrar, llenar claves y autorizar transferencias.


##Pago exitoso##
En este caso, el demobank simulará una transferencia correcta. Para esto se deben utilizar los siguiente datos:

Dato	Valor
RUT	Cualquier RUT válido, ej: 11111111-1
Contraseña	1234
Cuenta de origen	Cualquiera de las desplegadas
Coordenadas	11 22 33

##Pago con error##
En este caso, el demobank simulará una transferencia que falla por un error del Banco. Para esto se deben utilizar los siguiente datos:

Dato	Valor
RUT	Cualquier RUT válido, ej: 11111111-1
Contraseña	1234
Cuenta de origen	Cualquiera de las desplegadas
Coordenadas	99 99 99


##Pago con resultado dudoso##
En este caso, el demobank simulará una transferencia en el Banco no da una respuesta clara sobre el éxito o fracaso. Para esto se deben utilizar los siguiente datos:

Dato	Valor
RUT	Cualquier RUT válido, ej: 11111111-1
Contraseña	1234
Cuenta de origen	Cualquiera de las desplegadas
Coordenadas	66 66 66
