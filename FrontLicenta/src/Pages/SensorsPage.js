import TempCard from '../Components/TempCard';
import LightCard from '../Components/LightCard';
import ACCard from '../Components/ACCard';
import WindowCard from '../Components/WindowCard';
import BuzzerCard from '../Components/BuzzerCard';
import { useEffect, useState } from 'react';
import axios from 'axios';
import CONFIG from '../Constants/Config';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import AddSensorDialog from '../Components/AddSensorDialog';
import SockJsClient from 'react-stomp';
import RGBCard from '../Components/RGBCard';


function SensorsPage() {

  const token = window.sessionStorage.getItem("token");
  const userStr = window.sessionStorage.getItem("user");
  const user = userStr && JSON.parse(userStr);
  const [sensors, setSensors] = useState([]);
  const [isAddSensorModalOpened, setIsAddSensorModalOpened] = useState(false);

  const fetchSensors = () => {
    axios.get(`${CONFIG.service}/find-all-sensors`, {
      headers: {
        token
      }
    })
      .then(function (response) {
        setSensors(response.data);
      }).catch(() => { })
  }

  useEffect(() => {
    fetchSensors();
  }, [])

  const onMessage = (data) => {
    console.log("message", data)
    setSensors(sensors.map(oldSensorData => {
      const newSensorData = data.find(x => x.id === oldSensorData.id);
      return (newSensorData || oldSensorData);
    }))
  }

  const socketProvider = user && (
    <SockJsClient
      url={`${CONFIG.service}/ws`}
      topics={[`/sensors/data-changed/${user.id}`]}
      onConnect={() => console.log("Connected!")}
      onDisconnect={() => console.log("Disconnected!")}
      onMessage={onMessage}
      debug={false}
    />
  );

  return (<>
    {socketProvider}
    <AddSensorDialog open={isAddSensorModalOpened} handleClose={() => setIsAddSensorModalOpened(false)} afterChange={fetchSensors} ></AddSensorDialog>
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", margin: "16px" }}>
      {sensors.map((sensor) => {
        switch (sensor.type) {
          case 'TempHum':
            return <TempCard key={sensor.id} id={sensor.id} name={sensor.name} values={sensor.sensorValues}></TempCard>
          case 'Led':
            return <LightCard key={sensor.id} id={sensor.id} name={sensor.name} initialValue={sensor?.sensorValues[0]?.value}></LightCard>
          case 'AC':
            return <ACCard key={sensor.id} id={sensor.id} name={sensor.name} values={sensor.sensorValues}> </ACCard>
          case 'Window':
            return <WindowCard key={sensor.id} id={sensor.id} name={sensor.name} initialValue={sensor?.sensorValues[0]?.value}></WindowCard>
          case 'Alarm':
            return <BuzzerCard key={sensor.id} id={sensor.id} name={sensor.name} values={sensor.sensorValues}></BuzzerCard>
          case 'RGBLed':
            return <RGBCard key={sensor.id} id={sensor.id} name={sensor.name} values={sensor.sensorValues}></RGBCard>
        }
      })
      }
      <Card sx={{ width: 275, height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <CardActions sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <IconButton size="large" sx={{ fontSize: 40 }} onClick={() => setIsAddSensorModalOpened(true)}>
            <AddIcon fontSize="inherit" />
          </IconButton>
        </CardActions>
      </Card>
    </div>
  </>
  );
}

export default SensorsPage;
