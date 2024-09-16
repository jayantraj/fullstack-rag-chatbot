import React, { useState, useEffect, useRef } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      message: "Whispers of wisdom await... Ask your question!",
      sentTime: "just now",
      sender: "ChatBot",
      style: { fontFamily: 'Courier, monospace' }
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [fileName, setFileName] = useState('');

  // WebSocket reference
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/ws");

    ws.current.onopen = () => console.log("WebSocket connection established");

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            message: data.response,
            sentTime: "just now",
            sender: "ChatBot",
            style: { backgroundColor: "green" }
          }
        ]);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
      setIsTyping(false);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => console.log("WebSocket connection closed");

    return () => {
      ws.current.close();
    };
  }, []);

  // Function to handle sending messages
  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user",
      style: { backgroundColor: "blue" } // Set background color for user messages
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsTyping(true);

    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ query: message }));
    } else {
      console.error("WebSocket is not open");
    }
  };

  // Function to handle file selection
  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
    setFileName(event.target.files[0]?.name || '');
  };

  // Function to handle file upload
  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadStatus('No files selected.');
      return;
    }

    setUploadStatus('Embedding PDF...');

    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("http://localhost:8000/upload_pdfs/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const result = await response.json();
      setUploadStatus('Task Complete!');
      console.log("Files uploaded successfully:", result);
    } catch (error) {
      setUploadStatus('Error uploading files.');
      console.error("Error uploading files:", error);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: "20px" }}>
      {/* Container for buttons on the left */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "40px" }}>
        {/* PDF Upload Section */}
        <input 
          type="file" 
          multiple 
          accept=".pdf" 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          id="file-upload"
        />
        <label 
          htmlFor="file-upload" 
          style={{ 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none", 
            padding: "10px 20px", 
            borderRadius: "4px", 
            cursor: "pointer", 
            marginBottom: "50px",
            display: "block",
            width:"150px",
            textAlign: "center" 
          }}
        >
          Upload PDF
        </label>
        {fileName && <p style={{ marginTop: "5px", color: "#007bff" }}>{fileName}</p>}
        <button 
          onClick={handleFileUpload} 
          style={{ 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none", 
            padding: "10px 20px", 
            borderRadius: "4px", 
            cursor: "pointer",
            width:"150px",
            marginTop: "20px"
          }}
        >
          Submit
        </button>
        {uploadStatus && <p style={{ marginTop: "40px" }}>{uploadStatus}</p>}
      </div>
      {/* Chatbox container shifted to the right */}
      <div style={{ width: "85%", maxWidth: "1100px" }}>
        <div style={{ position: "relative", height: "600px", width: "100%" }}>
          <MainContainer style={{ backgroundColor: "green" }}>
            <ChatContainer style={{ backgroundColor: "green" }}>
              <MessageList
                scrollBehavior="smooth"
                typingIndicator={isTyping ? <TypingIndicator content="ChatBot is typing..." /> : null}
              >
                {messages.map((message, i) => (
                  <Message 
                    key={i} 
                    model={{ 
                      message: message.message, 
                      sentTime: message.sentTime, 
                      sender: message.sender, 
                      style: message.style 
                    }} 
                    className={message.sender === "user" ? "user-message" : "chatbot-message"} // Apply appropriate class
                  />
                ))}
              </MessageList>
              <MessageInput placeholder="Your curiosity is my command..." onSend={handleSend} attachButton={false} />
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
