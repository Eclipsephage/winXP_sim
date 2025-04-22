export function initCalendar(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  const calendarContainer = document.createElement('div');
  calendarContainer.style.padding = '10px';
  calendarContainer.style.fontFamily = 'Tahoma, sans-serif';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '10px';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '<';
  prevBtn.style.padding = '5px 10px';
  const nextBtn = document.createElement('button');
  nextBtn.textContent = '>';
  nextBtn.style.padding = '5px 10px';
  const title = document.createElement('span');
  title.style.fontWeight = 'bold';
  title.style.flexGrow = '1';
  title.style.textAlign = 'center';

  header.appendChild(prevBtn);
  header.appendChild(title);
  header.appendChild(nextBtn);
  calendarContainer.appendChild(header);

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.tableLayout = 'fixed';

  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const headerRow = document.createElement('tr');
  weekdays.forEach(day => {
    const th = document.createElement('th');
    th.textContent = day;
    th.style.border = '1px solid #ddd';
    th.style.padding = '5px';
    th.style.backgroundColor = '#f0f0f0';
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  calendarContainer.appendChild(table);

  let innerContainer = win.querySelector('.window-content-inner');
  if (!innerContainer) {
    innerContainer = document.createElement('div');
    innerContainer.className = 'window-content-inner';
    contentArea.innerHTML = '';
    contentArea.appendChild(innerContainer);
  }
  innerContainer.innerHTML = '';
  innerContainer.appendChild(calendarContainer);

  let currentDate = new Date();

  function renderCalendar(date) {
    title.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    while (table.rows.length > 1) {
      table.deleteRow(1);
    }
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const startingDay = firstDay.getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    let dateNum = 1;

    for (let i = 0; i < 6; i++) {
      const row = table.insertRow();
      for (let j = 0; j < 7; j++) {
        const cell = row.insertCell();
        cell.style.border = '1px solid #ddd';
        cell.style.padding = '5px';
        cell.style.textAlign = 'center';
        cell.style.cursor = 'default';
        if (i === 0 && j < startingDay) {
          cell.textContent = '';
        } else if (dateNum > daysInMonth) {
          cell.textContent = '';
        } else {
          cell.textContent = dateNum;
          const today = new Date();
          if (
            dateNum === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          ) {
            cell.style.backgroundColor = '#a8d5e2';
            cell.style.fontWeight = 'bold';
          }
          dateNum++;
        }
      }
    }
  }

  renderCalendar(currentDate);

  prevBtn.addEventListener('click', () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    renderCalendar(currentDate);
  });

  nextBtn.addEventListener('click', () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    renderCalendar(currentDate);
  });
}