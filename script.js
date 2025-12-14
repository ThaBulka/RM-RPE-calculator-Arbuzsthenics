document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('rm-form');
    const resultsDiv = document.getElementById('results');
    const weightInput = document.getElementById('weight');
    const repsInput = document.getElementById('reps');
    const rirInput = document.getElementById('rir');
    const unitSelect = document.getElementById('unit');
    const bodyweightInput = document.getElementById('bodyweight');
    const bodyweightGroup = document.getElementById('bodyweight-group');
    const bodyweightUnitDisplay = document.getElementById('bodyweight-unit');
    const bodyweightNote = document.getElementById('bodyweight-note');
    const movementTypeRadios = document.querySelectorAll('input[name="movement-type"]');
    const resultCards = document.querySelectorAll('.result-card.clickable');
    const weightLabel = document.getElementById('weight-label');
    const weightDescription = document.getElementById('weight-description');

    let currentResults = {
        epley: 0,
        brzycki: 0,
        lander: 0,
        average: 0,
        unit: 'kg'
    };

    let openTables = new Set();

    movementTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'bodyweight') {
                bodyweightGroup.style.display = 'block';
                bodyweightInput.required = true;
                weightLabel.textContent = 'Added Weight';
                weightDescription.textContent = 'Weight added to bodyweight (use 0 for bodyweight only)';
            } else {
                bodyweightGroup.style.display = 'none';
                bodyweightInput.required = false;
                weightLabel.textContent = 'Weight Lifted';
                weightDescription.textContent = 'Total weight lifted';
            }
        });
    });

    unitSelect.addEventListener('change', (e) => {
        bodyweightUnitDisplay.textContent = e.target.value;
    });

    resultCards.forEach(card => {
        card.addEventListener('click', () => {
            const formula = card.dataset.formula;
            toggleRPETable(formula);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateOneRepMax();
    });

    function calculateOneRepMax() {
        const addedWeight = parseFloat(weightInput.value) || 0;
        const repsPerformed = parseInt(repsInput.value);
        const rir = parseInt(rirInput.value);
        const unit = unitSelect.value;
        const isBodyweight = document.querySelector('input[name="movement-type"]:checked').value === 'bodyweight';
        const bodyweight = isBodyweight ? parseFloat(bodyweightInput.value) : 0;

        if (!repsPerformed || repsPerformed < 1) {
            alert('Please enter valid reps value.');
            return;
        }

        if (isBodyweight && (!bodyweight || bodyweight <= 0)) {
            alert('Please enter your bodyweight for bodyweight movements.');
            return;
        }

        const totalReps = repsPerformed + rir;
        const totalWeight = addedWeight + bodyweight;

        const epley = calculateEpley(totalWeight, totalReps);
        const brzycki = calculateBrzycki(totalWeight, totalReps);
        const lander = calculateLander(totalWeight, totalReps);
        const average = (epley + brzycki + lander) / 3;

        if (isBodyweight) {
            const epleyCorrected = epley - bodyweight;
            const brzyckiCorrected = brzycki - bodyweight;
            const landerCorrected = lander - bodyweight;
            const averageCorrected = average - bodyweight;
            currentResults = {
                epley: epleyCorrected,
                brzycki: brzyckiCorrected,
                lander: landerCorrected,
                average: averageCorrected,
                unit: unit
            };
            displayResults(epleyCorrected, brzyckiCorrected, landerCorrected, averageCorrected, unit);
            bodyweightNote.classList.remove('hidden');
        } else {
            currentResults = {
                epley: epley,
                brzycki: brzycki,
                lander: lander,
                average: average,
                unit: unit
            };
            displayResults(epley, brzycki, lander, average, unit);
            bodyweightNote.classList.add('hidden');
        }
    }

    function calculateEpley(weight, reps) {
        if (reps === 1) return weight;
        return weight * (1 + reps / 30);
    }

    function calculateBrzycki(weight, reps) {
        if (reps === 1) return weight;
        return weight * (36 / (37 - reps));
    }

    function calculateLander(weight, reps) {
        if (reps === 1) return weight;
        return (100 * weight) / (101.3 - 2.67123 * reps);
    }

    function displayResults(epley, brzycki, lander, average, unit) {
        document.getElementById('epley-result').textContent = `${epley.toFixed(1)} ${unit}`;
        document.getElementById('brzycki-result').textContent = `${brzycki.toFixed(1)} ${unit}`;
        document.getElementById('lander-result').textContent = `${lander.toFixed(1)} ${unit}`;
        document.getElementById('average-result').textContent = `${average.toFixed(1)} ${unit}`;

        resultsDiv.classList.remove('hidden');
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function toggleRPETable(formula) {
        const tableId = `rpe-table-${formula}`;
        const resultCard = document.querySelector(`[data-formula="${formula}"]`);

        if (openTables.has(formula)) {
            const existingTable = document.getElementById(tableId);
            if (existingTable) {
                existingTable.remove();
                openTables.delete(formula);
                resultCard.style.display = 'block';
            }
        } else {
            openTables.add(formula);
            resultCard.style.display = 'none';
            createRPETable(formula);
        }
    }

    function createRPETable(formula) {
        const oneRM = currentResults[formula];
        const unit = currentResults.unit;

        const formulaNames = {
            epley: 'Epley',
            brzycki: 'Brzycki',
            lander: 'Lander',
            average: 'Average'
        };

        const container = document.createElement('div');
        container.id = `rpe-table-${formula}`;
        container.className = 'rpe-table-container';

        const header = document.createElement('div');
        header.className = 'rpe-table-header';
        header.innerHTML = `
            <h2>RPE-Based Training Table</h2>
            <p class="rpe-subtitle">Based on <span class="formula-name">${formulaNames[formula]}</span> 1RM: <span class="formula-1rm">${oneRM.toFixed(1)} ${unit}</span></p>
            <button class="close-btn" data-formula="${formula}">&times;</button>
        `;

        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'table-wrapper';

        const table = document.createElement('table');
        table.className = 'rpe-table';

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>RPE</th>
                <th>RIR</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
                <th>5</th>
                <th>6</th>
                <th>7</th>
                <th>8</th>
                <th>9</th>
                <th>10</th>
                <th>11</th>
                <th>12</th>
            </tr>
        `;

        const tbody = document.createElement('tbody');

        const rpeValues = [
            { rpe: 10, rir: 0 },
            { rpe: 9.5, rir: 0.5 },
            { rpe: 9, rir: 1 },
            { rpe: 8.5, rir: 1.5 },
            { rpe: 8, rir: 2 },
            { rpe: 7.5, rir: 2.5 },
            { rpe: 7, rir: 3 },
            { rpe: 6.5, rir: 3.5 },
            { rpe: 6, rir: 4 },
            { rpe: 5.5, rir: 4.5 },
            { rpe: 5, rir: 5 }
        ];

        rpeValues.forEach(({ rpe, rir }) => {
            const row = document.createElement('tr');

            const rpeCell = document.createElement('td');
            rpeCell.textContent = rpe;
            rpeCell.className = 'rpe-col';
            row.appendChild(rpeCell);

            const rirCell = document.createElement('td');
            rirCell.textContent = rir;
            rirCell.className = 'rir-col';
            row.appendChild(rirCell);

            for (let reps = 1; reps <= 12; reps++) {
                const totalReps = reps + rir;
                const weight = calculateWeightForReps(oneRM, totalReps);

                const cell = document.createElement('td');
                cell.textContent = `${weight.toFixed(1)}`;
                cell.className = 'weight-cell';
                row.appendChild(cell);
            }

            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        tableWrapper.appendChild(table);

        container.appendChild(header);
        container.appendChild(tableWrapper);

        const targetContainer = document.getElementById(`rpe-table-${formula}-container`);
        targetContainer.appendChild(container);

        const closeBtn = container.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            toggleRPETable(formula);
        });

        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function calculateWeightForReps(oneRM, reps) {
        if (reps === 1) return oneRM;
        return oneRM / (1 + reps / 30);
    }
});
