import os, json
from flask import Flask, jsonify, request
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RESP_FILE = os.path.join(BASE_DIR, "responses.json")


def load_responses():
	if not os.path.exists(RESP_FILE):
		return []
	with open(RESP_FILE) as f:
		return json.load(f)


def save_responses(all_rows):
	with open(RESP_FILE, "w") as f:
		json.dump(all_rows, f, indent=2)


@app.get("/api/survey")
def get_survey():
	with open(os.path.join(BASE_DIR, "outcomes.json")) as f:
		return jsonify(json.load(f))


@app.get("/api/categories")
def get_categories():
	with open(os.path.join(BASE_DIR, "categories.json")) as f:
		return jsonify(json.load(f))


@app.get("/api/strings")
def get_strings():
	with open(os.path.join(BASE_DIR, "strings.json")) as f:
		return jsonify(json.load(f))


@app.get("/api/survey-meta")
def get_survey_meta():
	with open(os.path.join(BASE_DIR, "survey-meta.json")) as f:
		return jsonify(json.load(f))


@app.get("/api/respondent")
def get_respondent():
	token = request.headers.get("X-Token")
	if not token:
		return jsonify({"error": "Missing token"}), 400

	with open(os.path.join(BASE_DIR, "tokens.json")) as f:
		tokens = json.load(f)

	respondent = tokens.get(token)
	if not respondent:
		return jsonify({"error": "Invalid token"}), 403

	return jsonify({
		"name": respondent.get("name", ""),
		"respondentId": respondent.get("respondentId")
	})


@app.post("/api/submit")
def submit_response():
	token = request.headers.get("X-Token")
	if not token:
		return jsonify({"error": "Missing token"}), 400

	with open(os.path.join(BASE_DIR, "tokens.json")) as f:
		tokens = json.load(f)

	respondent = tokens.get(token)
	if not respondent:
		return jsonify({"error": "Invalid token"}), 403

	data = request.get_json()
	answers = data.get("answers", [])

	new_rows = []
	for a in answers:
		new_rows.append({
			"timestamp": datetime.utcnow().isoformat(),
			"respondentId": respondent["respondentId"],
			"outcomeId": a["outcomeId"],
			"importance": a["importance"],
			"satisfaction": a["satisfaction"]
		})

	all_rows = load_responses()
	all_rows.extend(new_rows)
	save_responses(all_rows)

	return jsonify({"status": "saved", "name": respondent.get("name", "")})


if __name__ == "__main__":
	app.run(debug=True, port=5000)