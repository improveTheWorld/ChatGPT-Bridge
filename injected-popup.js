// # File: injected-popup.js
// # Software: ChatGPT-Bridge
// # Purpose: Provide third-party software with the capability to utilize ChatGPT.
// #
// # Copyright 2023 Tec-Net
// #
// # Dual License Notice
// #
// # For Free Software Projects:
// # This software is licensed under the Apache License, Version 2.0 (the "License");
// # you may not use this file except in compliance with the License.
// # You may obtain a copy of the License at
// #
// #     http://www.apache.org/licenses/LICENSE-2.0
// #
// # For Non-Free Software Projects:
// # This software requires a commercial license. Please contact the author at
// # bilelgatri@gmail.com to discuss licensing terms and pricing.
// #
// # Unless required by applicable law or agreed to in writing, software
// # distributed under the License is distributed on an "AS IS" BASIS,
// # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// # See the License for the specific language governing permissions and
// # limitations under the License.

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
    
////////////////////////////////////////////// Drag and drop popup management //////////////////////
    var popupContainer = document.getElementById('popup-container');
    popupContainer.addEventListener('mousedown', dragStart);

    var offsetX, offsetY;

    function dragStart(e) {
      e.preventDefault();
      offsetX = e.clientX - popupContainer.offsetLeft;
      offsetY = e.clientY - popupContainer.offsetTop;
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', dragEnd);
    }

    function drag(e) {
      e.preventDefault();
      popupContainer.style.left = (e.clientX - offsetX) + 'px';
      popupContainer.style.top = (e.clientY - offsetY) + 'px';
    }

    function dragEnd(e) {
      e.preventDefault();
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', dragEnd);
    }

})();
