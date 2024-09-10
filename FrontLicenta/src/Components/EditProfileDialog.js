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

const EditProfileDialog = ({ open, handleClose }) => {

    const token = window.sessionStorage.getItem("token");
    const user = JSON.parse(window.sessionStorage.getItem("user"));
    const [localUser, setLocalUser] = useState({ name: "", username: "", password: "" })
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const user = JSON.parse(window.sessionStorage.getItem("user"));
        setLocalUser({ name: user.name, username: user.username, password: "" });
    }, [open])
    

    const updateUser = () => {
        axios.put(`${CONFIG.service}/update-user/${user.id}`, localUser, {
            headers: {
                token
            }
        })
            .then(function (response) {
                console.log(response);
                window.sessionStorage.setItem("user", JSON.stringify(response.data));
                handleClose(false);

            })
            .catch(function (error) {
                console.log(error);
                setErrorMessage(error.response.data.message);
            });
    }

    return (<>
        <Snackbar open={!!errorMessage} autoHideDuration={5000} onClose={()=>setErrorMessage("")}>
            <Alert onClose={()=>setErrorMessage("")} severity="error" sx={{ width: '100%' }}>
                {errorMessage}
            </Alert>
        </Snackbar>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Edit your profile</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Fill in the fields you'd like to change
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={localUser.name}
                    onChange={(e) => setLocalUser({ ...localUser, name: e.target.value })}
                />
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Username"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={localUser.username}
                    onChange={(e) => setLocalUser({ ...localUser, username: e.target.value })}
                />
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Password"
                    type="password"
                    fullWidth
                    variant="standard"
                    value={localUser.password}
                    onChange={(e) => setLocalUser({ ...localUser, password: e.target.value })}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={updateUser}>Update</Button>
            </DialogActions>
        </Dialog></>
    )
}

export default EditProfileDialog