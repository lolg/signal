from flask import Flask, request, jsonify
import os
import json
from datetime import datetime

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# Load token map (token → respondent metadata)
def load_tokens():
	with open(os.path.join(BASE_DIR, "tokens.json")) as f:
		return json.load(f)


@app.get("/api/survey")
def get_survey():
	with open(os.path.join(BASE_DIR, "survey.json")) as f:
		return jsonify(json.load(f))

@app.get("/api/strings")
def get_strings():
	with open(os.path.join(BASE_DIR, "strings.json")) as f:
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

@app.get("/api/categories")
def get_categories():
	with open(os.path.join(BASE_DIR, "categories.json")) as f:
		return jsonify(json.load(f))


@app.get("/api/survey-meta")
def get_survey_meta():
	with open(os.path.join(BASE_DIR, "survey-meta.json")) as f:
		return jsonify(json.load(f))


@app.post("/api/submit")
def submit_response():
	token = request.headers.get("X-Token")
	if not token:
		return jsonify({"error": "Missing token"}), 400

	tokens = load_tokens()
	respondent_data = tokens.get(token)
	if not respondent_data:
		return jsonify({"error": "Invalid token"}), 403

	respondent_id = respondent_data.get("respondentId")
	respondent_name = respondent_data.get("name", "")

	if not respondent_id:
		return jsonify({"error": "Missing respondentId for token"}), 400

	data = request.get_json()
	answers = data.get("answers", [])

	output_path = os.path.join(BASE_DIR, "responses.jsonl")
	with open(output_path, "a") as f:
		for answer in answers:
			row = {
				"timestamp": datetime.utcnow().isoformat(),
				"respondentId": respondent_id,
				"outcomeId": answer["questionId"],
				"outcomeImportance": answer["importance"],
				"outcomeSatisfaction": answer["satisfaction"]
			}
			f.write(json.dumps(row) + "\n")

	return jsonify({"status": "saved", "name": respondent_name})


if __name__ == "__main__":
	app.run(debug=True)