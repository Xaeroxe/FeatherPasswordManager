var mergeConflicts = [];

document.getElementById('managerPassword1').addEventListener('keyup', function(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    load();
  }
});

document.getElementById('managerPassword2').addEventListener('keyup', function(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    load();
  }
});

function copyPasswords() {
  let nonEmptyPassword = document.getElementById('managerPassword1').value;
  if (nonEmptyPassword === '') {
    nonEmptyPassword = document.getElementById('managerPassword2').value;
  }
  document.getElementById('managerPassword1').value = nonEmptyPassword;
  document.getElementById('managerPassword2').value = nonEmptyPassword;
}

function downloadPasswords() {
  let passwords = {};
  let rows = document.getElementById('passwordOutput').childNodes;
  for(var i = 1; i < rows.length; i++) {
    let row = rows[i];
    let service = row.childNodes[0].childNodes[0].value;
    let password = row.childNodes[1].childNodes[0].value;
    passwords[service] = password;
  }
  let newFile = CryptoJS.AES.encrypt(JSON.stringify(passwords), document.getElementById('managerPassword1').value)
  download(newFile, "passwords.txt", "text/plain")
}

var matches = 0;
var onlyInFile1 = 0;
var onlyInFile2 = 0;
var conflictCount = 0;

function load() {
  matches = 0;
  onlyInFile1 = 0;
  onlyInFile2 = 0;
  conflictCount = 0;
  let fileEntry1 = document.getElementById('passwordFile1').files;
  let managerPassword1 = document.getElementById('managerPassword1').value;
  let fileEntry2 = document.getElementById('passwordFile2').files;
  let managerPassword2 = document.getElementById('managerPassword2').value;
  if(fileEntry1.length === 1 && fileEntry2.length === 1) {
    let reader1 = new FileReader();
    let reader2 = new FileReader();
    var firstLoaded = null;
    mergeConflicts = [];
    let processFile = function(fileNumber, fileInput) {
      if(firstLoaded === null) {
        firstLoaded = fileInput;
      }
      else {
        let isOne = fileNumber === 1;
        let keys = new Set(Object.keys(fileInput));
        let firstLoadedKeys = Object.keys(firstLoaded);
        for(var i = 0; i < firstLoadedKeys.length; i++) {
          keys.add(firstLoadedKeys[i]);
        }
        keys = Array.from(keys.values());
        keys.sort();
        document.getElementById('passwordOutput').textContent = '';
        for(let i = 0; i < keys.length; i++) {
          if(typeof fileInput[keys[i]] === 'undefined') {
            let entry = normalizePasswordEntry(firstLoaded[keys[i]]);
            addPassword(keys[i], entry.password, entry.creationDate || new Date().toISOString());
            if(isOne) {
              onlyInFile2++;
            } else {
              onlyInFile1++;
            }
          }
          else if(typeof firstLoaded[keys[i]] === 'undefined') {
            let entry = normalizePasswordEntry(fileInput[keys[i]]);
            addPassword(keys[i], entry.password, entry.creationDate || new Date().toISOString());
            if(isOne) {
              onlyInFile1++;
            } else {
              onlyInFile2++;
            }
          }
          else {
            let entry = normalizePasswordEntry(fileInput[keys[i]]);
            let firstLoadedEntry = normalizePasswordEntry(firstLoaded[keys[i]]);
            if(entry.password !== firstLoadedEntry.password) {
              mergeConflicts.push({
                service: keys[i],
                entry1: entry,
                entry2: firstLoadedEntry,
              });
              conflictCount++;
            }
            else {
              addPassword(keys[i], entry.password, entry.creationDate);
              matches++;
            }
          }
        }
        setClearTimeout(document.getElementById('fileLifetime').value);
        if(mergeConflicts.length === 0) {
          document.getElementById('file1OnlyCount').innerText = onlyInFile1.toString();
          document.getElementById('file2OnlyCount').innerText = onlyInFile2.toString();
          document.getElementById('matchedCount').innerText = matches.toString();
          document.getElementById('conflictCount').innerText = conflictCount.toString();
          $('.toast-Success').toast('show');
        }
        else {
          promptConflictResolve();
        }
      }
    };
    reader1.onload = function(e) {
      try {
          fileInput = JSON.parse(CryptoJS.AES.decrypt(e.target.result, managerPassword1).toString(CryptoJS.enc.Utf8));
      }
      catch(err) {
        $('.toast-Error-Wrong-Password').toast('show');
      }
      processFile(1, fileInput);
    };
    reader2.onload = function(e) {
      try {
          fileInput = JSON.parse(CryptoJS.AES.decrypt(e.target.result, managerPassword2).toString(CryptoJS.enc.Utf8));
      }
      catch(err) {
        $('.toast-Error-Wrong-Password').toast('show');
      }
      processFile(2, fileInput);
    };
    reader1.readAsText(fileEntry1[0]);
    reader2.readAsText(fileEntry2[0]);
  }
  else {
    alert("Can't proceed without both files.")
  }
}

