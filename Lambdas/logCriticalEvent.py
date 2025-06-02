import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('CriticalGasEvents')

def lambda_handler(event, context):
    print("Evento crítico recibido:", event)
    
    try:
        item = {
            'thing_name': event['thing_name'],
            'timestamp': int(event['timestamp']),
            'gas_ppm': event.get('gas_ppm', 0),
            'buzzer': event.get('buzzer', 'unknown'),
            'valve': event.get('valve', 'unknown')
        }

        table.put_item(Item=item)
        print("Evento mínimo guardado:", item)
        
        return {
            'statusCode': 200,
            'body': 'Evento crítico mínimo almacenado'
        }

    except Exception as e:
        print("Error:", e)
        return {
            'statusCode': 500,
            'body': f'Error al guardar: {str(e)}'
        }