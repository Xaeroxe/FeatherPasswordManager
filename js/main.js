document.getElementById('managerPassword').addEventListener('keyup', function(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    load();
  }
});

function load() {
  let fileEntry = document.getElementById('passwordFile').files;
  let managerPassword = document.getElementById('managerPassword').value;
  if(fileEntry.length === 1) {
    let file = fileEntry[0];
    let reader = new FileReader();
    reader.onload = function(e) {
      try {
          fileInput = JSON.parse(CryptoJS.AES.decrypt(e.target.result, managerPassword).toString(CryptoJS.enc.Utf8));
      }
      catch(err) {
        $('.toast-Error-Wrong-Password').toast('show');
      }
      let keys = Object.keys(fileInput);
      keys.sort();
      document.getElementById('passwordOutput').textContent = '';
      for(let i = 0; i < keys.length; i++) {
        let entry = normalizePasswordEntry(fileInput[keys[i]]);
        if(entry.creationDate === null) {
          entry.creationDate = new Date().toISOString();
        }
        addPassword(keys[i], entry.password, entry.creationDate);
      }
      setClearTimeout(document.getElementById('fileLifetime').value);
    };
    reader.readAsText(fileEntry[0]);
  }
  else {
    alert("Can't proceed without file.")
  }
}

function getRandomInt(min, max) {
  let randomBuffer = new Uint32Array(1);
  let crypto = window.crypto || window.msCrypto;
  crypto.getRandomValues(randomBuffer);
  let randomNumber = randomBuffer[0] / (0xffffffff + 1);
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(randomNumber * (max - min + 1)) + min;
}

function genPassword() {
  if(timeoutID !== null) {
      setClearTimeout(document.getElementById('fileLifetime').value);
  }
  let caps = document.getElementById("capsCheckbox").checked;
  let digits = document.getElementById("digitsCheckbox").checked;
  let special = document.getElementById("specialCharactersCheckbox").checked;
  let length = document.getElementById("length").value;
  let charTypes = 1;
  if (caps) {
    charTypes++;
  }
  if(digits) {
    charTypes++;
  }
  if(special) {
    charTypes++;
  }
  let charsRemaining = {
    lower: Math.floor(length / charTypes),
    caps: 0,
    digits: 0,
    special: 0,
  };
  if(caps) {
    charsRemaining.caps = Math.floor(length / charTypes);
  }
  if(digits) {
    charsRemaining.digits = Math.floor(length / charTypes);
  }
  if(special) {
    charsRemaining.special = Math.floor(length / charTypes);
  }
  let password = '';
  let overrideLength = false;
  while (password.length < length) {
    let charType = getRandomInt(1, 4);
    if(!overrideLength && charsRemaining.lower <= 0 && charsRemaining.caps <= 0 && charsRemaining.digits <= 0 && charsRemaining.special <= 0) {
      overrideLength = true;
      charType = 1;
    }
    switch (charType) {
      case 1:
        if(charsRemaining.lower > 0 || overrideLength) {
          charsRemaining.lower--;
          password += String.fromCharCode(getRandomInt(97, 122));
        }
        break;
      case 2:
        if(charsRemaining.caps > 0) {
          charsRemaining.caps--;
          password += String.fromCharCode(getRandomInt(65, 90));
        }
        break;
      case 3:
        if(charsRemaining.digits > 0) {
          charsRemaining.digits--;
          password += String.fromCharCode(getRandomInt(48, 57));
        }
        break;
      case 4:
        if(charsRemaining.special > 0) {
          charsRemaining.special--;
          let code = getRandomInt(1, 19);
          switch (code) {
            case 1:
              code = 33;
              break;
            case 2:
              code = 35;
              break;
            case 3:
              code = 36;
              break;
            case 4:
              code = 37;
              break;
            case 5:
              code = 40;
              break;
            case 6:
              code = 41;
              break;
            case 7:
              code = 42;
              break;
            case 8:
              code = 43;
              break;
            case 9:
              code = 45;
              break;
            case 10:
              code = 60;
              break;
            case 11:
              code = 61;
              break;
            case 12:
              code = 62;
              break;
            case 13:
              code = 63;
              break;
            case 14:
              code = 91;
              break;
            case 15:
              code = 93;
              break;
            case 16:
              code = 95;
              break;
            case 17:
              code = 123;
              break;
            case 18:
              code = 124;
              break;
            case 19:
              code = 125;
              break;
          }
          password += String.fromCharCode(code);
        }
        break;
    }
  }
  document.getElementById('newPasswordOutput').textContent = password;
}

let slider = document.getElementById("length");
let output = document.getElementById("lengthOutput");
output.textContent = slider.value;

let sliderHandler = function() {
  output.textContent = this.value;
  genPassword();
}

slider.oninput = sliderHandler;
slider.addEventListener('change', sliderHandler);

let caps = document.getElementById("capsCheckbox");
let digits = document.getElementById("digitsCheckbox");
let special = document.getElementById("specialCharactersCheckbox");
let saveButton = document.getElementById("saveButton");
caps.onclick = genPassword;
digits.onclick = genPassword;
special.onclick = genPassword;
genPassword();
saveButton.onclick = function() {
  addPassword(document.getElementById('serviceInput').value, document.getElementById('newPasswordOutput').textContent, new Date().toISOString());
  document.getElementById('serviceInput').value = '';
  genPassword();
  $('.toast-save').toast('show');
}
