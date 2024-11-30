// Select DOM elements
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");

// Declare variable to store local data
let localData = null;

// Fetch data initially (only once, when the page is loaded)
fetch('http://dsndhistestenv.org.ng:7474/api/29/analytics/events/aggregate/g0xm5VizB64.json?dimension=pe:THIS_YEAR&dimension=bxUka3HNf3b&filter=ou:NrRCtboeRqo;FgKrT8OoV69;UOCOu5MgdXi;XYdyEv7OLuN;FkqUMS3cvWV;gXZur3GEnnd;r8CV65Rqspq;MUoCSsrqrrC;rrX6PM5moMz;QAdHkKiS86b;cqIUXRgb2Zu;e5aFiTknU18;arVCdu5jLDE;xNC1ZRHxQh3;HWDASb4vo7g;N8GkM1QRVRX;bKfkxRDFB40;uVKjUslVL4l&stage=fpKqX1KLoDj&displayProperty=NAME&totalPages=false&outputType=EVENT')
  .then(response => response.json())
  .then(data => {
    localData = data; // Cache the data
    console.log(localData);
    sendDataToBackend(localData); // Send data to backend immediately
  })
  .catch(error => console.error('Error fetching data:', error));

// Function to send the local data to the backend
async function sendDataToBackend(data) {
  try {
    const response = await fetch("https://conv-chat-a9ed4ea7ed1a.herokuapp.com/store_data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: data,  // Send the local data to the backend
      }),
    });

    const result = await response.json();
    console.log("Data sent to server:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Add event listener to the send button
sendButton.addEventListener("click", handleSendMessage);

// Add Enter key support for sending messages
userInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    handleSendMessage();
  }
});

function handleSendMessage() {
  const message = userInput.value.trim();
  if (message === "") return;

  // Add user's message to the chat window
  addMessage("user", message);

  // Clear input box
  userInput.value = "";

  // Send the user message to the backend to generate a bot response
  sendToBackend(message);
}

async function sendToBackend(message) {
  try {
    const response = await fetch("https://conv-chat-a9ed4ea7ed1a.herokuapp.com/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: message,  // Send the user's message to the backend
      }),
    });

    const result = await response.json();
    console.log("Response from server:", result.response);
    addMessage("bot", result.response);  // Display the response from the backend
  } catch (error) {
    console.error("Error:", error);
    addMessage("bot", "Error communicating with the server.");
  }
}

function addMessage(sender, text) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message", sender);
  messageElement.textContent = text;
  chatWindow.appendChild(messageElement);

  // Scroll to the bottom of the chat window
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
