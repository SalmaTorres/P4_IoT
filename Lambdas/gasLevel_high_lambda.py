import json
import boto3

iot_data = boto3.client('iot-data', endpoint_url='https://a2qtonmyilc0yl-ats.iot.us-east-2.amazonaws.com')

def lambda_handler(event, context):
    print("Evento recibido:", event)

    ppm = event.get('ppm')
    thing_name = event.get('thingName')

    if ppm is None or thing_name is None:
        print("ppm o thingName no presente en el evento.")
        return

    desired_state = {}

    if ppm > 200:
        desired_state["fan_state"] = "on"

    if ppm > 1000:
        desired_state["buzzer_state"] = "on"

    if not desired_state:
        print("No se requieren acciones.")
        return

    payload = {
        "state": {
            "desired": desired_state
        }
    }

    try:
        response = iot_data.update_thing_shadow(
            thingName=thing_name,
            payload=json.dumps(payload)
        )
        print(f"Shadow de {thing_name} actualizado con:", payload)
    except Exception as e:
        print("Error actualizando shadow:", str(e))