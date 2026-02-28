// Map initialization
const map = L.map('uba-map', {
    zoomControl: false
}).setView([-21.1215, -42.9427], 14);

L.control.zoom({ position: 'bottomright' }).addTo(map);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

let currentMarkers = [];

// Helper functions for markers
function getStatusClass(status) {
    if (status === 'total') return 'status-total';
    if (status === 'parcial') return 'status-parcial';
    if (status === 'bridge') return 'status-bridge';
    if (status === 'doacao') return 'status-doacao';
    if (status === 'need_help') return 'status-need-help';
    return '';
}

function getStatusText(status) {
    if (status === 'total') return 'Interdição Total';
    if (status === 'parcial') return 'Interdição Parcial';
    if (status === 'bridge') return 'Ponte/Risco';
    if (status === 'doacao') return 'Ponto de Doação';
    if (status === 'need_help') return 'Famílias com Necessidade';
    return 'Alerta';
}

function createCustomIcon(status, isOfficial, authorRole) {
    const statusClass = getStatusClass(status);
    const isAuthority = (authorRole === 'admin' || authorRole === 'big_boss');

    // Authorities get a crown, community unverified get an asterisk, donation points get clover
    let overlay = '';
    if (status === 'doacao') {
        overlay = '<span style="font-size:16px; line-height:0; display:block; transform:translateY(1px);">🍀</span>';
    } else if (status === 'need_help') {
        overlay = '<span style="font-size:16px; line-height:0; display:block; transform:translateY(1px);">🆘</span>';
    } else if (isAuthority || isOfficial) {
        overlay = '<span style="color:#fbbf24; font-size:16px; font-weight:bold; line-height:0; display:block; transform:translateY(6px); text-shadow: 0 0 2px black;">👑</span>';
    } else {
        overlay = '<span style="color:#ffffff; font-size:24px; font-weight:bold; line-height:0; display:block; transform:translateY(6px);">*</span>';
    }

    // Give authoritative pins a golden border
    const borderStyle = isAuthority ? 'border: 2px solid #fbbf24; box-shadow: 0 0 8px #fbbf24;' : '';

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="marker-pin ${statusClass}" style="${borderStyle}">${overlay}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
}

// Global user state
let currentUser = null;

// Initialization
async function initApp() {
    console.log("[DEBUG] initApp started");
    await checkAuth();
    console.log("[DEBUG] checkAuth finished");
    await loadMapData();
    console.log("[DEBUG] loadMapData finished");
    setupFormEvents();
    console.log("[DEBUG] setupFormEvents finished");
}

async function checkAuth() {
    try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const data = await res.json();
            currentUser = data.user;
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('user-info-section').style.display = 'block';
            document.getElementById('forms-container').style.display = 'block';

            // Format name with Role
            let displayRole = currentUser.role === 'big_boss' ? 'Big-Boss' : (currentUser.role === 'admin' ? 'Admin' : 'Morador');
            document.getElementById('user-name').textContent = `${currentUser.name} (${displayRole})`;

            if (currentUser.photoUrl) {
                document.getElementById('user-avatar').src = currentUser.photoUrl;
            }

            if (currentUser.role === 'admin' || currentUser.role === 'big_boss') {
                document.getElementById('admin-panel').style.display = 'block';
            }
            if (currentUser.role === 'big_boss') {
                const bbs = document.getElementById('big-boss-only-section');
                if (bbs) bbs.style.display = 'block';
            }
        } else {
            // User is not logged in (e.g., 401). Do NOT parse JSON. Display auth UI.
            currentUser = null;
            document.getElementById('auth-section').style.display = 'block';
            document.getElementById('user-info-section').style.display = 'none';
            document.getElementById('forms-container').style.display = 'none';
        }
    } catch (e) {
        // Network error (e.g., server offline). Do NOT crash the app.
        console.warn("Auth check network error:", e);
        currentUser = null;
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('user-info-section').style.display = 'none';
        document.getElementById('forms-container').style.display = 'none';
    }
}

