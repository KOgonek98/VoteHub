from datetime import datetime, timezone

from app import db

class Poll(db.Model):

    __tablename__ = "polls"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    question = db.Column(
        db.String(500),
        nullable=False
    )

    active = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    options = db.relationship(
        "PollOption",
        backref="poll",
        cascade="all, delete-orphan"
    )

    votes = db.relationship(
        "Vote",
        backref="poll",
        cascade="all, delete-orphan"
    )

class PollOption(db.Model):

    __tablename__ = "poll_options"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    poll_id = db.Column(
        db.Integer,
        db.ForeignKey("polls.id"),
        nullable=False
    )

    text = db.Column(
        db.String(200),
        nullable=False
    )

    votes = db.relationship(
        "Vote",
        backref="option",
        cascade="all, delete-orphan"
    )

class Vote(db.Model):

    __tablename__ = "votes"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    poll_id = db.Column(
        db.Integer,
        db.ForeignKey("polls.id"),
        nullable=False
    )

    option_id = db.Column(
        db.Integer,
        db.ForeignKey("poll_options.id"),
        nullable=False
    )

    voter_id = db.Column(
        db.String(100),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    __table_args__ = (
        db.UniqueConstraint(
            "poll_id",
            "voter_id",
            name="unique_vote_per_user"
        ),
    )
