var timeoutID = null;

function setClearTimeout(minutes) {
  if (typeof timeoutID === 'number') {
    clearTimeout(timeoutID);
  }
  timeoutID = setTimeout(function() {
    unload();
  }, minutes * 60000);
}

function addPassword(service, password, creationDate) {
  let rows = document.getElementById('passwordOutput').childNodes;
  for (var i = 0; i < rows.length; i++) {
    let td = rows[i].childNodes[0];
    let oldService = td.childNodes[1].value;
    if (oldService === service) {
      if (confirm(
              service +
              ' already has a password set, press OK to replace the password for it, otherwise press Cancel.')) {
        td.childNodes[2].value = password;
        td.childNodes[3].innerText = creationDate;
      }
      return;
    }
  }
  let row = document.createElement('tr');
  let cell = document.createElement('td');
  cell.appendChild(document.createElement("hr"));
  let label = document.createElement('input');
  label.value = service;
  label.type = 'text';
  label.size = 30;
  label.setAttribute('autocomplete', 'off');
  label.className = 'form-control';
  cell.appendChild(label);
  
  let passwordValue = document.createElement('input');
  passwordValue.value = password;
  passwordValue.type = 'password';
  passwordValue.size = 50;
  passwordValue.setAttribute('autocomplete', 'off');
  cell.appendChild(passwordValue);
  passwordValue.className = 'form-control ubuntu';
  let creationDateValue = document.createElement('p');
  creationDateValue.innerText = creationDate;
  creationDateValue.setAttribute('hidden', true);
  cell.appendChild(creationDateValue);
  let buttons = document.createElement("div");
  buttons.setAttribute("style", "text-align: center;")
  let showButton = document.createElement('button');
  showButton.type = 'button';
  showButton.className = 'btn btn-outline-primary';
  showButton.innerHTML = '<img src="img/eye.svg" alt="Show">';
  showButton.onclick = function() {
    let passField =
        this.parentElement.parentElement.childNodes[2];
    if (passField.type === 'text') {
      passField.type = 'password';
    } else {
      passField.type = 'text';
    }
  };
  buttons.appendChild(showButton);
  let copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'btn btn-outline-primary';
  copyButton.innerHTML = '<img src="img/clipboard.svg" alt="Copy">';
  copyButton.onclick = function() {
    let passField =
        this.parentElement.parentElement.childNodes[2];
    let switched = false;
    if (passField.type === 'password') {
      passField.type = 'text';
      switched = true;
    }
    passField.focus();
    passField.select();
    document.execCommand('copy');
    if (switched) {
      passField.type = 'password';
    }
    $('.toast-copy').toast('show');
  };
  buttons.appendChild(copyButton);
  let deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.innerHTML = '<img src="img/x-circle.svg" alt="Delete">';
  deleteButton.className = 'btn btn-outline-danger';
  deleteButton.onclick = function() {
    let deletedRow = this.parentElement.parentElement.parentElement;
    deletedRow.parentElement.removeChild(deletedRow);
    $('.toast-delete').toast('show');
    if (document.getElementById('passwordOutput').childNodes.length == 0) {
      document.getElementById('passwordOutput').textContent = '';
      document.getElementById('downloadButton').setAttribute('hidden', null);
    }
  };
  buttons.appendChild(deleteButton);
  cell.appendChild(buttons);
  row.appendChild(cell);
  document.getElementById('passwordOutput').appendChild(row);
  document.getElementById("downloadButton").removeAttribute("hidden");
}

function loadPasswordObject(input) {
  document.getElementById('passwordOutput').textContent = '';
  let keys = Object.keys(input);
  keys.sort(function(a, b) {
    return a.localeCompare(b);
  });
  for (let i = 0; i < keys.length; i++) {
    let entry = normalizePasswordEntry(input[keys[i]]);
    if (entry.creationDate === null) {
      entry.creationDate = new Date().toISOString();
    }
    addPassword(keys[i], entry.password, entry.creationDate);
  }
}

function makePasswordObject() {
  let passwords = {};
  let rows = document.getElementById('passwordOutput').childNodes;
  for (var i = 0; i < rows.length; i++) {
    let td = rows[i].childNodes[0];
    let service = td.childNodes[1].value;
    let password = td.childNodes[2].value;
    let creationDate = td.childNodes[3].innerText;
    passwords[service] = {password: password, creationDate: creationDate};
  }
  return passwords;
}

function storePasswordsInSession() {
  let passwords = makePasswordObject();
  sessionStorage.setItem('passwords', JSON.stringify(passwords));
}

function getPasswordsFromSession() {
  return JSON.parse(sessionStorage.getItem('passwords'));
}

function downloadPasswords(masterPassword) {
  let passwords = makePasswordObject();
  let encryptedPayload = sjcl.encrypt(masterPassword, JSON.stringify(passwords))
  let passwordsFile = JSON.stringify({
    FeatherPasswordFileVersion3: encryptedPayload,
  });
  download(passwordsFile, 'passwords.feather', 'text/plain')
}


function normalizePasswordEntry(input) {
  if (typeof input === 'string') {
    // Old format entry
    return {
      password: input,
      creationDate: null,
    };
  } else {
    // New format entry
    return input;
  }
}

function unload() {
  sessionStorage.clear();
  document.location.reload();
}