async function loadMapData() {
    // Clear old markers
    currentMarkers.forEach(m => map.removeLayer(m));
    currentMarkers = [];

    try {
        const response = await fetch('/api/map-data');
        const data = await response.json();

        data.forEach(item => {
            const isItemOfficial = item.isOfficial === 1;
            const isAuthority = (item.authorRole === 'admin' || item.authorRole === 'big_boss');

            const icon = createCustomIcon(item.status, isItemOfficial, item.authorRole);
            const marker = L.marker([item.lat, item.lng], { icon: icon });

            // If it's from an Admin/Big-Boss, it gets a golden seal and NO flag button
            const titleModifier = (isAuthority || isItemOfficial) ? ' <span title="Fonte Oficial" style="color:#fbbf24; font-size:1.2rem;">👑</span>' : ' <span style="color:red; font-size:1.2rem;">*</span>';
            const officialBadge = (isAuthority || isItemOfficial)
                ? '<div class="popup-source" style="color:#fbbf24; border: 1px solid #fbbf24; padding:2px 5px; border-radius:4px; display:inline-block; margin-bottom:5px;">👑 Alerta Governamental Oficial</div>'
                : '<div class="popup-source" style="color:var(--danger)">Aviso Comunitário Não Verificado</div>';

            let flagButtonHtml = '';
            if (!isAuthority && !isItemOfficial && currentUser) {
                flagButtonHtml = `<button onclick="flagReport(${item.reportId})" class="btn-flag" style="margin-top:10px; background:var(--danger); color:white; border:none; padding:5px; border-radius:4px; cursor:pointer; width:100%; font-size:0.75rem;">Denunciar Falso Alarme</button>`;
            }

            let deleteButtonHtml = '';
            if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'big_boss')) {
                deleteButtonHtml = `<button onclick="deleteReport(${item.reportId})" class="btn-delete" style="margin-top:5px; background:#ef4444; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer; width:100%; font-size:0.75rem;">Deletar Alerta (Moderação)</button>`;
            }

            const authorLabel = item.source ? `${item.source} (${item.authorRole ? item.authorRole.toUpperCase() : 'MORADOR'})` : 'Comunidade';

            const popupContent = `
                <div class="custom-popup">
                    <h3>${item.title}${titleModifier}</h3>
                    <div class="popup-status">
                         <span class="legend-color ${getStatusClass(item.status)}"></span>
                         ${getStatusText(item.status)}
                    </div>
                    <p class="popup-desc">${item.description || 'Nenhum detalhe adicional informado.'}</p>
                    ${officialBadge}
                    <div class="popup-source">Por: ${authorLabel}</div>
                    ${flagButtonHtml}
                    ${deleteButtonHtml}
                </div>
            `;

            marker.bindPopup(popupContent);
            marker.addTo(map);
            currentMarkers.push(marker);
        });

        const now = new Date();
        document.getElementById('last-updated').innerText = now.toLocaleString('pt-BR');
    } catch (error) {
        console.error('Error fetching interdictions data:', error);
    }
}

// Report Fake News function exposed globally for the popup onclick
window.flagReport = async function (reportId) {
    if (!confirm("Tem certeza que deseja denunciar este alerta como falso? Ele será removido após 10 denúncias confirmadas.")) return;

    try {
        const res = await fetch(`/api/reports/${reportId}/flag`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            alert('Denúncia recebida com sucesso. Obrigado por ajudar!');
            loadMapData(); // Refresh
        } else {
            alert(data.error || 'Erro ao denunciar.');
        }
    } catch (e) {
        alert('Erro ao processar.');
    }
}

// Admin function to permanently delete a report from the map
window.deleteReport = async function (reportId) {
    if (!confirm("Tem certeza absoluta que deseja EXCLUIR este alerta do mapa?")) return;

    try {
        const res = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            alert('Alerta deletado com sucesso pelo Administrador.');
            loadMapData(); // Refresh map without reloading page
        } else {
            alert(data.error || 'Erro ao deletar alerta.');
        }
    } catch (e) {
        alert('Erro ao processar a exclusão.');
    }
}

let isSelectionMode = false;
let streetGeoLayer = null;
let tempMarkers = [];

