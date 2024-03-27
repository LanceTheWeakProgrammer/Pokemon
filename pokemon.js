let currentPage = 1;
const movesPerPage = 14;
let moves = [];
let selectedMethod = '';
let startingPage = 5;
let totalPages = 0;

function getTypeColors(types) {
    return types.map(type => {
        switch (type.type.name.toUpperCase()) {
            case 'BUG':
                return { type: type.type.name, color: '#94BC4A' }; 
            case 'DARK':
                return { type: type.type.name, color: '#736C75' }; 
            case 'DRAGON':
                return { type: type.type.name, color: '#6A7BAF' }; 
            case 'ELECTRIC':
                return { type: type.type.name, color: '#E5C531' }; 
            case 'FAIRY':
                return { type: type.type.name, color: '#E397D1' }; 
            case 'FIGHTING':
                return { type: type.type.name, color: '#CB5F48' }; 
            case 'FIRE':
                return { type: type.type.name, color: '#EA7A3C' }; 
            case 'FLYING':
                return { type: type.type.name, color: '#7DA6DE' }; 
            case 'GHOST':
                return { type: type.type.name, color: '#846AB6' }; 
            case 'GRASS':
                return { type: type.type.name, color: '#71C558' }; 
            case 'GROUND':
                return { type: type.type.name, color: '#CC9F4F' }; 
            case 'ICE':
                return { type: type.type.name, color: '#70CBD4' }; 
            case 'NORMAL':
                return { type: type.type.name, color: '#AAB09F' }; 
            case 'POISON':
                return { type: type.type.name, color: '#B468B7' }; 
            case 'PSYCHIC':
                return { type: type.type.name, color: '#E5709B' }; 
            case 'ROCK':
                return { type: type.type.name, color: '#B2A061' }; 
            case 'STEEL':
                return { type: type.type.name, color: '#89A1B0' }; 
            case 'WATER':
                return { type: type.type.name, color: '#539AE2' }; 
            default:
                return { type: type.type.name, color: 'black' };
        }
    });
}

function getPokemonTypes(types) {
    return types.map(type => type.type.name).join(', ') || "N/A";
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function generatePaginationButtons(totalPages) {
    let buttonsHtml = '';

    let startPage = Math.max(currentPage - startingPage + 1, 1); 

    buttonsHtml += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="previousPage()">Previous</a>
        </li>
    `;

    if (startPage > 1) {
        buttonsHtml += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(1)">1</a>
            </li>
        `;
    }

    if (startPage > startingPage) {
        buttonsHtml += `
            <li class="page-item disabled">
                <span class="page-link">...</span>
            </li>
        `;
    }

    for (let i = startPage; i <= Math.min(startPage + startingPage - 1, totalPages); i++) {
        buttonsHtml += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }

    if (startPage + startingPage <= totalPages) {
        buttonsHtml += `
            <li class="page-item disabled">
                <span class="page-link">...</span>
            </li>
        `;
    }

    if (startPage + startingPage - 1 < totalPages) {
        buttonsHtml += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a>
            </li>
        `;
    }

    buttonsHtml += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="nextPage()">Next</a>
        </li>
    `;

    document.getElementById('pagination').innerHTML = buttonsHtml;
}

function changePage(page) {
    currentPage = page;
    getPokemonData();
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        getPokemonData();
    }
}

function nextPage() {
    const totalPages = Math.ceil(moves.length / movesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        getPokemonData();
    }
}

function displayFilteredMoves(filteredMoves) {
    const movesTableBody = document.getElementById('movesTableBody');
    const movesTable = filteredMoves.length > 0
        ? filteredMoves.map(move => `
            <tr>
                <td>${move.levelLearned}</td>
                <td>${move.name}</td>
                <td>${move.learnMethod}</td>
            </tr>`).join('')
        : '<tr><td colspan="3">No moves found</td></tr>';
    
    movesTableBody.innerHTML = movesTable;
    generatePaginationButtons(totalPages);
}

function filterMovesByMethod() {
    selectedMethod = document.getElementById('moveMethodFilter').value;
    const allMoves = moves;

    const filteredMoves = selectedMethod
        ? allMoves.filter(move => move.learnMethod.toLowerCase() === selectedMethod)
        : allMoves;

    totalPages = Math.ceil(filteredMoves.length / movesPerPage);
    currentPage = Math.min(currentPage, totalPages);

    displayFilteredMoves(filteredMoves);
    generatePaginationButtons(totalPages);
}

