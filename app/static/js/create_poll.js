const form = document.getElementById("create-poll-form");

const optionsContainer = document.getElementById("options-container");

const addOptionButton = document.getElementById("add-option");

const errorBox = document.getElementById("form-error");

let optionCount = 2;

addOptionButton.addEventListener("click", () => {

    if (optionCount >= 10) {

        showError("Maksymalnie możesz dodać 10 odpowiedzi.");

        return;
    }

    optionCount++;

    const optionDiv = document.createElement("div");

    optionDiv.className = "option-input";

    optionDiv.innerHTML = `
        <input
            type="text"
            class="option-field"
            placeholder="Odpowiedź ${optionCount}"
            required
        >

        <button
            type="button"
            class="remove-option"
            title="Usuń odpowiedź"
        >
            ×
        </button>
    `;

    optionsContainer.appendChild(optionDiv);

    optionDiv.querySelector(".remove-option")
        .addEventListener("click", () => {

            optionDiv.remove();

            optionCount--;

            updatePlaceholders();

        });

});

form.addEventListener("submit", async event => {

    event.preventDefault();

    hideError();

    const question = document
        .getElementById("question")
        .value
        .trim();

    const options = Array.from(
        document.querySelectorAll(".option-field")
    )
        .map(input => input.value.trim())
        .filter(value => value !== "");

    if (!question) {

        showError("Podaj pytanie.");

        return;
    }

    if (options.length < 2) {

        showError("Dodaj przynajmniej dwie odpowiedzi.");

        return;
    }

    if (new Set(options).size !== options.length) {

        showError("Odpowiedzi nie mogą się powtarzać.");

        return;
    }

    const submitButton = form.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;

    submitButton.textContent = "Tworzenie...";

    try {

        const response = await fetch("/api/polls", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question,
                options: options
            })

        });

        const data = await response.json();

        if (!response.ok) {

            showError(data.error || "Nie udało się utworzyć głosowania.");

            return;
        }

        window.location.href = `/poll/${data.poll_id}`;

    } catch (error) {

        showError("Błąd połączenia z serwerem.");

        console.error(error);

    } finally {

        submitButton.disabled = false;

        submitButton.textContent = "Utwórz głosowanie";

    }

});

function showError(message) {

    errorBox.textContent = message;

    errorBox.classList.remove("hidden");

}

function hideError() {

    errorBox.classList.add("hidden");

}

function updatePlaceholders() {

    document.querySelectorAll(".option-field")
        .forEach((input, index) => {

            input.placeholder = `Odpowiedź ${index + 1}`;

        });

}
