export function initInternetExplorer(win, showNotification) {
  const urlBar = win.querySelector('#url-bar');
  const goBtn = win.querySelector('#go-btn');
  const ieContent = win.querySelector('#ie-content');
  if (!urlBar || !goBtn || !ieContent) {
    console.error('Internet Explorer elements not found');
    return;
  }
  
  // Set the default URL to blank for our custom homepage
  urlBar.value = "about:home";
  
  // Create a custom homepage with links instead of automatically loading Google
  const customHomepage = `
    <html>
    <head>
      <title>Internet Explorer Homepage</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #f0f0f0;
        }
        h1 {
          color: #0078D7;
          text-align: center;
        }
        .favorites {
          width: 80%;
          margin: 20px auto;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .site {
          display: block;
          padding: 10px;
          margin: 10px 0;
          background-color: #e8f0fe;
          border-radius: 3px;
          text-decoration: none;
          color: #0067b8;
        }
        .site:hover {
          background-color: #d0e0fc;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to Internet Explorer</h1>
      <div class="favorites">
        <h2>Favorite Websites</h2>
        <a href="https://web.archive.org/web/20010602041016/http://www.google.com/" class="site">Google (2001)</a>
        <a href="https://websim.ai/@SofaKingSadBoi/newgrounds-flash-time-machine" class="site">Newgrounds Flash Time Machine</a>
      </div>
    </body>
    </html>
  `;
  
  // Set the custom homepage content
  setTimeout(() => {
    ieContent.setAttribute('srcdoc', customHomepage);
  }, 100);
  
  goBtn.addEventListener('click', () => navigateTo(urlBar.value));
  urlBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') navigateTo(urlBar.value);
  });
  
  async function navigateTo(query) {
    let url = query.trim();
    
    // Special case for our custom homepage
    if (url === "about:home") {
      ieContent.setAttribute('srcdoc', customHomepage);
      return;
    }
    
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    urlBar.value = query;
    showNotification(`Connecting to ${query}...`);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.text();
      ieContent.setAttribute('srcdoc', data);
      // Force the iframe to update with a proper scrollbar; reflow needed.
      ieContent.style.overflowY = 'scroll';
    } catch (error) {
      showNotification(`Error loading website: ${error.message}`);
      ieContent.removeAttribute('srcdoc');
      ieContent.src = url;
    }
  }
}