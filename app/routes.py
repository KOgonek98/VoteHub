from flask import Blueprint, jsonify, request, render_template

from app import db
from app.models import Poll, PollOption, Vote

main = Blueprint("main", __name__)


# ==================================================
# FRONTEND
# ==================================================

@main.route("/")
def index():

    return render_template("index.html")


@main.route("/create")
def create_page():

    return render_template("create_poll.html")


@main.route("/poll/<int:poll_id>")
def poll_page(poll_id):

    return render_template(
        "poll.html",
        poll_id=poll_id
    )


# ==================================================
# API - LISTA GŁOSOWAŃ
# ==================================================

@main.route("/api/polls", methods=["GET"])
def get_polls():

    polls = Poll.query.order_by(
        Poll.created_at.desc()
    ).all()

    return jsonify([
        {
            "id": poll.id,
            "question": poll.question,
            "active": poll.active,
            "options": [
                {
                    "id": option.id,
                    "text": option.text
                }
                for option in poll.options
            ]
        }
        for poll in polls
    ])


# ==================================================
# API - TWORZENIE GŁOSOWANIA
# ==================================================

@main.route("/api/polls", methods=["POST"])
def create_poll():

    data = request.get_json()

    if not data:

        return jsonify({
            "error": "Invalid JSON"
        }), 400

    question = data.get("question")
    options = data.get("options")

    if not question or not options:

        return jsonify({
            "error": "Question and options are required"
        }), 400

    question = question.strip()

    options = [
        option.strip()
        for option in options
        if option.strip()
    ]

    if len(question) == 0:

        return jsonify({
            "error": "Question cannot be empty"
        }), 400

    if len(options) < 2:

        return jsonify({
            "error": "At least two options are required"
        }), 400

    if len(options) > 10:

        return jsonify({
            "error": "Maximum 10 options allowed"
        }), 400

    if len(set(options)) != len(options):

        return jsonify({
            "error": "Options cannot be duplicated"
        }), 400

    poll = Poll(
        question=question
    )

    for option_text in options:

        poll.options.append(
            PollOption(
                text=option_text
            )
        )

    db.session.add(poll)

    db.session.commit()

    return jsonify({
        "message": "Poll created",
        "poll_id": poll.id
    }), 201


# ==================================================
# API - SZCZEGÓŁY I WYNIKI
# ==================================================

@main.route(
    "/api/polls/<int:poll_id>",
    methods=["GET"]
)
def get_poll(poll_id):

    poll = Poll.query.get_or_404(poll_id)

    results = []

    for option in poll.options:

        vote_count = Vote.query.filter_by(
            option_id=option.id
        ).count()

        results.append({
            "id": option.id,
            "text": option.text,
            "votes": vote_count
        })

    total_votes = sum(
        result["votes"]
        for result in results
    )

    return jsonify({
        "id": poll.id,
        "question": poll.question,
        "active": poll.active,
        "total_votes": total_votes,
        "results": results
    })


# ==================================================
# API - ODDAWANIE GŁOSU
# ==================================================

@main.route(
    "/api/polls/<int:poll_id>/vote",
    methods=["POST"]
)
def vote(poll_id):

    poll = Poll.query.get_or_404(poll_id)

    if not poll.active:

        return jsonify({
            "error": "Poll is closed"
        }), 400

    data = request.get_json()

    if not data:

        return jsonify({
            "error": "Invalid JSON"
        }), 400

    option_id = data.get("option_id")
    voter_id = data.get("voter_id")

    if not option_id or not voter_id:

        return jsonify({
            "error": "option_id and voter_id are required"
        }), 400

    option = PollOption.query.filter_by(
        id=option_id,
        poll_id=poll_id
    ).first()

    if not option:

        return jsonify({
            "error": "Invalid option"
        }), 400

    existing_vote = Vote.query.filter_by(
        poll_id=poll_id,
        voter_id=voter_id
    ).first()

    if existing_vote:

        return jsonify({
            "error": "You have already voted"
        }), 409

    new_vote = Vote(
        poll_id=poll_id,
        option_id=option_id,
        voter_id=voter_id
    )

    db.session.add(new_vote)

    db.session.commit()

    return jsonify({
        "message": "Vote registered successfully"
    }), 201

@main.route("/health")
def health():
    return {"status": "healthy"}, 200
