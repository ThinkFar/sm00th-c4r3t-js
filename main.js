import { position as caretGetPos, offset as caretGetOffset } from "https://cdn.skypack.dev/caret-pos@2.0.0";
try {
  if (caretGetPos) {

    // Custom caret css
    let smoothCaretCss = `
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
        transition-property: transform;
        transition-duration: 0ms;
        transition-timing-function: ease;
        transform: translate(1.7px, 3px);
        animation: smoothCustomCaretElBlink 1s 800ms ease infinite;
      }`;
    document.head.insertAdjacentHTML("beforeend", '<style>' + smoothCaretCss + '</style>');

    let caretAnimationTime = 120; // ms - edit recommended if needed
    let caretAnimationTimeMinimum = 1; // ms - edit optional / 1ms is the default minimum

    // Calculate delay times
    let caretAnimationTimeMinimumResult = caretAnimationTimeMinimum;
    let caretAnimationTimeMid = caretAnimationTime - caretAnimationTimeMinimum;
    // Always make sure that the delays are increasing and not starting slower than caret animation time
    if (caretAnimationTime < caretAnimationTimeMinimum) {
      caretAnimationTimeMinimumResult = caretAnimationTime;
      caretAnimationTimeMid = caretAnimationTimeMinimum - caretAnimationTimeMinimumResult;
    }
    let caretAnimationTimeExtensionCalc = Math.round(caretAnimationTime * 0.5); // caretAnimationTime times 1.5 to index after animation time

    // Create caret element and append to body
    let smoothCaret = document.createElement("div");
    smoothCaret.id = "smoothCustomCaretEl";
    document.body.appendChild(smoothCaret);

    let inputElements = document.querySelectorAll('input, textarea, [contenteditable="true"]');

    let caretPosRerunNr = 0; // Part of fix of occasional inacurate coordinates
    let caretPosRerunPreviousInputEl = false; // Part of fix of occasional inacurate coordinates

    // Caret Position
    function caretPos(el) { if (el) {

      // Check if focused input element for input element coordinates is up to date and accurate (example use: if input is switched via tab key)
      caretPosRerunPreviousInputEl = el;
      let caretPositionObject = caretGetPos(caretPosRerunPreviousInputEl);

      // Get input element coordinates
      let rect = caretPosRerunPreviousInputEl.getBoundingClientRect();
      let x = rect.left;
      let y = rect.top;

      let elFontSize = window.getComputedStyle(caretPosRerunPreviousInputEl = el, null).getPropertyValue('font-size');

      // Apply correct dimensions and dynamic position
      smoothCaret.style.top = caretPositionObject.top + y + 'px';
      smoothCaret.style.left = caretPositionObject.left + x + 'px';
      smoothCaret.style.height = elFontSize;
      let smoothCaretWidth = parseFloat(elFontSize) / 8; smoothCaretWidth = parseFloat(smoothCaretWidth).toFixed(2) + 'px';
      if (parseFloat(smoothCaretWidth) <= 2.50) {
        smoothCaret.style.width = '';
      } else {
        smoothCaret.style.width = smoothCaretWidth;
      }

      // Fix occasional inacurate coordinates (rerun caretPos function)
      if (caretPosRerunNr == 0) {
        caretPosRerunNr = 1;
        caretPos(caretPosRerunPreviousInputEl);
        setTimeout(function() {
          if (caretPosRerunNr == 1) {
            caretPos(caretPosRerunPreviousInputEl);
            caretPosRerunNr = 2;
            setTimeout(function() {
              if (caretPosRerunNr == 2) {
                caretPos(caretPosRerunPreviousInputEl);
                caretPosRerunNr = 3;
                setTimeout(function() {
                  if (caretPosRerunNr == 3) {
                    caretPos(caretPosRerunPreviousInputEl);
                    caretPosRerunNr = 0;
                  }
                }, caretAnimationTimeExtensionCalc);
              }
            }, caretAnimationTimeMid);
          }
        }, caretAnimationTimeMinimumResult);
      }

    }}

    ["click", "touchstart", "selectstart", "select", "cut", "paste"].forEach(function (evt) {
      inputElements.forEach(function (n) {
        n.addEventListener(evt, function (e) {
          caretPos(e.target);
        });
      });
    });

    keyboardJS.bind("", (e) => {
      caretPos(e.target);
    });


    // Caret display/visibility operator and caret position fixer reset
    inputElements.forEach(function (n) {
      ["focus", "blur"].forEach(function (evt) {
        n.addEventListener(evt, function (e) {
          if (e.type == 'focus') {
            caretPos(n);
            smoothCaret.style.display = 'block';
            smoothCaret.style.transitionDuration = caretAnimationTime + 'ms';
            smoothCaret.style.animation = '';
          } else if (e.type == 'blur') {
            smoothCaret.style.display = 'none';
            smoothCaret.style.transitionDuration = '0ms';
            smoothCaret.style.animation = '0s ease 0s 1 normal none running none';
            caretPosRerunNr = 0;
          }
        });
      });
    });

  }
}
catch(err) {
  console.log(err);
}
