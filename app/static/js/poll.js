const pollContent = document.getElementById("poll-content");

const voterId = getVoterId();

let selectedOption = null;

let alreadyVoted = localStorage.getItem(
    `voted_${POLL_ID}`
) === "true";

async function loadPoll() {

    try {

        const response = await fetch(`/api/polls/${POLL_ID}`);

        if (!response.ok) {

            pollContent.innerHTML = `
                <div class="error-message">
                    Nie znaleziono głosowania.
                </div>
            `;

            return;
        }

        const poll = await response.json();

        renderPoll(poll);

    } catch (error) {

        console.error(error);

        pollContent.innerHTML = `
            <div class="error-message">
                Błąd połączenia z serwerem.
            </div>
        `;

    }

}

function renderPoll(poll) {

    const totalVotes = poll.total_votes;

    let optionsHtml = "";

    poll.results.forEach(option => {

        const percentage = totalVotes > 0
            ? (option.votes / totalVotes) * 100
            : 0;

        optionsHtml += `
            <div class="result-option">

                <div class="result-header">

                    <span class="result-name">
                        ${escapeHtml(option.text)}
                    </span>

                    <span class="result-numbers">
                        ${option.votes} głosów
                        ·
                        ${percentage.toFixed(1)}%
                    </span>

                </div>

                <div class="result-bar">

                    <div
                        class="result-bar-fill"
                        style="width: ${percentage}%"
                    ></div>

                </div>

            </div>
        `;

    });

    let votingHtml = "";

    if (poll.active && !alreadyVoted) {

        votingHtml = `
            <div class="voting-section">

                <h3>Oddaj swój głos</h3>

                <p>
                    Wybierz jedną z dostępnych odpowiedzi.
                </p>

                <div class="voting-options">

                    ${poll.results.map(option => `
                        <button
   				 class="vote-option ${selectedOption == option.id ? "selected" : ""}"
   				 data-option-id="${option.id}"
			>

                            <span class="vote-option-radio"></span>

                            ${escapeHtml(option.text)}

                        </button>
                    `).join("")}

                </div>

                <button
 			id="submit-vote"
    			class="button-primary full-width"
    			${selectedOption ? "" : "disabled"}
		>
                    Oddaj głos
                </button>

                <div id="vote-error" class="error-message hidden"></div>

            </div>
        `;

    } else if (alreadyVoted) {

        votingHtml = `
            <div class="success-message">

                <span>✓</span>

                <div>

                    <strong>Twój głos został oddany.</strong>

                    <p>
                        Możesz obserwować aktualne wyniki.
                    </p>

                </div>

            </div>
        `;

    } else {

        votingHtml = `
            <div class="closed-message">
                To głosowanie zostało zakończone.
            </div>
        `;

    }

    pollContent.innerHTML = `

        <div class="poll-detail-card">

            <div class="poll-detail-header">

                <span class="status-badge ${
                    poll.active ? "active" : "closed"
                }">

                    ${poll.active ? "Aktywne głosowanie" : "Zakończone"}

                </span>

            </div>

            <h1>
                ${escapeHtml(poll.question)}
            </h1>

            <div class="poll-stats">

                <div class="stat">

                    <span class="stat-value">
                        ${totalVotes}
                    </span>

                    <span class="stat-label">
                        Oddanych głosów
                    </span>

                </div>

                <div class="stat">

                    <span class="stat-value">
                        ${poll.results.length}
                    </span>

                    <span class="stat-label">
                        Opcji
                    </span>

                </div>

            </div>

            ${votingHtml}

            <div class="results-section">

                <div class="results-header">

                    <h3>Aktualne wyniki</h3>

                    <span class="live-indicator">
                        <span class="live-dot"></span>
                        LIVE
                    </span>

                </div>

                ${optionsHtml}

            </div>

        </div>

    `;

    if (poll.active && !alreadyVoted) {

        setupVoting();

    }

}

function setupVoting() {

    const voteButtons = document.querySelectorAll(
        ".vote-option"
    );

    const submitButton = document.getElementById(
        "submit-vote"
    );

    voteButtons.forEach(button => {

        button.addEventListener("click", () => {

            voteButtons.forEach(btn => {
                btn.classList.remove("selected");
            });

            button.classList.add("selected");

            selectedOption = button.dataset.optionId;

            submitButton.disabled = false;

        });

    });

    submitButton.addEventListener("click", async () => {

        if (!selectedOption) {
            return;
        }

        submitButton.disabled = true;

        submitButton.textContent = "Wysyłanie głosu...";

        try {

            const response = await fetch(
                `/api/polls/${POLL_ID}/vote`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        option_id: Number(selectedOption),
                        voter_id: voterId
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                const errorBox = document.getElementById(
                    "vote-error"
                );

                errorBox.textContent = data.error;

                errorBox.classList.remove("hidden");

                submitButton.disabled = false;

                submitButton.textContent = "Oddaj głos";

                return;
            }

            localStorage.setItem(
                `voted_${POLL_ID}`,
                "true"
            );

            alreadyVoted = true;

            await loadPoll();

        } catch (error) {

            console.error(error);

            submitButton.disabled = false;

            submitButton.textContent = "Oddaj głos";

        }

    });

}

function getVoterId() {

    let id = localStorage.getItem("votehub_voter_id");

    if (!id) {

        if (typeof crypto !== "undefined" && crypto.randomUUID) {

            id = crypto.randomUUID();

        } else {

            id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
                /[xy]/g,
                function (c) {

                    const r = Math.random() * 16 | 0;

                    const v = c === "x" ? r : (r & 0x3 | 0x8);

                    return v.toString(16);

                }
            );

        }

        localStorage.setItem(
            "votehub_voter_id",
            id
        );

    }

    return id;

}

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}

loadPoll();

/*
 * Aktualizacja wyników co 3 sekundy.
 * Nie jest to jeszcze SSE/WebSocket.
 */
setInterval(() => {

    loadPoll();

}, 3000);
