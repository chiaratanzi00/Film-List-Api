    // =========================================================
    //                  FILM LIST - CRUD + FILTER + MODALS
    // =========================================================

    document.addEventListener("DOMContentLoaded", () => {

        // =========================================================
        // API ENDPOINT
        // =========================================================
        const API_URL = "https://690a24911a446bb9cc21897d.mockapi.io/films/films";

        // =========================================================
        // ELEMENTI DEL DOM
        // =========================================================
        const newFilmInput = document.getElementById("new-film");
        const newDirectorInput = document.getElementById("new-director");
        const newRatingInput = document.getElementById("new-rating");
        const newDateInput = document.getElementById("new-date");
        const newTimeInput = document.getElementById("new-time");
        const newComment = document.getElementById("new-comment");

        const addFilmBtn = document.getElementById("add-film");
        const filmList = document.getElementById("film-list");

        const searchTitleInput = document.getElementById("searchFilm");
        const searchRegistaInput = document.getElementById("searchRegista");

        let allFilms = [];
        let myChart = null;

        // Modali
        const editModal = new bootstrap.Modal(document.getElementById("editModal"));
        const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
        const editForm = document.getElementById("editForm");
        const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

        let currentFilm = null;
        let deleteFilmId = null;


        // =========================================================
        // FUNZIONE FETCH FILM (READ)
        // =========================================================
        function fetchFilms() {
            fetch(API_URL)
                .then(res => {
                    if (!res.ok) throw new Error("Errore nel recupero dati.");
                    return res.json();
                })
                .then(data => {
                    allFilms = data;
                    renderFilteredFilms(allFilms);
                })
                .catch(err => console.error("Errore fetch:", err));
        }


        // =========================================================
        // RENDER FILM IN LISTA
        // =========================================================
        function renderFilteredFilms(films) {

            filmList.innerHTML = "";

            if (films.length === 0) {
                filmList.innerHTML = `<p class="text-center text-light mt-4">Nessun film trovato.</p>`;
                renderChart([]);
                return;
            }

            films.forEach(film => {
                const li = document.createElement("li");
                li.classList.add(
                    "film-card",
                    "d-flex",
                    "justify-content-between",
                    "align-items-start",
                    "flex-wrap"
                );

                // Icona commento
                const commentIcon = film.comment
                    ? `<i class="bi bi-chat-text-fill comment-icon"
                        data-comment="${film.comment}"></i>`
                    : "";

                li.innerHTML = `
                    <div class="film-info flex-grow-1">
                        <div class="film-title fw-bold mb-1">
                            <i class="bi bi-person-video3 text-warning"></i> 
                            ${film.title} ${commentIcon}
                        </div>
                        <div class="film-details small">
                            🎬 <strong>Regista:</strong> ${film.regista} &nbsp;|&nbsp;
                            ⭐ <strong>Voto:</strong> ${film.voto} &nbsp;|&nbsp;
                            📅 <strong>Data:</strong> ${film.date} &nbsp;|&nbsp;
                            ⏰ <strong>Orario:</strong> ${film.time}
                        </div>
                    </div>
                `;

                // Bottoni
                const btnGroup = document.createElement("div");
                btnGroup.classList.add("film-action", "mt-2");

                const editBtn = document.createElement("button");
                editBtn.classList.add("btn", "btn-warning", "btn-sm", "m-2");
                editBtn.innerHTML = `<i class="bi bi-pencil"></i>`;
                editBtn.onclick = () => editFilm(film);

                const deleteBtn = document.createElement("button");
                deleteBtn.classList.add("btn", "btn-danger", "btn-sm");
                deleteBtn.innerHTML = `<i class="bi bi-trash"></i>`;
                deleteBtn.onclick = () => deleteFilm(film.id);

                btnGroup.append(editBtn, deleteBtn);
                li.appendChild(btnGroup);

                filmList.appendChild(li);
            });

            // ICONA COMMENTO - APRE MODALE
            document.querySelectorAll(".comment-icon").forEach(icon => {
                icon.addEventListener("click", () => {
                    document.getElementById("commentText").textContent =
                        icon.getAttribute("data-comment");
                    new bootstrap.Modal(document.getElementById("commentModal")).show();
                });
            });

            renderChart(films);
        }


        // =========================================================
        // CREATE FILM
        // =========================================================
        addFilmBtn.addEventListener("click", () => {
            const title = newFilmInput.value.trim();
            const regista = newDirectorInput.value.trim();
            const voto = newRatingInput.value.trim();
            const date = newDateInput.value.trim();
            const time = newTimeInput.value.trim();
            const comment = newComment.value.trim();

            if (!title || !regista) {
                alert("Inserisci almeno Titolo e Regista!");
                return;
            }

            const nuovoFilm = { title, regista, voto, date, time, comment };

            fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuovoFilm)
            })
                .then(res => {
                    if (!res.ok) throw new Error("Errore creazione film");
                    newFilmInput.value = "";
                    newDirectorInput.value = "";
                    newRatingInput.value = "";
                    newDateInput.value = "";
                    newTimeInput.value = "";
                    newComment.value = "";
                    fetchFilms();
                })
                .catch(err => console.error("Errore POST:", err));
        });


        // =========================================================
        //  EDIT FILM (OPEN MODAL)
        // =========================================================
        window.editFilm = function (film) {
            currentFilm = film;

            document.getElementById("editTitle").value = film.title;
            document.getElementById("editRegista").value = film.regista;
            document.getElementById("editVoto").value = film.voto;
            document.getElementById("editDate").value = film.date;
            document.getElementById("editTime").value = film.time;
            document.getElementById("editComment").value = film.comment; // FIX IMPORTANTE

            editModal.show();
        };


        // =========================================================
        //  SALVA MODIFICHE FILM (PUT)
        // =========================================================
        editForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!currentFilm) return;

            const filmAggiornato = {
                ...currentFilm,
                title: editTitle.value.trim(),
                regista: editRegista.value.trim(),
                voto: editVoto.value.trim(),
                date: editDate.value.trim(),
                time: editTime.value.trim(),
                comment: editComment.value.trim()
            };

            fetch(`${API_URL}/${currentFilm.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filmAggiornato)
            })
                .then(res => {
                    if (!res.ok) throw new Error("Errore aggiornamento");
                    editModal.hide();
                    fetchFilms();
                })
                .catch(err => console.error("Errore PUT:", err));
        });


        // =========================================================
        //  DELETE FILM (MODALE + DELETE)
        // =========================================================
        window.deleteFilm = function (id) {
            deleteFilmId = id;

            fetch(`${API_URL}/${id}`)
                .then(res => res.json())
                .then(film => {
                    document.getElementById("deleteFilmTitle").textContent = film.title;
                    deleteModal.show();
                });
        };

        confirmDeleteBtn.addEventListener("click", () => {
            if (!deleteFilmId) return;

            fetch(`${API_URL}/${deleteFilmId}`, { method: "DELETE" })
                .then(res => {
                    if (!res.ok) throw new Error("Errore eliminazione");
                    deleteModal.hide();
                    fetchFilms();
                })
                .catch(err => console.error("Errore DELETE:", err));
        });


        // =========================================================
        // FILTRI DI RICERCA
        // =========================================================
        searchTitleInput.addEventListener("input", e => {
            const search = e.target.value.toLowerCase();
            const filtered = allFilms.filter(f => f.title.toLowerCase().includes(search));
            renderFilteredFilms(filtered);
        });

        searchRegistaInput.addEventListener("input", e => {
            const search = e.target.value.toLowerCase();
            const filtered = allFilms.filter(f => f.regista.toLowerCase().includes(search));
            renderFilteredFilms(filtered);
        });


        // =========================================================
        // CHART JS
        // =========================================================
        function renderChart(films) {
            const ctx = document.getElementById("myChart");
            if (!ctx) return;

            const labels = films.map(f => f.title);
            const data = films.map(f => Number(f.voto) || 0);

            if (myChart) {
                myChart.data.labels = labels;
                myChart.data.datasets[0].data = data;
                myChart.update();
                return;
            }

            myChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels,
                    datasets: [{
                        label: "Voto",
                        data,
                        borderWidth: 3,
                        backgroundColor: "rgba(255,193,7,0.4)",
                        borderColor: "rgba(255,193,7,1)"
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, max: 10 },
                        x: {}
                    }
                }
            });
        }


        // =========================================================
        // AVVIO APP
        // =========================================================
        fetchFilms();
    });