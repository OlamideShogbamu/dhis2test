from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq
import openai

import os
load_dotenv()

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://dsndhistestenv.org.ng:7474"}})

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
openai.api_key = OPENAI_API_KEY

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
# This is where your cached data will be stored
cached_data = None
# Initialize Groq client
# client = Groq()

@app.route("/store_data", methods=["POST"])
def store_data():
    global cached_data
    cached_data = request.json.get("data")
    return jsonify({"status": "success", "message": "Data cached successfully!"})

@app.route("/query", methods=["POST"])
def handle_query():
    global cached_data

    query = request.json.get("query")

    # Check if data is available
    if cached_data is None:
        return jsonify({"response": "No data available"})

    # Here we query the LLaMA model with the provided query and cached data
    try:
        # Create the prompt dynamically using the cached data and user query
        prompt = (
            f"You are provided with tabular data: {cached_data}. "
            f"Clean the data and represent it as a pivot table for better readability. "
            f"Using this pivot table, answer the following query: {query}. "
            f"Do not include the process or steps taken in your output; only provide the final answer. "
            "If the query is unrelated, respond responsibly as a helpful assistant."
        )

        # Use Groq LLaMA model to generate a response
        # completion = client.chat.completions.create(
        #     model="llama3-8b-8192",
        #     messages=[{"role": "user", "content": prompt}],
        #     temperature=1,
        #     max_tokens=1024,
        #     top_p=1,
        #     stream=True
        # )

        # Use OpenAI API to generate a response
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=1,
            max_tokens=1024,
            top_p=1
        )

        # Collect the response
        # response = ""
        # for chunk in completion:
        #     response += chunk.choices[0].delta.content or ""
        # return jsonify({"response": response})

        # Collect the response
        reply = response['choices'][0]['message']['content']
        return jsonify({"response": reply})

    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"})

if __name__ == "__main__":
    app.run(debug=True)

