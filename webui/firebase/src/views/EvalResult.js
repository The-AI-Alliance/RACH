import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {auth, db} from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Button, Card } from "react-bootstrap";



function EvalResult() {
    let { id } = useParams();
    const [evalData, setEvalData] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false); // To track editing state
    const [editedName, setEditedName] = useState(""); // To store the edited name


    useEffect(() => {
        let docRef = doc(db, "users", auth.currentUser.uid, "evals", id);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setEvalData(docSnap.data());
            } else {
                console.log("No such document!:", id);
            }
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, [id]); // Dependency array to refetch if id changes

    const handleEditClick = () => {
        setIsEditingName(true);
    };

    const handleNameChange = (e) => {
        setEditedName(e.target.value);
    };
    const handleSaveName = async () => {
        const docRef = doc(db, "users", auth.currentUser.uid, "evals", id);
        try {
            await updateDoc(docRef, {
                name: editedName
            });
            setIsEditingName(false); // Exit editing state
        } catch (error) {
            console.error("Error updating document:", error);
        }
    };

    if (!evalData) {
        return (
            <div className="page-background" >
                <Card className="m-4 custom-card">
                    <Card.Body>
                        Loading...
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <div className="page-background" >
            <Card className="m-4 custom-card">
            <Card.Body>
                <Card.Title>Evaluation Result</Card.Title>
                <Card.Text>
                    Name: {!isEditingName ? (
                    <span onClick={handleEditClick}>{evalData.name || "Click me!"}</span>
                ) : (
                    <>
                        <input
                            type="text"
                            value={editedName}
                            onChange={handleNameChange}
                            style={{ marginRight: '8px' }} // Add margin to the right of the text box
                        />
                        <Button onClick={handleSaveName} size="sm">Save</Button>
                    </>
                )}
                </Card.Text>
                <Card.Text>Status: {evalData.status}</Card.Text>
                <Card.Text>Created: {evalData.created.toDate().toLocaleString()}</Card.Text>
                <Card.Text>Arguments: {evalData.args.join(' ')}</Card.Text>

                {evalData.stack_trace && (
                    <>
                        <Card.Text>Stack Trace:</Card.Text>
                        <Card.Text className="text-muted">{evalData.stack_trace}</Card.Text>
                    </>
                )}
                {evalData.error && (
                    <>
                        <Card.Text>Error:</Card.Text>
                        <Card.Text className="text-muted">{evalData.error}</Card.Text>
                    </>
                )}
                {evalData.data && (
                    <Card.Text>
                        Results:
                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(evalData.data.results, null, 2)}</pre>
                    </Card.Text>
                )}
            </Card.Body>
        </Card>
        </div>
    );
}

export default EvalResult;
