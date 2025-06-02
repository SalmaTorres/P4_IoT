import json
import boto3

iot_data = boto3.client('iot-data', endpoint_url='https://a2qtonmyilc0yl-ats.iot.us-east-2.amazonaws.com')

def lambda_handler(event, context):
    print("Evento recibido:", json.dumps(event))

    thing_name = event.get('thingName')
    if not thing_name:
        print("No se recibió el nombre del dispositivo.")
        return

    try:
        shadow = iot_data.get_thing_shadow(thingName=thing_name)
        payload = json.loads(shadow['payload'].read())
        reported = payload.get('state', {}).get('reported', {})

        gas_state = reported.get('gasLevel_state')
        buzzer = reported.get('buzzer_state')
        fan = reported.get('fan_state')

        print(f"Estado actual - gas_state: {gas_state}, buzzer: {buzzer}, fan: {fan}")

        if gas_state == 'seguro' and buzzer == 'on' and fan == 'on':
            desired_state = {
                "buzzer_state": "off",
                "fan_state": "off"
            }

            payload_update = {
                "state": {
                    "desired": desired_state
                }
            }

            response = iot_data.update_thing_shadow(
                thingName=thing_name,
                payload=json.dumps(payload_update)
            )
            print(f"Shadow de {thing_name} actualizado con:", desired_state)

        else:
            print("Condición no cumplida. No se realiza ninguna acción.")

    except Exception as e:
        print("Error al consultar o actualizar el shadow:", str(e))