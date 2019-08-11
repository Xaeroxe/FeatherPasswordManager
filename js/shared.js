function addHeaders() {
  document.getElementById('downloadButton').removeAttribute('hidden');
  document.getElementById('hrHidden').removeAttribute('hidden');
  let passwordOutput = document.getElementById('passwordOutput');
  passwordOutput.textContent = '';
  let headers = document.createElement('tr');
  let serviceHeaderCell = document.createElement('th');
  let passwordHeaderCell = document.createElement('th');
  let creationDateHeaderCell = document.createElement('th');
  let copyHeaderCell = document.createElement('th');
  let deleteHeaderCell = document.createElement('th');
  serviceHeaderCell.textContent = 'Service';
  passwordHeaderCell.textContent = 'Password';
  creationDateHeaderCell.setAttribute('hidden', true);
  copyHeaderCell.textContent = 'Copy';
  deleteHeaderCell.textContent = 'Remove';
  headers.appendChild(serviceHeaderCell);
  headers.appendChild(passwordHeaderCell);
  headers.appendChild(creationDateHeaderCell);
  headers.appendChild(copyHeaderCell);
  headers.appendChild(deleteHeaderCell);
  passwordOutput.appendChild(headers);
}

function addPassword(service, password, creationDate) {
  let rows = document.getElementById('passwordOutput').childNodes;
  for(var i = 1; i < rows.length; i++) {
    let row = rows[i];
    let oldService = row.childNodes[0].childNodes[0].value;
    if(oldService === service) {
      if(confirm(service + " already has a password set, press OK to replace the password for it, otherwise press Cancel.")) {
        row.childNodes[1].childNodes[0].value = password;
        row.childNodes[2].childNodes[0].innerText = creationDate;
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
  let creationDateCell = document.createElement('td');
  let creationDateValue = document.createElement('p');
  creationDateValue.innerText = creationDate;
  creationDateCell.setAttribute('hidden', true);
  creationDateCell.appendChild(creationDateValue);
  row.appendChild(creationDateCell);
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

function downloadPasswords() {
  let passwords = {};
  let rows = document.getElementById('passwordOutput').childNodes;
  for(var i = 1; i < rows.length; i++) {
    let row = rows[i];
    let service = row.childNodes[0].childNodes[0].value;
    let password = row.childNodes[1].childNodes[0].value;
    let creationDate = row.childNodes[2].childNodes[0].innerText;
    passwords[service] = {
      password: password,
      creationDate: creationDate
    };
  }
  let newFile = CryptoJS.AES.encrypt(JSON.stringify(passwords), document.getElementById('managerPassword').value)
  download(newFile, "passwords.txt", "text/plain")
}


function normalizePasswordEntry(input) {
  if(typeof input === 'string') {
    // Old format entry
    return {
      password: input,
      creationDate: null,
    };
  }
  else {
    // New format entry
    return input;
  }
}
