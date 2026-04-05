let allSenders = [];
let currentPage = 1;
const pageSize = 50;
let timeChartIn = null;
let senderChartIn = null;

// The Reliable Poll: Fetching from the VITE './data/' root
async function smartSync() {
  const statusEl = document.getElementById('progressStatus');
  const resultsView = document.getElementById('resultsView');
  const configCard = document.getElementById('configCard');
  const loader = document.getElementById('loader');

  try {
    const response = await fetch('./data/analytics.json?v=' + Date.now());
    if (!response.ok) throw new Error("Processing...");
    
    const data = await response.json();
    allSenders = data.senders;
    
    renderDayOneSummary(data);
    renderDayOneCharts(data);
    renderDayOneTable();
    
    loader.classList.add('hidden');
    configCard.classList.add('hidden');
    resultsView.classList.remove('hidden');
  } catch (err) {
    statusEl.innerText = "🔍 Engine: Forensics in progress... (Retrying)";
    setTimeout(smartSync, 3000);
  }
}

function renderDayOneSummary(data) {
  document.getElementById('scanSummary').innerHTML = `
    <div class="stat-item">
      <span class="stat-value">${data.total_emails.toLocaleString()}</span>
      <span class="stat-label">Total Emails</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${data.total_senders.toLocaleString()}</span>
      <span class="stat-label">Unique Senders</span>
    </div>
  `;
}

function renderDayOneCharts(data) {
  const timeCtx = document.getElementById('timeChart').getContext('2d');
  const sizeCtx = document.getElementById('sizeChart').getContext('2d');

  if (timeChartIn) timeChartIn.destroy();
  if (senderChartIn) senderChartIn.destroy();

  const top10 = data.senders.slice(0, 10);

  senderChartIn = new Chart(sizeCtx, {
    type: 'bar',
    data: {
      labels: top10.map(s => s.address.split('@')[0]),
      datasets: [{
        label: 'Volume',
        data: top10.map(s => s.count),
        backgroundColor: '#00ccff',
        borderRadius: 4
      }]
    },
    options: { indexAxis: 'y' }
  });

  timeChartIn = new Chart(timeCtx, {
    type: 'bar',
    data: {
      labels: data.years,
      datasets: [{
        label: 'History',
        data: data.counts,
        backgroundColor: '#00ffaa',
        borderRadius: 4
      }]
    }
  });
}

function renderDayOneTable() {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageData = allSenders.slice(start, end);
  const totalPages = Math.ceil(allSenders.length / pageSize);

  const senderList = document.getElementById('senderList');
  senderList.innerHTML = pageData.map(s => `
    <div class="sender-row">
      <div class="sender-addr">${s.address}</div>
      <div class="sender-count">${s.count} emails</div>
      <div class="sender-size">${s.size_mb} MB</div>
      <div class="sender-badge">${s.percentage.toFixed(1)}%</div>
    </div>
  `).join('');

  document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('prevBtn').disabled = currentPage === 1;
  document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

// THE STABLE BRIDGE: RESTORED PICKER EVENT LISTENERS
document.getElementById('pickBtn').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('mbox-pick'));
});

window.addEventListener('mbox-selected', (e) => {
    document.getElementById('mboxPath').value = e.detail.path;
    document.getElementById('selectionStatus').classList.remove('hidden');
    document.getElementById('runBtn').classList.remove('hidden');
    document.getElementById('pickBtn').innerText = "Change Selection";
});

document.getElementById('runBtn').addEventListener('click', () => {
    const path = document.getElementById('mboxPath').value;
    document.getElementById('loader').classList.remove('hidden');
    window.dispatchEvent(new CustomEvent('mbox-run', { detail: { path } }));
    smartSync(); // Start the Stable Poll Logic
});

// UI Pager
document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderDayOneTable();
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  const totalPages = Math.ceil(allSenders.length / pageSize);
  if (currentPage < totalPages) {
    currentPage++;
    renderDayOneTable();
  }
});

// Tab Switcher
document.querySelectorAll('.minimal-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.minimal-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
  });
});
