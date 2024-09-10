import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import { useState } from 'react';
import { Slider } from '@mui/material';
import axios from 'axios';
import CONFIG from '../Constants/Config';
import { debounce } from 'lodash';

export default function BasicCard({ id, name, initialValue }) {

    const [value, setValue] = useState(parseInt(initialValue));

    const sentAction = (sliderValue) => {
        const token = window.sessionStorage.getItem("token");
        axios.post(`${CONFIG.service}/handle-sensor-action`, {
            sensorId: id, toggleValue: false, optionalValue: sliderValue
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
                <Slider max={180} value={value} onChange={(e) => {
                    setValue(e.target.value)
                }} onChangeCommitted={(e) => {
                    sentAction(value)
                }} aria-label="Disabled slider" />
                <Typography variant="body2" color="text.secondary">
                    Window is <b>{value ? 'opened' : 'closed'}</b>.
                </Typography>
            </CardContent>
        </Card>
    );
}
