import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import { useState, useEffect } from 'react';
import CONFIG from '../Constants/Config';
import axios from 'axios';

const RGBCard = ({ id, name, values }) => {

    const [color, setColor] = useState({ toggle: 0, color: "" });

    useEffect(() => {
        if (values[0].propertyName === "LEDRBG") {
            setColor({ toggle: parseInt(values[0].value), color: values[1].value });
        } else {
            setColor({ toggle: parseInt(values[1].value), color: values[0].value });
        }
    }, [values])
    

    const handleColorChange = (event) => {
        const newColor = event.target.value;
        setColor({ ...color, color: newColor });
    };

    const sentAction = (newToggleValue, newColor) => {
        const token = window.sessionStorage.getItem("token");
        axios.post(`${CONFIG.service}/handle-sensor-action`, {
            sensorId: id, toggleValue: newToggleValue !== undefined ? newToggleValue : !!color.toggle, optionalValue: newColor || color.color 
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
                <Switch checked={!!color.toggle} onChange={(e) => {
                    sentAction(e.target.checked, "#FFFFFF");
                    setColor({ color: "#FFFFFF", toggle: e.target.checked})
                    
                }} />
                <Typography variant="body2" color="text.secondary">
                    Light is <b>{color.toggle ? 'on' : 'off'}</b>.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Choose the wanted colour:
                </Typography>
                <input type="color" id="colourPicker" name="colourPicker"
                    value={color.color}
                    onChange={handleColorChange}
                    onBlur={() => sentAction()}
                />
            </CardContent>
        </Card>
    )
}

export default RGBCard