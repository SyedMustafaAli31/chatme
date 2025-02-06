<!DOCTYPE html>
<html>
<head>
    <title>Private Chat</title>
    <style>
        #chat-container {
            width: 600px;
            margin: 0 auto;
            border: 1px solid #ccc;
            padding: 20px;
        }
        #messages {
            height: 400px;
            overflow-y: auto;
            border: 1px solid #eee;
            padding: 10px;
            margin-bottom: 10px;
        }
        .message {
            margin-bottom: 10px;
            padding: 5px;
            border-radius: 5px;
        }
        .emoji-picker {
            display: none;
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            padding: 10px;
        }
        .media {
            max-width: 200px;
            max-height: 200px;
        }
    </style>
</head>
<body>
    <div id="chat-container">
        <div id="messages"></div>
        <div class="emoji-picker" id="emoji-picker">😀 😁 😂 🤣 😃 😄 😅</div>
        <input type="file" id="file-input" accept="image/*,video/*" style="display: none;">
        <div>
            <button onclick="toggleEmojiPicker()">😀</button>
            <button onclick="document.getElementById('file-input').click()">📎</button>
            <input type="text" id="message-input" style="width: 400px;">
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
    <script>
        const socket = io();
        const messages = document.getElementById('messages');
        const messageInput = document.getElementById('message-input');

        // Request notification permission
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        // Socket.io handlers
        socket.on('message', (data) => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.innerHTML = `
                <div><strong>${data.sender}:</strong> ${data.message}</div>
                <small>${new Date().toLocaleTimeString()}</small>
            `;
            messages.appendChild(messageDiv);
            
            // Show notification
            if (document.hidden) {
                new Notification('New message', { body: data.message });
            }
        });

        socket.on('media', (data) => {
            const mediaDiv = document.createElement('div');
            mediaDiv.className = 'message';
            mediaDiv.innerHTML = `
                <strong>${data.sender} sent:</strong><br>
                ${data.type === 'image' ? 
                    `<img src="${data.url}" class="media">` : 
                    `<video controls class="media"><source src="${data.url}"></video>`}
                <small>${new Date().toLocaleTimeString()}</small>
            `;
            messages.appendChild(mediaDiv);
        });

        // Message sending
        function sendMessage() {
            const message = messageInput.value;
            if (message.trim()) {
                socket.emit('message', { message });
                messageInput.value = '';
            }
        }

        // Emoji handling
        function toggleEmojiPicker() {
            const picker = document.getElementById('emoji-picker');
            picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
        }

        document.getElementById('emoji-picker').addEventListener('click', (e) => {
            if (e.target.tagName === 'SPAN') {
                messageInput.value += e.target.textContent;
            }
        });

        // File handling
        document.getElementById('file-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                socket.emit('media', {
                    type: file.type.startsWith('image') ? 'image' : 'video',
                    url: event.target.result
                });
            };
            reader.readAsDataURL(file);
        });

        // Enter key handler
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    </script>
</body>
<script src="server.js"></script>
</html>
