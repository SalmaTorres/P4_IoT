import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('GasSensorReadings')

iot_data = boto3.client('iot-data', endpoint_url='https://a2qtonmyilc0yl-ats.iot.us-east-2.amazonaws.com')

def lambda_handler(event, context):
    print("Evento recibido:", event)

    thing_name = event.get('thing_name')
    timestamp = int(event.get('timestamp', 0))

    try:
        # Obtener el estado actual del shadow
        response = iot_data.get_thing_shadow(thingName=thing_name)
        payload = json.loads(response['payload'].read())
        reported = payload.get('state', {}).get('reported', {})

        item = {
            'thing_name': thing_name,
            'timestamp': timestamp,
            'ppm': reported.get('gasLevel_ppm', 0),
            'gas_state': reported.get('gasLevel_state', 'desconocido'),
            'fan': reported.get('fan_state', 'unknown'),
            'valve': reported.get('valve_state', 'unknown'),
            'buzzer': reported.get('buzzer_state', 'unknown')
        }

        table.put_item(Item=item)
        print("Item guardado en DynamoDB:", item)

        return {
            'statusCode': 200,
            'body': 'Dato almacenado correctamente'
        }

    except Exception as e:
        print("Error:", e)
        return {
            'statusCode': 500,
            'body': f'Error almacenando dato: {str(e)}'
        }