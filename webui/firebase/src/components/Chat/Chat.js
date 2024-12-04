import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { MessageList, Input } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import ReactMarkdown from 'react-markdown';


function Chat({ selectedEndpoint, customEndpoint, setCustomEndpoint }) {
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const socketRef = useRef(null);
    const messageBufferRef = useRef('');

    const initializeWebSocket = (url) => {
        socketRef.current = new WebSocket(url);
        socketRef.current.onopen = () => console.log('WebSocket connection established');
        socketRef.current.onmessage = (event) => {
            setIsLoading(false);
            messageBufferRef.current += event.data;

            if (event.data.includes('[[END]]')) {
                console.log('Detected [[END]] in message buffer');
                const processedMessage = messageBufferRef.current.replace('[[END]]', '');
                setMessages(prevMessages => [
                   ...prevMessages.slice(0, -1),
                    {
                       ...prevMessages[prevMessages.length - 1],
                        text: processedMessage
                    }
                ]);
                messageBufferRef.current = ''; // Now it's safe to clear the buffer
            } else {
                // Update the last message with the ongoing text
                const partialMessage = messageBufferRef.current;
                setMessages(prevMessages => [
                   ...prevMessages.slice(0, -1),
                    {
                       ...prevMessages[prevMessages.length - 1],
                        text: partialMessage
                    }
                ]);
                // No need to clear the buffer here, as we're still receiving the message
            }
        };

        socketRef.current.onclose = () => console.log('WebSocket connection closed');
        socketRef.current.onerror = (error) => console.error('WebSocket error:', error);
    };

    useEffect(() => {
        if (selectedEndpoint || customEndpoint) {
            const endpointUrl = customEndpoint || selectedEndpoint;
            initializeWebSocket(endpointUrl);
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [selectedEndpoint, customEndpoint]);

    const sendMessage = () => {
        if (newMessage.trim() !== '' && socketRef.current?.readyState === WebSocket.OPEN) {
            setIsLoading(true);
            setMessages(prevMessages => [
                ...prevMessages,
                { id: prevMessages.length, text: newMessage, type: 'text', position: 'right', title: 'User' },
                { id: prevMessages.length + 1, text: '', type: 'text', position: 'left', title: 'Bot' }
            ]);
            socketRef.current.send(JSON.stringify({ message: newMessage }));
            setNewMessage('');
        } else if (customEndpoint.trim() !== '') {
            initializeWebSocket(customEndpoint);
            setCustomEndpoint('');
        }
    };

    return (
        <div className="chat-container" style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f5f5f5' }}>
            <MessageList
                className='message-list'
                lockable={true}
                toBottomHeight={'100%'}
                dataSource={messages.map((msg, index) => ({
                    position: msg.position,
                    type: msg.type,
                    title: msg.title,
                    text: <ReactMarkdown>{msg.text}</ReactMarkdown>,
                    date: new Date(),
                    messageId: index
                }))}
            />

            {isLoading && (
                <div className="loading-animation">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                </div>
            )}

            <Input
                placeholder="Type question to ask..."
                multiline={true}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rightButtons={
                    <Button variant="primary" onClick={sendMessage}>
                        Ask
                    </Button>
                }
            />
        </div>
    );
}

export default Chat;
