import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase"; // Adjust this import path as necessary
import {
    collection,
    query,
    orderBy,
    getDocs
} from "firebase/firestore";
import { Card, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { faSpinner, faCircleExclamation, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

function EvalList() {
    const [evals, setEvals] = useState([]);

    useEffect(() => {
        const fetchEvals = async () => {
            const q = query(
                collection(db, `users/${auth.currentUser.uid}/evals`),
                orderBy("created", "desc")
            );
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created: doc.data().created.toDate()
            }));

            setEvals(docs);
        };

        fetchEvals();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case "running":
                return faSpinner;
            case "error":
                return faCircleExclamation;
            case "success":
                return faCheckCircle;
            default:
                return faCalendarAlt; // Default icon if status doesn't match
        }
    };
    return (
        <div className="page-background" >
            <Card className="m-4 custom-card">
                <Card.Body>
                    <Card.Title>Evaluations</Card.Title>
                    {evals.map((evalData, index) => (
                        <Row key={index} className="mb-2">
                            <Col xs={2} md={1} className="d-flex align-items-center justify-content-center">
                                <FontAwesomeIcon icon={getStatusIcon(evalData.status)} spin={evalData.status === "running"} />
                            </Col>

                            <Col className="d-flex align-items-center">
                                <Link to={`/evaluation/${evalData.id}`}>
                                    {evalData.name ? evalData.name : "Link"}
                                </Link>
                            </Col>

                            <Col xs={4} className="d-flex align-items-center justify-content-end">
                                {evalData.created.toLocaleString()}
                            </Col>
                        </Row>
                    ))}
                </Card.Body>
            </Card>
        </div>
    );
}

export default EvalList;