async function prepareStreetSelection(id) {
    // Clear previous
    if (streetGeoLayer) map.removeLayer(streetGeoLayer);
    tempMarkers.forEach(m => map.removeLayer(m));
    tempMarkers = [];
    isSelectionMode = true;

    document.getElementById('marker-instruction').style.display = 'block';
    document.getElementById('selected-points-list').innerHTML = '';

    try {
        const res = await fetch(`/api/streets/${id}/geometry`);
        const data = await res.json();

        if (data.success && data.geojson) {
            streetGeoLayer = L.geoJSON(data.geojson, {
                style: { color: '#3b82f6', weight: 8, opacity: 0.7 }
            }).addTo(map);
            map.fitBounds(streetGeoLayer.getBounds(), { padding: [50, 50] });
        } else if (data.center) {
            map.setView([data.center.lat, data.center.lng], 16);
            alert("Aviso: Formato exato da rua não listado no OpenStreetMap. Porém, você pode clicar pelo mapa na região aproximada para injetar o marcador.");
        }
    } catch (e) { console.error(e); }
}

// Map clicking logic for dynamic insertions
map.on('click', function (e) {
    if (!isSelectionMode) return;
    if (tempMarkers.length >= 3) {
        alert("O limite de 3 pontos para esta marcação já foi atingido.");
        return;
    }

    // Add temporary visual marker
    const marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    tempMarkers.push(marker);

    // Update visual list
    const ul = document.getElementById('selected-points-list');
    const li = document.createElement('li');
    li.style.marginBottom = "4px";
    li.textContent = `📍 Alvo ${tempMarkers.length}: Lat ${e.latlng.lat.toFixed(4)}, Lng ${e.latlng.lng.toFixed(4)}`;
    ul.appendChild(li);

    // Ask for additional points
    if (tempMarkers.length < 3) {
        setTimeout(() => {
            const wantsMore = confirm("Ponto Inserido! Você deseja marcar mais um ponto problemático nesta mesma rua?");
            if (wantsMore) {
                // Let them keep clicking
            }
        }, 100);
    }
});

