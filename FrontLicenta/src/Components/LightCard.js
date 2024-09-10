import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import { useState } from 'react';
import CONFIG from '../Constants/Config';
import axios from 'axios';

export default function BasicCard({ id, name, initialValue }) {

    const value = parseInt(initialValue)
    
    const sentAction = (toggleValue) => {
        const token = window.sessionStorage.getItem("token");
        axios.post(`${CONFIG.service}/handle-sensor-action`, {
            sensorId: id, toggleValue: !!toggleValue, optionalValue: 0
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
                <Switch checked={!!value} onChange={(e) => {
                    sentAction(e.target.checked);

                }} />
                <Typography variant="body2" color="text.secondary">
                    Light is <b>{value ? 'on' : 'off'}</b>.
                </Typography>
            </CardContent>
        </Card>
    );
}
