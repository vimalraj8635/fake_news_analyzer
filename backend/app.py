from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import requests
from bs4 import BeautifulSoup
from googlesearch import search
import sqlite3
from datetime import timedelta, datetime, timezone  # 👈 Added timezone

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
jwt = JWTManager(app)

TRUSTED_SOURCES = [
    "bbc.com", "cnn.com", "reuters.com", "nytimes.com", "theguardian.com",
    "forbes.com", "npr.org", "washingtonpost.com", "aljazeera.com", "dw.com",
    "bloomberg.com", "indiatoday.in", "ndtv.com", "thehindu.com",
    "timesofindia.indiatimes.com", "hindustantimes.com", "deccanherald.com",
    "news18.com", "financialexpress.com", "livemint.com", "business-standard.com",
    "vikatan.com", "dinamani.com", "dinakaran.com"
]

# ---------- Database Setup ----------
conn = sqlite3.connect('fake_news.db', check_same_thread=False)
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)''')
c.execute('''CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY, username TEXT, query TEXT, result TEXT, timestamp TEXT)''')
conn.commit()

# ---------- Routes ----------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    c.execute("SELECT * FROM users WHERE username=?", (username,))
    if c.fetchone():
        return jsonify({"error": "User already exists"}), 400

    c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
    conn.commit()
    return jsonify({"message": "User created successfully"})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    c.execute("SELECT * FROM users WHERE username=? AND password=?", (username, password))
    if not c.fetchone():
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=username)
    return jsonify({"access_token": access_token})

@app.route("/analyze", methods=["POST"])
@jwt_required()
def analyze():
    data = request.json
    news_text = data.get("text")
    username = get_jwt_identity()

    if not news_text:
        return jsonify({"error": "Text is required"}), 400

    search_results = google_search(news_text)
    credibility_score = check_credibility(search_results)
    label = "Real News" if credibility_score >= 20 else "Fake News"

    # ✅ Fixed DeprecationWarning: Use timezone-aware UTC
    timestamp = datetime.now(timezone.utc).isoformat()

    c.execute("INSERT INTO history (username, query, result, timestamp) VALUES (?, ?, ?, ?)", 
              (username, news_text, label, timestamp))
    conn.commit()

    return jsonify({
        "search_results": search_results,
        "label": label,
        "timestamp": timestamp
    })

@app.route("/history", methods=["GET"])
@jwt_required()
def history():
    username = get_jwt_identity()
    c.execute("SELECT query, result, timestamp FROM history WHERE username=?", (username,))
    results = c.fetchall()
    return jsonify([{"query": row[0], "result": row[1], "timestamp": row[2]} for row in results])

# ---------- Helper Functions ----------
def google_search(query):
    search_results = []
    for url in search(query, num_results=5):
        search_results.append({"url": url, "title": extract_title(url)})
    return search_results

def extract_title(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")
        return soup.title.string if soup.title else "No title found"
    except:
        return "Title extraction failed"

def check_credibility(search_results):
    credible_count = sum(1 for result in search_results if any(source in result["url"] for source in TRUSTED_SOURCES))
    return (credible_count / len(search_results)) * 100 if search_results else 0

if __name__ == "__main__":
    app.run(debug=True)
