import React, { useEffect, useState } from 'react'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import styles from './LogInPage.module.scss'
import { Alert, Snackbar, TextField } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom/dist';
import CONFIG from '../Constants/Config';

const LogInPage = () => {

    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [isErrorOpen, setIsErrorOpen] = useState({ state: false, message: "" });

    useEffect(() => {
        window.sessionStorage.removeItem("user");
        window.sessionStorage.removeItem("token");
    }, [])

    const onLogIn = () => {
        console.log(credentials);

        axios.post(`${CONFIG.service}/login-user`, credentials)
            .then(function (response) {
                window.sessionStorage.setItem("token", response.data.token);
                window.sessionStorage.setItem("user", JSON.stringify(response.data.userResponseDTO));
                navigate("/Sensors");
            })
            .catch(function (error) {
                console.log(error.response.data);
                setIsErrorOpen({ state: true, message: error.response && error.response.data && error.response.data.message });
            });
    }

    const handleClose = () => {
        setIsErrorOpen({ state: false, message: "" });
    }

    return (
        <>
            <div className={styles.wrapper}>
                <Card sx={{ width: 300 }}>
                    <CardContent>
                        <Typography variant="h5" component="div">
                            Log In
                        </Typography>
                        <TextField onChange={(e) => setCredentials({ username: e.target.value, password: credentials.password })} value={credentials.username} sx={{ width: "100%", mb: 1 }} label="Username" variant="standard" />
                        <TextField onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} value={credentials.password} sx={{ width: "100%" }} label="Password" type="password" variant="standard" />
                    </CardContent>
                    <CardActions>
                        <Button variant="contained" onClick={onLogIn}>Log In</Button>
                    </CardActions>
                </Card>
                <Card sx={{ width: 300 }}>
                    <CardContent>
                        <Typography variant="h5" component="div">
                            Don't have an account?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Register now!
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button variant="contained" onClick={() => navigate("/Register")}>Register</Button>
                    </CardActions>
                </Card>
            </div>

            <Snackbar open={isErrorOpen.state} autoHideDuration={5000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    {isErrorOpen.message}
                </Alert>
            </Snackbar></>
    )
}

export default LogInPage