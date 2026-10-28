(() => {
  const filter = document.getElementById("filter");
  const table = document.querySelector("table.data");

  function initTable() {
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    const headers = Array.from(table.tHead.rows[0].cells);
    const hexBox = document.getElementById("hex");
    const count = document.getElementById("count");
    let globalHex = false;

    // Remember the decimal text so the hex view can be toggled back.
    for (const td of tbody.querySelectorAll("td[data-hex]")) {
      const target = td.querySelector(".v") || td;
      td.dataset.dec = target.textContent;
    }

    function applyHex() {
      for (const td of tbody.querySelectorAll("td[data-hex]")) {
        const th = headers[td.cellIndex];
        const hex = globalHex || th.classList.contains("hexcol");
        (td.querySelector(".v") || td).textContent = hex ? td.dataset.hex : td.dataset.dec;
      }
    }
    applyHex();
    if (hexBox) hexBox.addEventListener("change", () => { globalHex = hexBox.checked; applyHex(); });

    function compare(a, b, col) {
      const ca = a.cells[col], cb = b.cells[col];
      const va = ca.dataset.v, vb = cb.dataset.v;
      if (va !== undefined && vb !== undefined) return parseFloat(va) - parseFloat(vb);
      return ca.textContent.localeCompare(cb.textContent, undefined, { numeric: true });
    }

    headers.forEach((th, col) => {
      th.addEventListener("click", () => {
        const dir = th.classList.contains("asc") ? -1 : 1;
        headers.forEach((h) => h.classList.remove("asc", "desc"));
        th.classList.add(dir === 1 ? "asc" : "desc");
        rows.sort((a, b) => dir * compare(a, b, col));
        tbody.append(...rows);
      });
    });

    function updateFilter() {
      const q = filter.value.trim().toLowerCase();
      let shown = 0;
      for (const row of rows) {
        row._t ??= row.textContent.toLowerCase();
        row.hidden = q !== "" && !row._t.includes(q);
        if (!row.hidden) shown++;
      }
      count.textContent = `${shown} / ${rows.length} rows`;
    }
    filter.addEventListener("input", updateFilter);
    updateFilter();
  }

  function initIndex() {
    const files = Array.from(document.querySelectorAll("details.file"));
    filter.addEventListener("input", () => {
      const q = filter.value.trim().toLowerCase();
      for (const file of files) {
        const items = Array.from(file.querySelectorAll("li"));
        const fileHit = q === "" || file.dataset.name.includes(q);
        let any = false;
        for (const li of items) {
          const hit = fileHit || li.textContent.toLowerCase().includes(q);
          li.hidden = !hit;
          any ||= hit;
        }
        file.hidden = !any;
        file.open = q !== "" && any;
      }
    });
  }

  if (table) initTable(); else initIndex();
})();
