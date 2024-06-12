let apiData = null;

let megyeID = "00";
let partID = 0;

function getAPIData() {
    fetch("src/json/data.json")
    .then(res => res.json())
    .then(data => {
        apiData = data;
        processData(megyeID, partID, apiData);
        localStorage.setItem("apiData", JSON.stringify(apiData))
    })
}

getAPIData();


function processData(megyeID, partID, apiData) {
    clearResultTable();
    let dictItemsTEMP = {};
    let dictTelepulesek = {};

    if (megyeID == "00") {
        for (const megyeID in apiData.data) {
            for (const telepID in apiData.data[megyeID]) {
                if (partID == 0) {
                    dictItemsTEMP[`${megyeID}.${telepID}`] = 0;
                } else {
                    dictItemsTEMP[`${megyeID}.${telepID}`] = apiData.data[megyeID][telepID][partID - 1].szavazatok;
                }
                dictTelepulesek[`${megyeID}.${telepID}`] = apiData.magyarazatok.megyek[megyeID].telepulesek[telepID].nev;
            }
        }        
    } else {
        if (megyeID.length == 1) { megyeID = `0${megyeID}` }

        for (const key in apiData.data[megyeID]) {
            if (partID == 0) {
                dictItemsTEMP[`${megyeID}.${key}`] = 0;
            } else {
                dictItemsTEMP[`${megyeID}.${key}`] = apiData.data[megyeID][key][partID - 1].szavazatok;
            }
            dictTelepulesek[`${megyeID}.${key}`] = apiData.magyarazatok.megyek[megyeID].telepulesek[key].nev;
        }
    }

    let dictItems = {};
    if (partID == 0) {
        const sortedKeys = Object.keys(dictItemsTEMP).sort((a, b) => {
            const nameA = dictTelepulesek[a].toUpperCase();
            const nameB = dictTelepulesek[b].toUpperCase();
            return nameA.localeCompare(nameB);
        });

        sortedKeys.forEach(key => {
            dictItems[key] = dictItemsTEMP[key];
        });
    } else {
        dictItems = Object.fromEntries(
            Object.entries(dictItemsTEMP).sort(([, a], [, b]) => b - a)
        );
    }

    generateHeader(apiData);

    const tableBody = document.querySelector('#result tbody');
    
    if (megyeID == "00") {
        for (const [key, value] of Object.entries(dictItems)) {
            let megyeid = key.split(".")[0];
            let telepid = key.split(".")[1];
            let row = document.createElement('tr');
            
            const cellKey = document.createElement('th');
            cellKey.innerHTML = apiData.magyarazatok.megyek[megyeid].telepulesek[telepid].nev;
            row.appendChild(cellKey);
    
            const maxValue = getMaxValue(apiData.data[megyeid][telepid]);
            
            apiData.data[megyeid][telepid].forEach(element => {
                const cellValue = document.createElement('td');
                if (element.szavazatokSzazalek == maxValue) { cellValue.classList.add("highest") }
                cellValue.innerHTML = element.szavazatokSzazalekStr + "<br>" + element.szavazatok;
                row.appendChild(cellValue);
            });
    
            tableBody.appendChild(row);
        }
    } else {
        for (const [key, value] of Object.entries(dictItems)) {
            let megyeid = key.split(".")[0];
            let telepid = key.split(".")[1];
            let row = document.createElement('tr');
            
            const cellKey = document.createElement('th');
            cellKey.innerHTML = apiData.magyarazatok.megyek[megyeid].telepulesek[telepid].nev;
            row.appendChild(cellKey);
    
            const maxValue = getMaxValue(apiData.data[megyeid][telepid]);
            
            apiData.data[megyeid][telepid].forEach(element => {
                const cellValue = document.createElement('td');
                if (element.szavazatokSzazalek == maxValue) { cellValue.classList.add("highest") }
                cellValue.innerHTML = element.szavazatokSzazalekStr + "<br>" + element.szavazatok;
                row.appendChild(cellValue);
            });
    
            tableBody.appendChild(row);
        }
    }
}

function clearResultTable() {
    document.getElementById("result").innerHTML = 
    `
        <table id="result">
                <thead></thead>
                <tbody></tbody>
        </table>
    `;
}


// function generateSelect(apiData) {
//     let select = document.getElementById("megyeList");
//     let telepulesek = {};

//     for (const megyeID in apiData.magyarazatok.megyek) {
//         telepulesek[apiData.magyarazatok.megyek[megyeID].nev] = megyeID;
//     }

//     telepulesek.forEach(element => {
//         select.innerHTML += `<option value=${megyeID}>${element}</option>`;
//     });
// }

function generateHeader(apiData) {
    let row = document.createElement('tr');
    let ceil = document.createElement('th');
    ceil.innerHTML = "VÁROS";
    ceil.id = "sort0";
    ceil.addEventListener("click", partSortMonitor)
    row.appendChild(ceil);

    for (const key in apiData.magyarazatok.partok) {
        ceil = document.createElement('th');
        ceil.innerHTML = apiData.magyarazatok.partok[key];
        ceil.id = `sort${key}`;
        ceil.addEventListener("click", partSortMonitor)
        row.appendChild(ceil);
    }

    document.querySelector('#result thead').appendChild(row);
}

function getMaxValue(data) {
    let maxValue = -Infinity;

    for (let i = 0; i < data.length; i++) {
        if (data[i].szavazatokSzazalek > maxValue) {
            maxValue = data[i].szavazatokSzazalek;
        }
    }

    return maxValue;
}



function megyeListMonitor() {
    megyeID = document.getElementById("megyeList").value;
    document.getElementById("displayed").innerHTML = document.getElementById("megyeList").options[document.getElementById("megyeList").selectedIndex].text;
    clearResultTable();
    processData(megyeID, partID, JSON.parse(localStorage.getItem("apiData")))
}

function partSortMonitor(event) {
    partID = event.target.id.split("sort")[1];
    clearResultTable();
    processData(megyeID, partID, JSON.parse(localStorage.getItem("apiData")))
}