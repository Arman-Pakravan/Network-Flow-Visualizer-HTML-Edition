
(function() {
  // DOM refs
  const fromEntry = document.getElementById('fromEntry');
  const toEntry = document.getElementById('toEntry');
  const capacityEntry = document.getElementById('capacityEntry');
  const addEdgeBtn = document.getElementById('addEdgeBtn');
  const removeSelectedBtn = document.getElementById('removeSelectedBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const edgeListEl = document.getElementById('edgeList');
  const sourceEntry = document.getElementById('sourceEntry');
  const sinkEntry = document.getElementById('sinkEntry');
  const solveBtn = document.getElementById('solveBtn');
  const resultsEl = document.getElementById('results');
  const canvas = document.getElementById('vizCanvas');
  const ctx = canvas.getContext('2d');

  // state
  let edges = [];
  let selectedIndex = -1;
  let animationCancel = false;

  // refresh edge list UI
  function refreshEdgeList() {
    edgeListEl.innerHTML = '';
    edges.forEach((e, i) => {
      const li = document.createElement('li');
      li.dataset.index = i;
      li.tabIndex = 0;
      li.textContent = `${e.from} → ${e.to} | ${e.capacity}`;
      if (i === selectedIndex) li.classList.add('selected');

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-inline';
      removeBtn.textContent = 'Remove';
      removeBtn.onclick = (ev) => {
        ev.stopPropagation();
        edges.splice(i, 1);
        if (selectedIndex === i) selectedIndex = -1;
        refreshEdgeList();
      };
      li.appendChild(removeBtn);

      li.onclick = () => {
        selectedIndex = i === selectedIndex ? -1 : i;
        refreshEdgeList();
      };

      edgeListEl.appendChild(li);
    });
  }

  function clearResultsAndCancelAnimation() {
    resultsEl.textContent = '';
    animationCancel = true;
  }

  // Add edge
  addEdgeBtn.addEventListener('click', () => {
    const u = fromEntry.value.trim();
    const v = toEntry.value.trim();
    const cap = parseFloat(capacityEntry.value);
    if (!u || !v || Number.isNaN(cap)) {
      alert('Please fill From, To and numeric Capacity.');
      return;
    }
    edges.push({ from: u, to: v, capacity: cap });
    fromEntry.value = toEntry.value = capacityEntry.value = '';
    selectedIndex = -1;
    refreshEdgeList();
    clearResultsAndCancelAnimation();
  });

  // Remove selected
  removeSelectedBtn.addEventListener('click', () => {
    if (selectedIndex < 0 || selectedIndex >= edges.length) {
      alert('No connection selected!');
      return;
    }
    edges.splice(selectedIndex, 1);
    selectedIndex = -1;
    refreshEdgeList();
    clearResultsAndCancelAnimation();
  });

  // Clear all
  clearAllBtn.addEventListener('click', () => {
    if (!confirm('Remove all connections?')) return;
    edges = [];
    selectedIndex = -1;
    refreshEdgeList();
    clearResultsAndCancelAnimation();
  });

  // Solve button
  solveBtn.addEventListener('click', async () => {
    if (edges.length === 0) {
      alert('Please add at least one edge.');
      return;
    }
    const source = sourceEntry.value.trim();
    const sink = sinkEntry.value.trim();
    if (!source || !sink) {
      alert('Please specify Start and End nodes.');
      return;
    }

    try {
      solveBtn.disabled = true;
      solveBtn.textContent = 'Solving...';
      animationCancel = true;

      const payload = {
        edges: edges.map(e => [e.from, e.to, e.capacity]),
        source,
        sink
      };

      const resp = await fetch('/solve', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (!resp.ok) {
        resultsEl.innerHTML = `<span style="color:red">${data.error || 'Unknown error'}</span>`;
        return;
      }

      // ✅ Friendly results
      let resultsHtml = `✅ Maximum flow from ${source} → ${sink}: <b>${data.max_flow}</b><br><br>`;
      if (data.paths && data.paths.length > 0) {
        resultsHtml += "<b>Flow paths:</b><ul>";
        data.paths.forEach(p => {
          resultsHtml += `<li>${p.path.join(" → ")} : <b>${p.flow}</b> units</li>`;
        });
        resultsHtml += "</ul>";
      }
      resultsEl.innerHTML = resultsHtml;

      // Draw and animate paths
      drawBaseGraph(data);
      animationCancel = false;
      await animatePathsSequentially(data);
    } catch (err) {
      console.error(err);
      resultsEl.innerHTML = `<span style="color:red">Error: ${err.message}</span>`;
    } finally {
      solveBtn.disabled = false;
      solveBtn.textContent = '🚀 Solve & Visualize Flow';
    }
  });

  // Draw base graph (light gray edges + nodes)
  function drawBaseGraph(data) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const positions = data.positions || {};
    const nodes = data.nodes || [];
    const coords = Object.values(positions);
    let minX=0, maxX=1, minY=0, maxY=1;
    if (coords.length) {
      minX = Math.min(...coords.map(c => c[0])); maxX = Math.max(...coords.map(c => c[0]));
      minY = Math.min(...coords.map(c => c[1])); maxY = Math.max(...coords.map(c => c[1]));
    }
    const pad = 80;
    const w = canvas.width - pad*2;
    const h = canvas.height - pad*2;

    const posPx = {};
    nodes.forEach(n => {
      const p = positions[n] || [Math.random(), Math.random()];
      const nx = (p[0] - minX) / (maxX - minX || 1);
      const ny = (p[1] - minY) / (maxY - minY || 1);
      posPx[n] = { x: pad + nx * w, y: pad + ny * h };
    });

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ddd';
    (data.edges || []).forEach(e => {
      const [u,v] = e;
      const p1 = posPx[u], p2 = posPx[v];
      if (!p1 || !p2) return;
      drawArrow(p1.x, p1.y, p2.x, p2.y, '#ddd', 2);
    });

    nodes.forEach(n => {
      const p = posPx[n];
      drawNode(p.x, p.y, n, n === sourceEntry.value.trim() ? '#b3e6ff' : '#dff4ff');
    });

    canvas._posPx = posPx;
  }

  function drawNode(x, y, label, fill='#dff4ff') {
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, 2*Math.PI);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = '#4442';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#003366';
    ctx.font = '14px Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
  }

  function drawArrow(x1, y1, x2, y2, color='#333', width=3) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const dx = x2 - x1, dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    const headlen = 12;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI/6), y2 - headlen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI/6), y2 - headlen * Math.sin(angle + Math.PI/6));
    ctx.closePath();
    ctx.fill();
  }

  async function animatePathsSequentially(data) {
    const posPx = canvas._posPx || {};
    if (!data.paths) return;

    for (let i = 0; i < data.paths.length; i++) {
      if (animationCancel) return;
      const { path, flow } = data.paths[i];

      drawBaseGraph(data);

      for (let j = 0; j < path.length - 1; j++) {
        const u = path[j], v = path[j+1];
        const p1 = posPx[u], p2 = posPx[v];
        if (!p1 || !p2) continue;

        drawArrow(p1.x, p1.y, p2.x, p2.y, '#1e5adf', 6);

        ctx.fillStyle = '#003366';
        ctx.font = '13px Segoe UI, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${flow} units`, (p1.x + p2.x)/2, (p1.y + p2.y)/2 - 10);
      }

      await sleep(1200);
    }
  }

  function sleep(ms){ return new Promise(res => setTimeout(res, ms)); }

  refreshEdgeList();

  edgeListEl.addEventListener('keydown', (ev) => {
    if (ev.key === 'Delete' || ev.key === 'Backspace') {
      if (selectedIndex >= 0) {
        edges.splice(selectedIndex, 1);
        selectedIndex = -1;
        refreshEdgeList();
      }
    }
  });

})();
