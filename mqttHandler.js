// mqttHandler.js

export default class MQTTHandler {
    constructor(dataManager, topic) {
        this.dataManager = dataManager;
        this.topic = topic;
        this.client = null;
        this.setupMQTT(this.topic);
    }

    setupMQTT(topic) {
        const myID = "itu" + parseInt(Math.random() * 10000000);
        const broker = topic.length % 2 === 0 ? 
            "wss://expdis1:BS6vhupKn0yzJG6h@expdis1.cloud.shiftr.io" : 
            "wss://expdis2:35f5SGDoGQ0z1Ql4@expdis2.cloud.shiftr.io";
        
        this.client = mqtt.connect(broker, { clientId: myID });

        this.client.on('connect', () => {
            console.log('MQTT connected!');
            this.client.subscribe(this.topic);
        });

        this.client.on('message', (topic, message) => {
            console.log("MQTT message received:", message.toString());
            try {
                let msg = JSON.parse(message);
                this.dataManager.manageDevice(msg);
            } catch (e) {
                console.error("Error parsing message:", e);
            }
        });

        this.client.on('error', (err) => {
            console.error('Connection to MQTT broker failed:', err);
            this.client.end();
        });
    }

    sendMessage(msg) {
        if (this.client === null) {
            console.log("Trying to send a message without setting up MQTT.");
            return;
        }
        let JSONmsg = JSON.stringify(msg);
        this.client.publish(this.topic, JSONmsg);
        console.log("Sent message:", JSONmsg);
    }
}
