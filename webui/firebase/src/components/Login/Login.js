// src/components/Login/Login.js
import React, { useState } from 'react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Form, Button, Container, Card } from 'react-bootstrap';
import './Login.css'; // Import the CSS file

const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
        } catch (error) {
            setError(error.message);
        }
    };

    // const handleSignup = async () => {
    //     try {
    //         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    //         setUser(userCredential.user);
    //     } catch (error) {
    //         setError(error.message);
    //     }
    // };

    return (
        <div className="login-page" style={{
            backgroundImage: 'url(/assets/img/login.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100vh',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Card className="login-card">
                    <Card.Body>
                        <h2>RAG: The Power and The Glory</h2>
                        <Form>
                            {error && <p style={{ color: 'red' }}>{error}</p>}
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Form.Group>

                            <div className="button-group">
                                <Button variant="primary" onClick={handleLogin} className="m-2">
                                    Login
                                </Button>
                                {/*<Button variant="secondary" onClick={handleSignup} className="m-2">*/}
                                {/*    Sign Up*/}
                                {/*</Button>*/}
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default Login;