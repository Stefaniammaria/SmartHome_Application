import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { useState, useEffect } from 'react';
import CONFIG from '../Constants/Config';
import axios from 'axios';

export default function BasicCard({ id, name, values }) {

    const [temperature, setTemperature] = useState({ toggle: 0, temperature: "" });

    useEffect(() => {
        console.log(values)
        if (values[0].propertyName === "AC") {
            setTemperature({ ...temperature, toggle: parseInt(values[0].value) });
        } else {
            setTemperature({ ...temperature, toggle: parseInt(values[1].value) });
        }
    }, [values])

    // useEffect(() => {
    //     if (values[0].propertyName === "AC") {
    //         setTemperature({ temperature: values[1].value || "" , toggle: parseInt(values[0].value) });
    //     } else {
    //         setTemperature({ temperature: values[0].value || "", toggle: parseInt(values[1].value) });
    //     }
    // }, [])

    const handleTempChange = (event) => {
        const newTemp = event.target.value;
        setTemperature({ ...temperature, temperature: newTemp });
    };

    const sentAction = (newToggleValue, newTemp) => {
        const token = window.sessionStorage.getItem("token");
        axios.post(`${CONFIG.service}/handle-sensor-action`, {
            sensorId: id, toggleValue: newToggleValue !== undefined ? newToggleValue : !!temperature.toggle, optionalValue: newTemp !== undefined ? newTemp : temperature.temperature
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
                <Switch checked={!!temperature.toggle} onChange={(e) => {
                    sentAction(e.target.checked, "");
                    setTemperature({ toggle: e.target.checked, temperature: "" })
                }} />
                <Typography variant="body2" color="text.secondary">
                    AC is <b>{temperature.toggle ? 'on' : 'off'}</b>.
                </Typography>
                <TextField type='number' id="outlined-basic" value={temperature.temperature} label="Desired temperature:" variant="outlined"
                    onChange={(e) => handleTempChange(e)}
                    onBlur={() => sentAction()}
                />
            </CardContent>
        </Card>
    );
}
