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
// # tecnet.paris@gmail.com to discuss licensing terms and pricing.
// #
// # Unless required by applicable law or agreed to in writing, software
// # distributed under the License is distributed on an "AS IS" BASIS,
// # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// # See the License for the specific language governing permissions and
// # limitations under the License.



(async () => {

    /* <div id="popup-container" style="position: fixed; top: 0px; right: 10px; z-index: 9999; background-color: #f5f5f5; padding: 10px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); width: 130px;">
<h2 id="topIcon"><i class="fas fa-chain-broken "></i> Bridge</h2>
    <div style="display: flex; align-items: center;">
        <button id="startButton" style="margin-right: 30px;><i class="fas fa-play"></i></button>
        <h2 id="countDown" "></h2>
    </div>
</div> */


    const startStopButton = document.querySelector('#startButton');
    const topIcon = document.querySelector('#topIcon');
    const countElemnet = document.querySelector('#countDown');
    const timerCountDownElemnet = document.querySelector('#timerCountDown');
    const timerCountDownMessageElemnet = document.querySelector('#countDownMessage');

    let timerCountDownPollId;

    //const logElement = document.querySelector('#log');
    let monitoring = false;
    let connectionStatus = 'connecting';
    let timerCounDownNum = -1;


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
            //startStopButton.disabled = false;
        } else if (connectionStatus === 'connecting') {
            topIcon.innerHTML = '<i id="topIcon" class="fas fa-chain-broken "></i> Bridge';
            startStopButton.innerHTML = '<i class="fa fa-spinner fa-spin fa-fw"></i>';
            //startStopButton.disabled = true;
        } else if (connectionStatus === 'disconnected') {
            topIcon.innerHTML = '<i id="topIcon" class="fas fa-chain-broken "></i> Bridge';
            startStopButton.innerHTML = '<i class="fa fa-toggle-on" aria-hidden="true"></i>';
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

    function formatTime(milliseconds) {
        const hours = Math.floor(milliseconds / 3600000); // 1 hour = 3600000 ms
        const minutes = Math.floor((milliseconds % 3600000) / 60000); // 1 minute = 60000 ms
        return `${hours}h:${minutes}min`;
    }

    function toggleCountdownContainer(visible) {
        const countdownContainer = document.getElementById('countdown-container');
        const popupContainer = document.getElementById('popup-container');


        if (visible) {
            countdownContainer.style.display = 'flex';
            popupContainer.style.width = 215 + 'px';
        } else {
            countdownContainer.style.display = 'none';
            popupContainer.style.width = 140 + 'px'; // Set the new maxWidth value
        }
    }




    function updatetimerCountDownElement() {
        if (timerCounDownNum > 0) {

            toggleCountdownContainer(true);
            timerCountDownElemnet.innerText = formatTime(timerCounDownNum);
            timerCountDownMessageElemnet.innerText = '+1 in ';

        }
        else {
            toggleCountdownContainer(false);
            //timerCountDownElemnet.innerText = '';
            //timerCountDownMessageElemnet.innerText = '';
        }

    }

    ////////////////////////////////////// Main  ///////////////////////////////////

    window.addEventListener('connecting', () => {
        onNewConnexionStatus('connecting');
    });
    window.addEventListener('connected', () => {
        onNewConnexionStatus('connected');
    });
    window.addEventListener('disconnected', () => {
        onNewConnexionStatus('disconnected');
    });

    window.addEventListener('newCountDown', (event) => {

        countElemnet.innerText = event.detail.countDown;
        timerCounDownNum = event.detail.timerCounDown;
        updatetimerCountDownElement();
        if (timerCountDownPollId) {
            clearInterval(timerCountDownPollId);

        }

        timerCountDownPollId = setInterval(() => {
            timerCounDownNum -= 60000;
            updatetimerCountDownElement();

        }, 60000);

    });





    startStopButton.addEventListener('click', () => {
        monitoring = !monitoring;
        if (connectionStatus === 'connected') {
            if (monitoring) {
                emitEvent('startSendingFeedback');
            }
            else {
                emitEvent('stopSendingFeedback');
            }
        }
        else {
            if (connectionStatus === 'connecting') {
                connectionStatus = 'disconnected';
                emitEvent('disconnect');
            }
            else { //disconnected
                connectionStatus = 'connecting';
                emitEvent('connect')
            }
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

    // Prevent the mousedown event from bubbling when clicking on the button
    document.getElementById('startButton').addEventListener('mousedown', function (e) {
        e.stopPropagation();
    }, false);

    // The rest of the code remains the same



    // var popupContainer = document.getElementById('popup-container');
    // popupContainer.addEventListener('mousedown', dragStart);

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

    // injected-popup.js ready

    const popupReadyEvent = new CustomEvent('popupReady');
    document.dispatchEvent(popupReadyEvent);

})();