function promptConflictResolve() {
  if(mergeConflicts.length > 0) {
    document.getElementById('mergeConflictServiceName').innerText = mergeConflicts[0].service;
    let entry1 = mergeConflicts[0].entry1;
    let entry2 = mergeConflicts[0].entry2;
    let prettyPrintDate = function(dateString) {
        if(dateString === null) {
          return 'Creation Date unknown';
        }
        return new Date(dateString).toLocaleString();
    }
    document.getElementById('mergeConflictOption1').innerHTML = jQuery('<div/>').text(entry1.password).html() + "<br>" + jQuery('<div/>').text(prettyPrintDate(entry1.creationDate)).html();
    document.getElementById('mergeConflictOption2').innerHTML = jQuery('<div/>').text(entry2.password).html() + "<br>" + jQuery('<div/>').text(prettyPrintDate(entry2.creationDate)).html();
    document.getElementById('mergeConflictModal').style.display = 'block';
  }
  else {
    document.getElementById('file1OnlyCount').innerText = onlyInFile1.toString();
    document.getElementById('file2OnlyCount').innerText = onlyInFile2.toString();
    document.getElementById('matchedCount').innerText = matches.toString();
    document.getElementById('conflictCount').innerText = conflictCount.toString();
    $('.toast-Success').toast('show');
  }
}

function resolveConflict(option) {
  if(mergeConflicts.length > 0) {
    let conflict = mergeConflicts[0];
    let useOne = option === 1;
    addPassword(conflict.service, useOne ? conflict.entry1.password : conflict.entry2.password, useOne ? conflict.entry1.creationDate : conflict.entry2.creationDate);
    mergeConflicts.shift();
    document.getElementById('mergeConflictModal').style.display = 'none';
    promptConflictResolve();
  }
}

function conflictKeepBoth() {
  if(mergeConflicts.length > 0) {
    let conflict = mergeConflicts[0];
    let intSuffix = 1;
    let newName = conflict.service + " (" + String(intSuffix) + ")";
    while(serviceNameInUse(newName)) {
      intSuffix++;
      newName = conflict.service + " (" + String(intSuffix) + ")";
    }
    addPassword(conflict.service, conflict.entry1.password, conflict.entry1.creationDate);
    addPassword(newName, conflict.entry2.password, conflict.entry2.creationDate);
    mergeConflicts.shift();
    document.getElementById('mergeConflictModal').style.display = 'none';
    promptConflictResolve();
  }
}

function serviceNameInUse(service) {
  let rows = document.getElementById('passwordOutput').childNodes;
  for(var i = 1; i < rows.length; i++) {
    let row = rows[i];
    let oldService = row.childNodes[0].childNodes[0].value;
    if(oldService === service) {
      return true;
    }
  }
  return false;
}
