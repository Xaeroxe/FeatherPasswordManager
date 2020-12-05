document.getElementById('managerPassword')
    .addEventListener('keyup', function(e) {
      if (e.keyCode === 13) {
        e.preventDefault();
        load();
      }
    });

function load() {
  let fileEntry = document.getElementById('passwordFile').files;
  let managerPassword = document.getElementById('managerPassword').value;
  if (fileEntry.length === 1) {
    let file = fileEntry[0];
    let reader = new FileReader();
    reader.onload = function(e) {
      try {
        let version3Payload =
            JSON.parse(e.target.result).FeatherPasswordFileVersion3;
        try {
          if (version3Payload) {
            fileInput =
                JSON.parse(sjcl.decrypt(managerPassword, version3Payload))
          } else {
            $('.toast-Error-Wrong-Password-Or-File').toast('show');
          }
        } catch (err) {
          $('.toast-Error-Wrong-Password').toast('show');
        }
      } catch (err) {
        try {
          fileInput =
              JSON.parse(CryptoJS.AES.decrypt(e.target.result, managerPassword)
                             .toString(CryptoJS.enc.Utf8));
        } catch (err) {
          $('.toast-Error-Wrong-Password-Or-File').toast('show');
        }
      }
      if (fileInput) {
        let keys = Object.keys(fileInput);
        keys.sort(function(a, b) {
          return a.localeCompare(b);
        });
        document.getElementById("searchInput").value = '';
        document.getElementById('passwordOutput').textContent = '';
        for (let i = 0; i < keys.length; i++) {
          let entry = normalizePasswordEntry(fileInput[keys[i]]);
          if (entry.creationDate === null) {
            entry.creationDate = new Date().toISOString();
          }
          addPassword(keys[i], entry.password, entry.creationDate);
        }
        document.getElementById('passwordCount').innerText =
            keys.length.toString();
        $('.toast-Passwords-Loaded').toast('show');
        setClearTimeout(document.getElementById('fileLifetime').value);
        fileInput = null;
      }
    };
    reader.readAsText(fileEntry[0]);
  } else {
    alert('Can\'t proceed without file.')
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
  if (timeoutID !== null) {
    setClearTimeout(document.getElementById('fileLifetime').value);
  }
  let meets_criteria = false;
  let caps = document.getElementById('capsCheckbox').checked;
  let digits = document.getElementById('digitsCheckbox').checked;
  let special = document.getElementById('specialCharactersCheckbox').checked;
  let length = document.getElementById('length').value;
  let char_type_needed = [true, caps, digits, special];
  let password = '';
  while (!meets_criteria) {
    let char_type_counts = [0, 0, 0, 0];
    password = '';
    while (password.length < length) {
      let charType = getRandomInt(1, 4);
      let new_char = genCharType(charType, char_type_needed);
      if (new_char) {
        password += new_char;
        char_type_counts[charType - 1]++;
      }
    }
    meets_criteria = meetsCriteria(char_type_counts, char_type_needed);
    // It is extremely rare for a password to not meet criteria, but it does
    // happen. If our user is unlucky, we'll just throw the password out and
    // generate a new one.
  }

  document.getElementById('newPasswordOutput').textContent = password;
}

function onSearch() {
  let searchValue = document.getElementById("searchInput").value;
  let rows = document.getElementById('passwordOutput').childNodes;
  let lowerSearch = searchValue.toLowerCase();
  for (var i = 0; i < rows.length; i++) {
    let row = rows[i];
    let td = row.childNodes[0];
    let service = td.childNodes[1].value;
    if (service.toLowerCase().includes(lowerSearch)) {
      row.removeAttribute("hidden");
    } else {
      row.setAttribute("hidden", null);
    }
  }
}

const lowerRange = [97, 122];
const upperRange = [65, 90];
const digitsRange = [48, 57];

function meetsCriteria(characterCounts, characterRequirements) {
  let meets_criteria = true;
  for (let i = 0; i < characterCounts.length; i++) {
    if (characterRequirements[i] && characterCounts[i] <= 0) {
      meets_criteria = false;
      break;
    }
  }
  return meets_criteria;
}

function genCharType(charType, char_type_needed) {
  switch (charType) {
    case 1:
      return String.fromCharCode(getRandomInt(lowerRange[0], lowerRange[1]));
    case 2:
      if (char_type_needed[1]) {
        return String.fromCharCode(getRandomInt(upperRange[0], upperRange[1]));
      }
      break;
    case 3:
      if (char_type_needed[2]) {
        return String.fromCharCode(
            getRandomInt(digitsRange[0], digitsRange[1]));
      }
      break;
    case 4:
      if (char_type_needed[3]) {
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
        return String.fromCharCode(code);
      }
      break;
  }
  return null;
}

let slider = document.getElementById('length');
let output = document.getElementById('lengthOutput');
output.textContent = slider.value;

let sliderHandler =
    function() {
  output.textContent = this.value;
  genPassword();
}

    slider.oninput = sliderHandler;
slider.addEventListener('change', sliderHandler);

let caps = document.getElementById('capsCheckbox');
let digits = document.getElementById('digitsCheckbox');
let special = document.getElementById('specialCharactersCheckbox');
let saveButton = document.getElementById('saveButton');
caps.onclick = genPassword;
digits.onclick = genPassword;
special.onclick = genPassword;
genPassword();
saveButton.onclick = function() {
  addPassword(
      document.getElementById('serviceInput').value,
      document.getElementById('newPasswordOutput').textContent,
      new Date().toISOString());
  document.getElementById('serviceInput').value = '';
  genPassword();
  $('.toast-save').toast('show');
}
