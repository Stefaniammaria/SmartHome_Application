import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function BasicCard({id, name, values}) {

  let valueTemp, valueHum;
    if(values[0].propertyName === "TEMP"){
      valueTemp = parseFloat(values[0].value);
      valueHum = parseFloat(values[1].value);
    }else{
      valueTemp = parseFloat(values[1].value);
      valueHum = parseFloat(values[0].value);
    }

  const temp = !isNaN(valueTemp) && valueTemp.toFixed(1);
  const hum = !isNaN(valueHum) && valueHum.toFixed(1);

  return (
    <Card sx={{ width: 275 ,  height: 200}}>
      <CardContent>
      <Typography sx={{ mb: 1.5 }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Value of temperature is: {temp} °C
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Value of humidity is: {hum}%
        </Typography>
      </CardContent>
    </Card>
  );
}
