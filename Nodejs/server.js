import express from 'express';
const app = express();
import { createServer } from 'http';
const server = createServer(app);
import { Server } from "socket.io";

import amqp from "amqplib"

const QUEUE_RECEIVE = 'q.sensor_action'
const QUEUE_SEND = 'q.sensor_data'

let sendingQueue = null;

const hexToRgb = (hex) => {
    // Elimina semnul #
    hex = hex.replace('#', '');

    // Converteste hex in valori RGB
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    return { r, g, b };
};

const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const main = async () => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            transports: ["websocket", "polling"],
            credentials: true,
        },
        allowEIO3: true,
    });

    const currentConnections = {};
    const currentSensors = {};
    const lastCommands = {}
    let ledState = 0;

    io.on('connection', (socket) => {
        console.log(`ESP32 with id ${socket.id} Connected.`);

        currentConnections[socket.id] = socket;

        socket.on('register-sensor', function (sensorMetadata) {
            currentSensors[sensorMetadata.id] = {
                socketId: socket.id,
                type: sensorMetadata.type
            };
            if (lastCommands[sensorMetadata.id]) {
                sendActionToDevice(lastCommands[sensorMetadata.id])
            }
        });

        socket.on('disconnect', function () {
            console.log(`ESP32 with id ${socket.id} Disconnected.`);
            delete currentConnections[socket.id];
            Object.keys(currentSensors).forEach((sensorId) => {
                if (currentSensors[sensorId].socketId === socket.id) {
                    console.log(`Sensor ${sensorId} disconnected...`);
                    delete currentSensors[sensorId];
                }
            })
        });

        socket.on("data", (data) => {

            const payload = data.filter(x => {
                if (!x.id || !currentSensors[x.id]) {
                    return false;
                }
                if (currentSensors[x.id].type !== x.type) {
                    return false;
                }
                return true;
            }).map(x => ({
                id: x.id,
                type: x.type,
                temp: x.TEMP !== undefined && `${x.TEMP}` || "",
                hum: x.HUM !== undefined && `${x.HUM}` || "",
                win: x.WIN !== undefined && `${x.WIN}` || "",
                alarm: x.ALARM !== undefined && `${x.ALARM}` || "",
                moved: x.MOVED !== undefined && `${x.MOVED}` || "",
                led: x.LED !== undefined && `${x.LED}` || "",
                rgb: x.R !== undefined && x.G !== undefined && x.B !== undefined && rgbToHex(x.R, x.G, x.B) || "#000000",
                ac: x.AC !== undefined && `${x.AC}` || "",
                dt: x.DT !== undefined && `${x.DT}` || "",
            }))
            console.log(JSON.stringify(payload))
            if (sendingQueue) {
                sendingQueue.sendToQueue(QUEUE_SEND, Buffer.from(JSON.stringify(payload)))
            }
        })

    });

    app.get('/get-connections', (req, res) => {
        res.send({
            currentSensors
        })
    });

    app.get('/send-data/:sensorId', (req, res) => {
        const sensorId = req.params.sensorId;
        if (!sensorId || !currentSensors[sensorId]) {
            res.send("No sensor connected with that id.");
        }
        const socket = currentConnections[currentSensors[sensorId].socketId];


        socket.emit("led", { value: parseInt(req.query.on) || 0 });

        res.send({
            currentSensors
        })
    });

    server.listen(5050, () => {
        console.log('listening on *:5050');
    });

    const sendActionToDevice = (actionDTO) => {
        const {
            sensorId,
            toggleValue,
            optionalValue
        } = actionDTO;

        //console.log(actionDTO, currentSensors);

        if (!currentSensors[sensorId]) {
            return;
        }
        const socket = currentConnections[currentSensors[sensorId].socketId];
        //console.log(currentSensors[sensorId].type);
        switch (currentSensors[sensorId].type) {
            case "Led":
                socket.emit("Led", { value: toggleValue ? 1 : 0, sensorId });
                break;
            case "Window":
                socket.emit("Window", { value: parseInt(optionalValue), sensorId });
                break;
            case "Alarm":
                socket.emit("Alarm", { value: toggleValue ? 1 : 0, sensorId });
                break;
            case "RGBLed":
                if (toggleValue) {
                    socket.emit("RGBLed", { ...hexToRgb(optionalValue), sensorId });
                } else if (!toggleValue) {
                    socket.emit("RGBLed", { r: 0, g: 0, b: 0, sensorId });
                }
                break;
            case "AC":
                console.log(optionalValue)
                if (!optionalValue) {
                    socket.emit("AC", { value: toggleValue ? 1 : 0, opValue: 0, sensorId });
                } else { socket.emit("AC", { value: toggleValue ? 1 : 0, opValue: parseFloat(optionalValue), sensorId }); }
                break;
            default:
                break;
        }

    }

    try {
        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_RECEIVE, { durable: true })
        channel.consume(QUEUE_RECEIVE, (msg) => {
            //console.log(`msg:[${msg.content.toString().trim()}]`);
            if (msg.content.toString().trim()) {
                const dto = JSON.parse(msg.content.toString());
                const sensorId = dto.sensorId;
                lastCommands[sensorId] = dto;
                //channel.ack(msg);// aici consumam mesajul
                sendActionToDevice(dto)
            }
        },
            {
                noAck: true // Dacă vrei să confirmi manual mesajele, schimbă noAck la false
            })

        sendingQueue = await connection.createChannel();
        await sendingQueue.assertQueue(QUEUE_SEND, { durable: true })
    } catch (error) {
        console.log(error);
    }

}

main();