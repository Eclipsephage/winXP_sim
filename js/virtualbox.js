export function initVirtualBox(win, showNotification) {
  const contentArea = win.querySelector('.window-content') || win.querySelector('.window-body');
  contentArea.innerHTML = "";
  contentArea.style.padding = "20px";
  
  // Create VM selection interface
  const vmListContainer = document.createElement('div');
  vmListContainer.id = 'vm-list-container';
  vmListContainer.style.height = '100%';
  vmListContainer.style.display = 'flex';
  vmListContainer.style.flexDirection = 'column';
  
  // Header
  const header = document.createElement('h2');
  header.textContent = 'Oracle VM VirtualBox Manager';
  header.style.marginTop = '0';
  vmListContainer.appendChild(header);
  
  // Description
  const description = document.createElement('p');
  description.textContent = 'Select a virtual machine to start:';
  vmListContainer.appendChild(description);
  
  // VM list
  const vmListTable = document.createElement('table');
  vmListTable.style.width = '100%';
  vmListTable.style.border = '1px solid #ccc';
  vmListTable.style.borderCollapse = 'collapse';
  
  // Table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.style.backgroundColor = '#f0f0f0';
  
  const headers = ['Name', 'Operating System', 'State'];
  headers.forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    th.style.padding = '8px';
    th.style.textAlign = 'left';
    th.style.borderBottom = '1px solid #ccc';
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  vmListTable.appendChild(thead);
  
  // Table body
  const tbody = document.createElement('tbody');
  
  const virtualMachines = [
    { name: 'Windows XP', os: 'Microsoft Windows XP', state: 'Powered Off', url: 'https://websim.ai/@BookwormKevin/windows-xp-simulator/' },
    { name: 'Windows 96', os: 'Windows 96 Web Edition', state: 'Powered Off', url: 'https://windows96.net/' },
    { name: 'v86', os: 'Various x86 OS', state: 'Powered Off', url: 'https://copy.sh/v86/' }
  ];
  
  virtualMachines.forEach(vm => {
    const row = document.createElement('tr');
    row.style.cursor = 'pointer';
    row.style.borderBottom = '1px solid #eee';
    
    // VM name cell
    const nameCell = document.createElement('td');
    nameCell.textContent = vm.name;
    nameCell.style.padding = '8px';
    
    // OS cell
    const osCell = document.createElement('td');
    osCell.textContent = vm.os;
    osCell.style.padding = '8px';
    
    // State cell
    const stateCell = document.createElement('td');
    stateCell.textContent = vm.state;
    stateCell.style.padding = '8px';
    
    row.appendChild(nameCell);
    row.appendChild(osCell);
    row.appendChild(stateCell);
    
    // Add click event to start the VM
    row.addEventListener('click', () => {
      startVM(vm);
    });
    
    // Highlight on hover
    row.addEventListener('mouseover', () => {
      row.style.backgroundColor = '#e8e8e8';
    });
    
    row.addEventListener('mouseout', () => {
      row.style.backgroundColor = '';
    });
    
    tbody.appendChild(row);
  });
  
  vmListTable.appendChild(tbody);
  vmListContainer.appendChild(vmListTable);
  
  // Buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.style.marginTop = '20px';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '10px';
  
  vmListContainer.appendChild(buttonContainer);
  
  // Add the VM list container to the window
  contentArea.appendChild(vmListContainer);
  
  // Create the iframe container (initially hidden)
  const vmContainer = document.createElement('div');
  vmContainer.id = 'vm-container';
  vmContainer.style.width = '100%';
  vmContainer.style.height = '100%';
  vmContainer.style.display = 'none';
  vmContainer.style.padding = '0';
  contentArea.appendChild(vmContainer);
  
  // Add a back button for returning to VM list
  const backButton = document.createElement('button');
  backButton.textContent = 'Back to VM List';
  backButton.style.position = 'absolute';
  backButton.style.top = '5px';
  backButton.style.left = '5px';
  backButton.style.zIndex = '100';
  backButton.style.display = 'none';
  
  backButton.addEventListener('click', () => {
    vmContainer.innerHTML = '';
    vmContainer.style.display = 'none';
    vmListContainer.style.display = 'flex';
    backButton.style.display = 'none';
  });
  
  contentArea.appendChild(backButton);
  
  // Function to start a VM
  function startVM(vm) {
    showNotification(`Starting ${vm.name}...`);
    
    // Hide the VM list
    vmListContainer.style.display = 'none';
    
    // Clear any padding from content area when showing VM
    contentArea.style.padding = '0';
    
    // Show the VM container
    vmContainer.style.display = 'block';
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = vm.url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    vmContainer.appendChild(iframe);
    
    // Hide back button to prevent covering VM content
    backButton.style.display = 'none';
  }
  
  // Allow selecting a VM by clicking on its row
  tbody.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', () => {
      tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
    });
  });
}