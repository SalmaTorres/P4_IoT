Alexa
lambda:
const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const IotData = new AWS.IotData({ endpoint: 'a2qtonmyilc0yl-ats.iot.us-east-2.amazonaws.com' });
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getThingNameFromDB(userId) {
    const params = {
        TableName: 'UsuariosDispositivos',
        Key: { userId }
    };

    try {
        const data = await dynamoDb.get(params).promise();
        if (data.Item && data.Item.devices && data.Item.devices.length > 0) {

            return data.Item.devices[0].thingName || data.Item.devices[0]; 
        } else {
            throw new Error("No se encontraron dispositivos.");
        }
    } catch (error) {
        console.error("Error obteniendo thingName:", error);
        throw error;
    }
}

function getUserDevices(userId) {
    const params = {
        TableName: 'UsuariosDispositivos',
        Key: {
            'userId': { S: userId }
        }
    };

    return new Promise((resolve, reject) => {
        DynamoDB.getItem(params, (err, data) => {
            if (err) {
                console.error("Error al consultar DynamoDB:", err);
                reject(err);
            } else {
                if (data.Item && data.Item.devices && data.Item.devices.L) {
                    const devices = data.Item.devices.L.map(device => device.S);
                    resolve(devices);
                } else {
                    resolve([]);
                }
            }
        });
    });
}


function getShadowPromise(params) {
    return new Promise((resolve, reject) => {
        IotData.getThingShadow(params, (err, data) => {
            if (err) {
                console.log(err, err.stack);
                reject('Fallo obtencion de shadow ${err.errorMessage}');
            } else {
                resolve(JSON.parse(data.payload));
            }
        });
    });
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const userId = handlerInput.requestEnvelope.context.System.user.userId;
        const params = {
            TableName: 'UsuariosDispositivos',
            Key: {
                userId: userId
            }
        };

        try {
            const data = await dynamoDb.get(params).promise();
            if (!data.Item) {
                const speakOutput = 'Lo siento, no estás autorizado para usar esta skill.';
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .getResponse();
            }
        } catch (error) {
            console.error("Error al consultar la base de datos:", error);
            const speakOutput = 'Ocurrió un error al verificar tu acceso. Intenta más tarde.';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        }

        const speakOutput = '¡Bienvenido! ¿Qué deseas hacer?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('¿Qué deseas hacer?')
            .getResponse();
    }
};

const GetMyDevicesIntentHandler = {
    canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetMyDevicesIntent';
    },
    async handle(handlerInput) {
      const userId = handlerInput.requestEnvelope.context.System.user.userId;
      console.log("userId:", userId);
  
      const params = {
        TableName: 'UsuariosDispositivos',
        Key: {
          userId: userId
        }
      };
  
      let speakOutput = 'Hubo un problema al obtener tus dispositivos. Intenta más tarde.';
  
      try {
        const data = await dynamoDb.get(params).promise();
        if (data && data.Item && data.Item.devices && data.Item.devices.length > 0) {
          const dispositivos = data.Item.devices;
          speakOutput = `Tienes registrados los siguientes dispositivos: ${dispositivos.join(', ')}`;
        } else {
          speakOutput = 'No se encontraron dispositivos asociados a tu cuenta.';
        }
      } catch (error) {
        console.error("Error al consultar DynamoDB:", error);
      }
  
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('¿Quieres hacer algo más?')
        .getResponse();
    }
};  

const TurnOnBuzzerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TurnOnBuzzerIntent';
    },
    async handle(handlerInput) {
        const userId = handlerInput.requestEnvelope.context.System.user.userId;
        let speakOutput = "Error";

        try {
            const thingName = await getThingNameFromDB(userId);

            const params = {
                thingName,
                payload: '{"state": {"desired": {"buzzer_state": "on"}}}'
            };

            await IotData.updateThingShadow(params).promise();
            speakOutput = 'Solicitaste encender buzzer!';
        } catch (err) {
            console.error("Error al encender buzzer:", err);
            speakOutput = 'No se pudo encender el buzzer. Intenta más tarde.';
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const TurnOffBuzzerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TurnOffBuzzerIntent';
    },
    async handle(handlerInput) {
        const userId = handlerInput.requestEnvelope.context.System.user.userId;
        let speakOutput = "Error";

        try {
            const thingName = await getThingNameFromDB(userId);

            const params = {
                thingName,
                payload: '{"state": {"desired": {"buzzer_state": "off"}}}'
            };

            await IotData.updateThingShadow(params).promise();
            speakOutput = 'Solicitaste apagar buzzer!';
        } catch (err) {
            console.error("Error al apagar buzzer:", err);
            speakOutput = 'No se pudo apagar el buzzer. Intenta más tarde.';
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const OpenValveIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OpenValveIntent';
    },
    async handle(handlerInput) {
        const userId = handlerInput.requestEnvelope.session.user.userId;
        const thingName = await getThingNameFromDB(userId);

        const params = {
            thingName,
            payload: '{"state": {"desired": {"valve_state": "open"}}}'
        };

        IotData.updateThingShadow(params, function(err, data) {
            if (err) console.log(err);
        });

        const speakOutput = 'Solicitaste abrir válvula!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CloseValveIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CloseValveIntent';
    },
    async handle(handlerInput) {
        const userId = handlerInput.requestEnvelope.session.user.userId;
        const thingName = await getThingNameFromDB(userId);

        const params = {
            thingName,
            payload: '{"state": {"desired": {"valve_state": "closed"}}}'
        };

        IotData.updateThingShadow(params, function(err, data) {
            if (err) console.log(err);
        });

        const speakOutput = 'Solicitaste cerrar válvula!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const TurnOnFanIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TurnOnFanIntent';
    },
    async handle(handlerInput) {
        const userId = handlerInput.requestEnvelope.context.System.user.userId;
        let speakOutput = "Error";

        try {
            const thingName = await getThingNameFromDB(userId);

            const params = {
                thingName,
                payload: '{"state": {"desired": {"fan_state": "on"}}}'
            };

            await IotData.updateThingShadow(params).promise();
            speakOutput = 'Solicitaste encender el ventilador!';
        } catch (err) {
            console.error("Error al encender el ventilador:", err);
            speakOutput = 'No se pudo encender el ventilador. Intenta más tarde.';
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const TurnOffFanIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TurnOffFanIntent';
    },
    async handle(handlerInput) {
        const userId = handlerInput.requestEnvelope.session.user.userId;
        const thingName = await getThingNameFromDB(userId);

        const params = {
            thingName,
            payload: '{"state": {"desired": {"fan_state": "off"}}}'
        };

        IotData.updateThingShadow(params, function (err, data) {
            if (err) console.log(err);
        });

        const speakOutput = 'Solicitaste apagar ventilador!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const GetBuzzerStatusIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetBuzzerStatusIntent';
    },
    async handle(handlerInput) {
        const userId = handlerInput.requestEnvelope.session.user.userId;
        const thingName = await getThingNameFromDB(userId);

        const params = { thingName };

        let speakOutput = 'Error';
        try {
            const result = await getShadowPromise(params);
            const buzzer_state = result.state.reported.buzzer_state;

            if (buzzer_state === "on") {
                speakOutput = 'El buzzer está encendido';
            } else if (buzzer_state === "off") {
                speakOutput = 'El buzzer está apagado';
            } else {
                speakOutput = 'No se pudo consultar el estado del buzzer, por favor intente más tarde';
            }
        } catch (err) {
            console.error(err);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const GetValveStatusIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetValveStatusIntent';
    },
    async handle(handlerInput) {
        const userId = handlerInput.requestEnvelope.session.user.userId;
        const thingName = await getThingNameFromDB(userId);

        const params = { thingName };

        let speakOutput = 'Error';
        try {
            const result = await getShadowPromise(params);
            const valve_state = result.state.reported.valve_state;

            if (valve_state === "closed") {
                speakOutput = 'La válvula está cerrada';
            } else if (valve_state === "open") {
                speakOutput = 'La válvula está abierta';
            } else {
                speakOutput = 'No se pudo consultar el estado de la válvula, por favor intente más tarde';
            }
        } catch (err) {
            console.error(err);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const GetFanStatusIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetFanStatusIntent';
    },
    async handle(handlerInput) {
        const userId = handlerInput.requestEnvelope.session.user.userId;
        const thingName = await getThingNameFromDB(userId);

        const params = { thingName };

        let speakOutput = 'Error';
        try {
            const result = await getShadowPromise(params);
            const fan_state = result.state.reported.fan_state;

            if (fan_state === "on") {
                speakOutput = 'El ventilador está encendido';
            } else if (fan_state === "off") {
                speakOutput = 'El ventilador está apagado';
            } else {
                speakOutput = 'No se pudo consultar el estado del ventilador, por favor intente más tarde';
            }
        } catch (err) {
            console.error(err);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const GetGasIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetGasIntent';
    },
    async handle(handlerInput) {
        const userId = handlerInput.requestEnvelope.session.user.userId;
        const thingName = await getThingNameFromDB(userId);

        const params = { thingName };

        let speakOutput = 'Error';
        try {
            const result = await getShadowPromise(params);
            const gasLevel_ppm = result.state.reported.gasLevel_ppm;

            if (gasLevel_ppm !== undefined && gasLevel_ppm !== null) {
                let status = "";
                let recommendation = "";

                if (gasLevel_ppm <= 200) {
                    status = "normal";
                    recommendation = "el ambiente es seguro.";
                } else if (gasLevel_ppm <= 1000) {
                    status = "precaución por baja concentración de gas.";
                    recommendation = "revisar posibles fugas.";
                } else if (gasLevel_ppm <= 2000) {
                    status = "fuga leve o moderada.";
                    recommendation = "ventilar la zona y revisar el sistema.";
                } else if (gasLevel_ppm <= 5000) {
                    status = "fuga significativa o peligrosa.";
                    recommendation = "activar alarmas, evacuar y revisar el sistema urgentemente.";
                } else {
                    status = "peligro extremo de explosión.";
                    recommendation = "evacuar inmediatamente y cortar el suministro de gas.";
                }

                speakOutput = `Se detectaron ${gasLevel_ppm} partes por millón de gas. Esto indica ${status} Se recomienda ${recommendation}`;
            }
        } catch (error) {
            console.error("Error al consultar Shadow:", error);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Puedes decir encender el timbre, abrir la válvula o obtener el nivel de gas.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Hasta pronto!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Lo siento, no entendí, intenta de nuevo.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log('Sesion finalizada: ${JSON.stringify(handlerInput.requestEnvelope)}');
        return handlerInput.responseBuilder.getResponse(); 
    }
};

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = 'Intentó ejecutar ${intentName};'

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};


const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Disculpa, hubo un error. Intenta de nuevo.';
        console.log('Error handled: ${JSON.stringify(error)}');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        TurnOnBuzzerIntentHandler,
        TurnOffBuzzerIntentHandler,
        OpenValveIntentHandler,
        CloseValveIntentHandler,
        TurnOnFanIntentHandler,
        TurnOffFanIntentHandler,
        GetBuzzerStatusIntentHandler,
        GetValveStatusIntentHandler,
        GetFanStatusIntentHandler,
        GetGasIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        GetMyDevicesIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();