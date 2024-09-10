import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../Constants/Config';
import moment from 'moment';

export default function BasicCard({ id, name, values }) {

    let movementValue, alarmValue;
    if(values[0].propertyName === "ALARM"){
        alarmValue = parseInt(values[0].value);
        movementValue = values[1].value;
    }else{
        alarmValue = parseInt(values[1].value);
        movementValue = values[0].value;
    }

    const [timeDifference, setTimeDifference] = useState('');

    useEffect(() => {
        const calculateTimeDifference = () => {
            const movementDate = moment(movementValue, "MM-DD-YYYY HH:mm:ss");
            const currentDate = moment();
            const duration = moment.duration(currentDate.diff(movementDate));

            const days = Math.floor(duration.asDays());
            const hours = duration.hours();
            const minutes = duration.minutes();
            const seconds = duration.seconds();

            setTimeDifference(`${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`);
        };

        calculateTimeDifference();
        const interval = setInterval(calculateTimeDifference, 1000);

        return () => clearInterval(interval);
    }, [movementValue]);

    const sentAction = (armed) => {
        const token = window.sessionStorage.getItem("token");
        axios.post(`${CONFIG.service}/handle-sensor-action`, {
            sensorId: id, toggleValue: !!armed, optionalValue: 0
        }, {
            headers: {
                token
            }
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error.response.data.message);
            });
    }

    return (
        <Card sx={{ width: 275, height: 200 }}>
            <CardContent>
                <Typography sx={{ mb: 1.5 }}>
                    {name}
                </Typography>
                <Switch checked={!!alarmValue} onChange={(e) => {
                    sentAction(e.target.checked)
                }} />
                <Typography variant="body2" color="text.secondary">
                    Alarm is <b>{alarmValue ? 'on' : 'off'}</b>.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Last movement sensed was {timeDifference} minutes ago.
                </Typography>
            </CardContent>
        </Card>
    );
}
