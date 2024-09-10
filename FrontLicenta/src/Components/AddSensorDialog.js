import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CONFIG from '../Constants/Config';
import axios from 'axios';
import { Alert, Snackbar } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const AddSensorDialog = ({ open, handleClose, afterChange }) => {

  const token = window.sessionStorage.getItem("token");

  const [sensor, setSensor] = useState({ type: "", name: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const createSensor = () => {
    axios.post(`${CONFIG.service}/create-sensor`, sensor, {
      headers: {
        token
      }
    })
      .then(function (response) {
        console.log(response);
        afterChange();
        handleClose(false);

      })
      .catch(function (error) {
        console.log(error);
        setErrorMessage(error.response.data.message);
      });
  }

  useEffect(() => {
    setSensor({ type: "", name: ""});
}, [open])

  return (<>
    <Snackbar open={!!errorMessage} autoHideDuration={2500} onClose={() => setErrorMessage("")}>
      <Alert onClose={() => setErrorMessage("")} severity="error" sx={{ width: '100%' }}>
        {errorMessage}
      </Alert>
    </Snackbar>
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add Sensor</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Fill in the type of sensor you want and the description for it
        </DialogContentText>
        <FormControl variant="standard" fullWidth >
          <InputLabel id="select-standard-label" >Type</InputLabel>
          <Select
            labelId="select-standard-label"
            id="select-standard"
            value={sensor.type}
            onChange={(e) => setSensor({ ...sensor, type: e.target.value })}
            label="Type"
          >
            <MenuItem value={"TempHum"}>TempHum</MenuItem>
            <MenuItem value={"Led"}>Led</MenuItem>
            <MenuItem value={"RGBLed"}>RGBLed</MenuItem>
            <MenuItem value={"AC"}>AC</MenuItem>
            <MenuItem value={"Window"}>Window</MenuItem>
            <MenuItem value={"Alarm"}>Alarm</MenuItem>
          </Select>
        </FormControl>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Name"
          type="text"
          fullWidth
          variant="standard"
          onChange={(e) => setSensor({ ...sensor, name: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={createSensor}>Add</Button>
      </DialogActions>
    </Dialog></>
  )
}

export default AddSensorDialog