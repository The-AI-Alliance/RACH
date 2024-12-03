import React, { useState } from "react";
import { Button, Form, Row, Col, Card, Accordion } from "react-bootstrap";
import { httpsCallable } from "firebase/functions";
import {auth, functions} from "../firebase";
import { useNavigate } from 'react-router-dom';

import { tasks } from "../assets/tasks"; // Updated import path

function RecursiveAccordion({ data, path, onSelectionChange, formData }) {
    return (
        <Accordion defaultActiveKey="0">
            {Object.entries(data).map(([key, value], index) => {
                const currentPath = path ? `${path}.${key}` : key;
                if (typeof value === 'object' && !value.name) {
                    return (
                        <Accordion.Item eventKey={index} key={currentPath}>
                            <Accordion.Header>{key}</Accordion.Header>
                            <Accordion.Body>
                                <RecursiveAccordion data={value} path={currentPath} onSelectionChange={onSelectionChange} formData={formData} />
                            </Accordion.Body>
                        </Accordion.Item>
                    );
                } else {
                    return (
                        <Form.Check
                            key={currentPath}
                            type="checkbox"
                            label={`${value.name}: ${value.desc}`}
                            name={currentPath}
                            checked={formData[currentPath] || false}
                            onChange={onSelectionChange}
                        />
                    );
                }
            })}
        </Accordion>
    );
}

function CreateTask() {
    const [formData, setFormData] = useState({
        model: "local-chat-completions",
        model_args: "model=anthropic.claude-3-sonnet-20240229-v1:0,base_url=http://Bedroc-Proxy-rOBzmhRsK7sv-331824334.us-east-1.elb.amazonaws.com/api/v1/chat/completions"
    });

    const handleChange = (event) => {
        const { name, checked } = event.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: checked,
        }));
    };

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
    event.preventDefault();

    // Collect selected tasks
    const selectedTasks = Object.entries(formData)
        .filter(([key, value]) => value && !["model", "model_args"].includes(key))
        .map(([key]) => key.split('.').pop()); // Only take the last part of the key

    // Ensure selectedTasks is defined
    if (!selectedTasks.length) {
        console.warn("No tasks selected");
        return;
    }

    try {
        const submissionData = {
            ...formData,
            tasks: selectedTasks,
            userId: auth.currentUser.uid,
            apply_chat_template: "",
        };
        console.log("Submission Data:", submissionData);

        const callEval = httpsCallable(functions, 'call_eval');
        const result = await callEval(submissionData);
        console.log("Function Result:", result); // Handle response

        if (result.data.ticket) {
            navigate(`/evaluation/${result.data.ticket}`);
        }
    } catch (error) {
        console.error("Error calling Firebase function:", error);
    }
};

    return (
        <div className="page-background">
            <Card className="m-4 custom-card">
                <Card.Header>Create Evaluation</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col}>
                                <Form.Label>Model</Form.Label>
                                <Form.Select
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                >
                                    <option value="local-completions">Anthropic Claude 3 - Sonnet (on AWS Bedrock)</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label>Model Args</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="model_args"
                                    value={formData.model_args}
                                    disabled
                                />
                            </Form.Group>
                        </Row>
                        <Form.Group className="mb-3">
                            <RecursiveAccordion data={tasks} path="" onSelectionChange={handleChange} formData={formData} />
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={Object.values(formData).filter(value => value).length === 0}>
                            Submit
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default CreateTask;
