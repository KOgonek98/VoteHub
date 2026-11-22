const pollList = document.getElementById("poll-list");
const emptyState = document.getElementById("empty-state");

async function loadPolls() {

    try {

        const response = await fetch("/api/polls");

        const polls = await response.json();

        pollList.innerHTML = "";

        if (polls.length === 0) {

            pollList.classList.add("hidden");
            emptyState.classList.remove("hidden");

            return;
        }

        pollList.classList.remove("hidden");
        emptyState.classList.add("hidden");

        polls.forEach(poll => {

            const card = document.createElement("div");

            card.className = "poll-card";

            card.innerHTML = `
                <div class="poll-card-top">

                    <span class="status-badge ${
                        poll.active ? "active" : "closed"
                    }">

                        ${poll.active ? "Aktywne" : "Zakończone"}

                    </span>

                    <span class="poll-icon">
                        ◉
                    </span>

                </div>

                <h3>${escapeHtml(poll.question)}</h3>

                <div class="poll-card-info">

                    <span>
                        ${poll.options.length} odpowiedzi
                    </span>

                </div>

                <a
                    href="/poll/${poll.id}"
                    class="poll-card-button"
                >

                    Zobacz głosowanie
                    <span>→</span>

                </a>
            `;

            pollList.appendChild(card);

        });

    } catch (error) {

        pollList.innerHTML = `
            <div class="error-message">
                Nie udało się pobrać głosowań.
            </div>
        `;

        console.error(error);

    }

}

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}

loadPolls();
