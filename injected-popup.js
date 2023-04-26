(async () => {

    //let connectionStatus = 'disconnected';
    const startStopButton = document.querySelector('#startButton');
    const topIcon = document.querySelector('#topIcon');
    
    //const logElement = document.querySelector('#log');
    let monitoring = false;
    let connectionStatus = 'disconnected'; 


    function logMessage(message) {
        //logElement.textContent += message + '\n';
        console.log('LOG:' + message);
    }

    function updateButtonState() {
        if (connectionStatus === 'connected') {
            topIcon.innerHTML = '<i id="topIcon" class="fas fa-link "></i> Bridge';
            if (monitoring) {
                startStopButton.innerHTML = '<i class="fas fa-stop"></i> Stop';
            } else {
                startStopButton.innerHTML = '<i class="fas fa-play"></i> Start';
            }
            startStopButton.disabled = false;
        } else {
            topIcon.innerHTML = '<i id="topIcon" class="fas fa-chain-broken "></i> Bridge';
            startStopButton.innerHTML = '<i class="fa fa-spinner fa-spin fa-fw"></i>';
            startStopButton.disabled = true;
        }
    }

    function onNewConnexionStatus(status) {
        if (status != connectionStatus) {
            connectionStatus = status;
            updateButtonState();
        }
    }

    function emitEvent(name, detail = null) {
        const event = new CustomEvent(name, { detail });
        window.dispatchEvent(event);
    }

  

    ////////////////////////////////////// Main  ///////////////////////////////////

    window.addEventListener('disconnected', () => {
        onNewConnexionStatus('disconnected');
    });
    window.addEventListener('connected', () => {
        onNewConnexionStatus('connected');
    });

    startStopButton.addEventListener('click', () => {
        monitoring = !monitoring;
        if (monitoring) {
            emitEvent('startMonitoring');
        }
        else {
            emitEvent('stopMonitoring');
        }
        updateButtonState();
    });



    // Initialize button state
    updateButtonState();

    // Load font-awesome icons
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.0/css/all.min.css';
    document.head.appendChild(link);
})();