function setupFormEvents() {
    console.log("[DEBUG] setupFormEvents execution started");
    const searchInput = document.getElementById('street-search');
    console.log("[DEBUG] searchInput element:", !!searchInput);
    const dropdown = document.getElementById('street-dropdown');
    const hiddenId = document.getElementById('selected-street-id');
    const form = document.getElementById('street-report-form');

    // Admin Forms
    const addStreetForm = document.getElementById('add-street-form');
    const deleteStreetForm = document.getElementById('delete-street-form');
    const addAdminForm = document.getElementById('add-admin-form');

    if (addAdminForm) {
        addAdminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('new-admin-email').value;
            if (!confirm(`Tornar ${email} um Administrador Oficial do mapa?`)) return;

            try {
                const res = await fetch('/api/admins', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const result = await res.json();
                if (result.success) {
                    alert(result.message);
                    addAdminForm.reset();
                } else {
                    alert(result.error || "Erro ao promover usuário.");
                }
            } catch (e) { alert("Erro de conexão ao promover usuário."); }
        });
    }

    if (addStreetForm) {
        addStreetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('new-street-name').value;

            try {
                // To keep it simple for the admin, we ask backend to find coords via Nominatim and save
                const res = await fetch('/api/streets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                });
                const result = await res.json();
                if (result.success) {
                    alert(`Rua "${name}" inserida com sucesso! O ID dela é: ${result.streetId} (Lat: ${result.lat}, Lng: ${result.lng})`);
                    addStreetForm.reset();
                    loadMapData(); // Refresh map/search
                } else {
                    alert(result.error || "Erro ao inserir rua.");
                }
            } catch (e) { alert("Erro de conexão."); }
        });
    }

    if (deleteStreetForm) {
        deleteStreetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('delete-street-id').value;
            if (!confirm(`Tem certeza que deseja EXCLUIR a rua ID ${id}? Todos os relatos dela sumirão.`)) return;

            try {
                const res = await fetch(`/api/streets/${id}`, { method: 'DELETE' });
                const result = await res.json();
                if (result.success) {
                    alert("Rua e seus alertas excluídos permanentemente.");
                    deleteStreetForm.reset();
                    loadMapData();
                } else {
                    alert(result.error || "Erro ao excluir rua.");
                }
            } catch (e) { alert("Erro de conexão."); }
        });
    }

    // Helper to attach autocomplete logic to any inputs
    function attachAutocomplete(inputId, dropdownId, hiddenValId) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        const hiddenId = document.getElementById(hiddenValId);

        if (!input || !dropdown || !hiddenId) return;

        input.addEventListener('input', async (e) => {
            const rawQ = e.target.value;
            const q = rawQ.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (q.length < 2) {
                dropdown.style.display = 'none';
                return;
            }
            try {
                const res = await fetch(`/api/streets/search?q=${encodeURIComponent(q)}&raw=${encodeURIComponent(rawQ)}`);
                const streets = await res.json();
                dropdown.innerHTML = '';
                if (streets.length > 0) {
                    dropdown.style.display = 'block';
                    streets.forEach(s => {
                        const div = document.createElement('div');
                        div.className = 'dropdown-item';
                        div.textContent = s.name;
                        div.onclick = async () => {
                            input.value = s.name;
                            hiddenId.value = s.id;
                            dropdown.style.display = 'none';
                            await prepareStreetSelection(s.id);
                        };
                        dropdown.appendChild(div);
                    });
                } else {
                    dropdown.style.display = 'none';
                }
            } catch (e) { console.error(e); }
        });

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) dropdown.style.display = 'none';
        });
    }

    attachAutocomplete('street-search-danger', 'street-dropdown-danger', 'selected-street-id-danger');
    attachAutocomplete('street-search-help', 'street-dropdown-help', 'selected-street-id-help');

    // Generic Submit Handler
    async function handleReportSubmit(e, formId, hiddenId, statusSelectId, extractDescCb) {
        e.preventDefault();
        const hiddenElem = document.getElementById(hiddenId);

        if (!hiddenElem.value) {
            alert("Por favor, selecione uma rua da lista.");
            return;
        }

        if (!isSelectionMode || tempMarkers.length === 0) {
            alert("Você precisa clicar no mapa para inserir pelo menos 1 ponto exato (máx 3) antes de enviar.");
            return;
        }

        const isGoodFaith = confirm("⚠️ ATENÇÃO ⚠️\n\nA prestação de informações FALSAS em situações de CALAMIDADE PÚBLICA atrapalha resgates e logística!\nVocê atesta sob responsabilidade da sua conta Google que essa informação é verdadeira?");
        if (!isGoodFaith) return;

        let desc = null;
        if (extractDescCb) {
            desc = extractDescCb();
        }

        const data = {
            streetId: hiddenElem.value,
            status: document.getElementById(statusSelectId).value,
            description: desc,
            markers: tempMarkers.map(m => m.getLatLng())
        };

        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (result.success) {
                alert("Ponto registrado com sucesso! O mapa foi atualizado.");
                document.getElementById(formId).reset();
                hiddenElem.value = '';
                document.getElementById('family-fields') && (document.getElementById('family-fields').style.display = 'none');

                // Cleanup
                if (streetGeoLayer) map.removeLayer(streetGeoLayer);
                tempMarkers.forEach(m => map.removeLayer(m));
                tempMarkers = [];
                isSelectionMode = false;
                document.getElementById('marker-instruction').style.display = 'none';
                document.getElementById('selected-points-list').innerHTML = '';

                loadMapData();
            } else {
                alert(result.error || "Erro ao registrar ponto.");
            }
        } catch (error) {
            alert("Erro de conexão com o servidor.");
        }
    }

    // Attach to Form Danger
    const formDanger = document.getElementById('street-report-form-danger');
    if (formDanger) {
        formDanger.addEventListener('submit', (e) => {
            handleReportSubmit(e, 'street-report-form-danger', 'selected-street-id-danger', 'status-select-danger', null);
        });
    }

    // Attach to Form Help
    const formHelp = document.getElementById('street-report-form-help');
    if (formHelp) {
        formHelp.addEventListener('submit', (e) => {
            handleReportSubmit(e, 'street-report-form-help', 'selected-street-id-help', 'status-select-help', () => {
                const status = document.getElementById('status-select-help').value;
                if (status === 'need_help') {
                    const fname = document.getElementById('family-name').value.trim();
                    const fphone = document.getElementById('family-phone').value.trim();
                    if (fname || fphone) {
                        let msg = [];
                        if (fname) msg.push(`Contato: ${fname}`);
                        if (fphone) msg.push(`Tel/Pix: ${fphone}`);
                        return msg.join(' | ');
                    }
                }
                return null;
            });
        });
    }
}

// Start
initApp();
