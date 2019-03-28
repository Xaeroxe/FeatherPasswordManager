document.getElementById('managerPassword').addEventListener('keyup', function(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    load();
  }
});

function downloadPasswords() {
  let passwords = {};
  let rows = document.getElementById('passwordOutput').childNodes;
  for(var i = 1; i < rows.length; i++) {
    let row = rows[i];
    let service = row.childNodes[0].childNodes[0].value;
    let password = row.childNodes[1].childNodes[0].value;
    passwords[service] = password;
  }
  let newFile = CryptoJS.AES.encrypt(JSON.stringify(passwords), document.getElementById('managerPassword').value)
  download(newFile, "passwords.txt", "text/plain")
}

function addHeaders() {
  document.getElementById('downloadButton').removeAttribute('hidden');
  document.getElementById('hrHidden').removeAttribute('hidden');
  let passwordOutput = document.getElementById('passwordOutput');
  passwordOutput.textContent = '';
  let headers = document.createElement('tr');
  let serviceHeaderCell = document.createElement('th');
  let passwordHeaderCell = document.createElement('th');
  let copyHeaderCell = document.createElement('th');
  let deleteHeaderCell = document.createElement('th');
  serviceHeaderCell.textContent = 'Service';
  passwordHeaderCell.textContent = 'Password';
  copyHeaderCell.textContent = 'Copy';
  deleteHeaderCell.textContent = 'Remove';
  headers.appendChild(serviceHeaderCell);
  headers.appendChild(passwordHeaderCell);
  headers.appendChild(copyHeaderCell);
  headers.appendChild(deleteHeaderCell);
  passwordOutput.appendChild(headers);
}

function addPassword(service, password) {
  let rows = document.getElementById('passwordOutput').childNodes;
  for(var i = 1; i < rows.length; i++) {
    let row = rows[i];
    let oldService = row.childNodes[0].childNodes[0].value;
    if(oldService === service) {
      if(confirm(service + " already has a password set, press OK to replace the password for it, otherwise press Cancel.")) {
        row.childNodes[1].childNodes[0].value = password;
      }
      return;
    }
  }
  if (document.getElementById('passwordOutput').textContent === '') {
    addHeaders();
  }
  let row = document.createElement('tr');
  let labelCell = document.createElement('td');
  let label = document.createElement('input');
  label.value = service;
  label.type = 'text';
  label.size = 30;
  label.setAttribute('autocomplete', 'off');
  label.className = 'form-control';
  labelCell.appendChild(label);
  row.appendChild(labelCell);
  let passwordCell = document.createElement('td');
  let passwordValue = document.createElement('input');
  passwordValue.value = password;
  passwordValue.type = 'text';
  passwordValue.size = 50;
  passwordValue.setAttribute('autocomplete', 'off');
  passwordCell.appendChild(passwordValue);
  passwordValue.className = 'form-control monospace';
  row.appendChild(passwordCell);
  let copyButtonCell = document.createElement('td');
  let copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'btn btn-outline-primary';
  copyButton.innerHTML = '<img src="img/clipboard.svg" alt="">';
  copyButton.onclick = function() {
    let passField = this.parentElement.parentElement.childNodes[1].childNodes[0];
    passField.focus();
    passField.select();
    document.execCommand('copy');
    $('.toast-copy').toast('show');
  };
  copyButtonCell.appendChild(copyButton);
  row.appendChild(copyButtonCell);
  let deleteButtonCell = document.createElement('td');
  let deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.innerHTML = '<img src="img/x-circle.svg" alt="">';
  deleteButton.className = 'btn btn-outline-danger';
  deleteButton.onclick = function() {
    let deletedRow = this.parentElement.parentElement;
    deletedRow.parentElement.removeChild(deletedRow);
    $('.toast-delete').toast('show');
    if(document.getElementById('passwordOutput').childNodes.length == 1) {
      document.getElementById('passwordOutput').textContent = '';
      document.getElementById('downloadButton').setAttribute('hidden', '');
      downloadButton.className = 'btn btn-outline-success';
    }
  };
  deleteButtonCell.appendChild(deleteButton);
  row.appendChild(deleteButtonCell);
  document.getElementById('passwordOutput').appendChild(row);
}

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
        addPassword(keys[i], fileInput[keys[i]]);
      }
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
  addPassword(document.getElementById('serviceInput').value, document.getElementById('newPasswordOutput').textContent);
  document.getElementById('serviceInput').value = '';
  genPassword();
  $('.toast-save').toast('show');
}
