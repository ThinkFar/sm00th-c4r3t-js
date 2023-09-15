// requestAnimationFrame polyfill - Erik Möller, Paul Irish, and Tino Zijdel
(function(){var lastTime=0;var vendors=["ms","moz","webkit","o"];for(var x=0;x<vendors.length&&!window.requestAnimationFrame;++x){window.requestAnimationFrame=window[vendors[x]+"RequestAnimationFrame"];window.cancelAnimationFrame=window[vendors[x]+"CancelAnimationFrame"]||window[vendors[x]+"CancelRequestAnimationFrame"]}if(!window.requestAnimationFrame)window.requestAnimationFrame=function(callback,element){var currTime=(new Date).getTime();var timeToCall=Math.max(0,16-(currTime-lastTime));var id=window.setTimeout((function(){callback(currTime+timeToCall)}),timeToCall);lastTime=currTime+timeToCall;return id};if(!window.cancelAnimationFrame)window.cancelAnimationFrame=function(id){clearTimeout(id)}})();

import { position as caretGetPos, offset as caretGetOffset } from "https://cdn.skypack.dev/caret-pos@2.0.0";

// -------------------------------------------------

try {
  if (caretGetPos) {

    let caretAnimationTime = 80; // ms - edit recommended if needed
    let smoothCaretAnimationFps = 60; // fps - edit optional (default: 60)

    // Create caret element and append to body
    let smoothCaret = document.createElement("div");
    smoothCaret.id = "smoothCustomCaretEl";
    document.body.appendChild(smoothCaret);
    document.head.insertAdjacentHTML("beforeend", '<style>' + `
      * {
        caret-color: transparent !important;
      }
      @keyframes smoothCustomCaretElBlink {
        0% { 
          opacity: 1;
          transform: scale(1) translate(1px, 3px);
        }
        15% { 
          opacity: .4;
          transform: scale(0.7) translate(1px, 3px);
        }
        30% { 
          opacity: 1; 
          transform: scale(1) translate(1px, 3px);
        }
      }
      #smoothCustomCaretEl {
        display: none;
        position: absolute;
        background: white;
        top: 0;
        left: 0;
        width: 1.5px;
        max-width: 4px;
        min-width: 1.5px;
        height: 16px;
        min-height: 8px;
        border-radius: 999px;
        cursor: text;
        z-index: 2147483647;
        box-shadow: 1px 0 3px rgb(0 0 0 / 70%), -1px 0 0px 1px rgb(0 0 0 / 10%);
        transition-property: transform, top, bottom, right, left;
        transition-duration: 0ms;
        transition-timing-function: ease;
        transform: translate(1.7px, 3px);
        animation: smoothCustomCaretElBlink 1s 800ms ease infinite;
      }` + '</style>');

    let inputElements = document.querySelectorAll('input, textarea, [contenteditable="true"]');

    const smoothCaretAnimationDelay = ms => new Promise(smoothCaretDelayResolve => setTimeout(smoothCaretDelayResolve, ms))
    const waitForSmoothCaretAnimationFrame = () => new Promise(smoothCaretDelayResolve => requestAnimationFrame(smoothCaretDelayResolve))
    let smoothCaretRequestAnimationStatus = false;
    let smoothCaretInputTextSelectionStatus = false;
    let smoothCaretActiveParent;

    // Caret Position
    async function caretPos(el) {

      if (el !== smoothCaretActiveParent) { return; }

      await smoothCaretAnimationDelay(1000/smoothCaretAnimationFps);
      await waitForSmoothCaretAnimationFrame();

      if (!smoothCaretRequestAnimationStatus || smoothCaretInputTextSelectionStatus && smoothCaret.style.display === 'block') { // Hide custom caret if animation status is set to false
        smoothCaret.style.display = 'none';
        smoothCaret.style.transitionDuration = '0ms';
        smoothCaret.style.animation = '0s ease 0s 1 normal none running none !important';
      }

      if (el && smoothCaretRequestAnimationStatus) {

        // Check if focused input element for input element coordinates is up to date and accurate (example use: if input is switched via tab key)
        let caretPositionObject = caretGetPos(el);

        // Get input element coordinates
        let smoothCaretInputElRect = el.getBoundingClientRect();

        let elFontSize = window.getComputedStyle(/*caretPosRerunPreviousInputEl = */el, null).getPropertyValue('font-size');

        // Apply correct dimensions and dynamic position
        smoothCaret.style.top = caretPositionObject.top + smoothCaretInputElRect.top + 'px';
        smoothCaret.style.left = caretPositionObject.left + smoothCaretInputElRect.left + 'px';
        smoothCaret.style.height = elFontSize;
        let smoothCaretWidth = parseFloat(parseFloat(elFontSize) / 8).toFixed(2) + 'px'; 
        if (smoothCaretWidth <= 2.50) {
          smoothCaret.style.width = '';
        } else {
          smoothCaret.style.width = smoothCaretWidth;
        }

        // Show custom caret
        if (smoothCaret.style.display !== 'block' && !smoothCaretInputTextSelectionStatus) {
          smoothCaret.style.display = 'block';
          smoothCaret.style.transitionDuration = caretAnimationTime + 'ms';
          smoothCaret.style.animation = '';
        }

        // Refresh position
        caretPos(el).catch(erb => console.error('Error during animation:', erb));

      } else if (!el) {
        //console.log('No input reference element provided - stop animation.');
        smoothCaretRequestAnimationStatus = false;
      }
    }


    // Caret display/visibility operator and caret position fixer reset
    inputElements.forEach(function (n) {
      ["focus", "blur"].forEach(function (evt) {
        n.addEventListener(evt, function (e) {
          if (e.type == 'focus') {
            smoothCaretRequestAnimationStatus = true;
            smoothCaretActiveParent = e.target;
            caretPos(smoothCaretActiveParent).catch(er => console.error('Error during animation:', er));
          } else if (e.type == 'blur') {
            smoothCaretRequestAnimationStatus = false;
          }
        });
      });
    });

    document.addEventListener('selectionchange', function() {
      const selection = window.getSelection();
      const isSelected = selection && selection.type === 'Range';
      if (isSelected) {
        smoothCaretInputTextSelectionStatus = true;
      } else {
        smoothCaretInputTextSelectionStatus = false;
      }
    });

  }
}
catch(err) {
  console.log(err);
}