async function getPokemonData() {
    const pokemonName = document.getElementById('pokemonName').value;
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
    const defaultImageUrl = "C:\\Users\\HomePC\\Desktop\\Pokemon API\\question.jpg";

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        moves = data.moves.map(move => {
            const moveName = capitalizeFirstLetter(move.move.name.replace(/-/g, ''));
            const versionDetails = move.version_group_details[0];
            const levelLearned = versionDetails?.level_learned_at || 0; 
            const learnMethod = versionDetails?.move_learn_method.name || "N/A";

            const formattedLearnMethod = learnMethod.charAt(0).toUpperCase() + learnMethod.slice(1).replace(/-/g, ' ');

            return { name: moveName, levelLearned, learnMethod: formattedLearnMethod };
        }) || [];

        moves = moves.filter(move => move.levelLearned !== undefined);
        moves.sort((a, b) => a.levelLearned - b.levelLearned);
        totalPages = Math.ceil(moves.length / movesPerPage);

        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        const startIndex = (currentPage - 1) * movesPerPage;
        const endIndex = startIndex + movesPerPage;
        const displayedMoves = selectedMethod
            ? moves.filter(move => move.learnMethod.toLowerCase() === selectedMethod)
            : moves.slice(startIndex, endIndex);

        const movesTable = displayedMoves.length > 0
            ? displayedMoves.map(move => `
                <tr>
                    <td>${move.levelLearned}</td>
                    <td>${move.name}</td>
                    <td>${move.learnMethod}</td>
                </tr>`).join('')
            : '<tr><td colspan="3">No moves found</td></tr>';

        const pokemonMovesDiv = document.getElementById('pokemonMoves');
        pokemonMovesDiv.innerHTML = `
            <div class="card border-secondary mb-3" style="width: 100%;">
                <div class="card-header card-text3">
                    Pokemon Moves
                    <div class="form-inline float-right">
                        <select id="moveMethodFilter" class="form-control" onchange="filterMovesByMethod()">
                            <option value="">All</option>
                            <option value="level-up">Level Up</option>
                            <option value="machine">TM/HM Machine</option>
                            <option value="tutor">Tutor</option>
                            <option value="egg">Egg</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Level Learned</th>
                                <th>Move</th>
                                <th>Learn Method</th>
                            </tr>
                        </thead>
                        <tbody id="movesTableBody">
                            ${movesTable}
                        </tbody>
                    </table>
                </div>
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center" id="pagination">
        
                    </ul>
                </nav>
            </div>
        `;

        const imageUrl = data.sprites.front_default || defaultImageUrl;
        const capitalizedPokemonName = capitalizeFirstLetter(data.name);
        const pokemonId = data.id || "N/A";
        const baseStats = data.stats.map(stat => {
            let statAbbreviation;
            switch (stat.stat.name) {
                case 'hp':
                    statAbbreviation = 'HP';
                    break;
                case 'attack':
                    statAbbreviation = 'ATK';
                    break;
                case 'defense':
                    statAbbreviation = 'DEF';
                    break;
                case 'special-attack':
                    statAbbreviation = 'SPA';
                    break;
                case 'special-defense':
                    statAbbreviation = 'SPD';
                    break;
                case 'speed':
                    statAbbreviation = 'SPE';
                    break;
                default:
                    statAbbreviation = '';
            }

            const statValue = stat.base_stat;
            const barWidth = (statValue / 255) * 100; 

            return `
                <span class="stat-row card-text">
                    <span class="typing card-text">${statAbbreviation}:</span>${statValue}
                    <div class="stat-bar-container">
                        <div class="stat-bar mt-0 mb-0" style="width: ${barWidth}%;"></div>
                    </div>
                </span>
            `;
        }).join('');

        const abilities = data.abilities.map(ability => capitalizeFirstLetter(ability.ability.name.replace(/-/g, ' '))).join(', ') || "N/A";
        const typeColors = getTypeColors(data.types);
        const badgeSpans = typeColors.map(typeColor => {
            return `<span class="badge text-white card-text3" style="background-color: ${typeColor.color}; font-size: 0.91em;"> ${typeColor.type}</span>`;
        });

        const pokemonInfoDiv = document.getElementById('pokemonInfo');
        pokemonInfoDiv.innerHTML = `
            <div class="card border-secondary mb-3" style="width: 100%;">
                <div class="card-header"></div> 
                    <div class="card-text2 position-relative">
                        <span id="pokemonIdLabel" class="position-absolute card-text2">No.${pokemonId}</span>
                    </div>
                <img src="${imageUrl}" class="card-img-top" alt="${capitalizedPokemonName} Image">
                    <p class="card-text2 text-center">${capitalizedPokemonName}</p>
                <div class="card-body">
                    <p class="card-text"><strong class="card-text">Type:</strong> ${badgeSpans.join(' ')}</p>
                    <p class="card-text"><strong class="card-text">Abilities:</strong> ${abilities}</p>
                    <p class="card-text"><strong class="card-text">Base stats:</strong></p>${baseStats}
                </div>
            </div>
        `;

        generatePaginationButtons(totalPages);
    } catch (error) {
        console.error('Error fetching Pokemon data:', error);
    }
}

