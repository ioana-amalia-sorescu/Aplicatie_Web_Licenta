import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

let root = null;
let showed = false;

window.onload = () => {
  var body = document.querySelector('body');
  body.innerHTML = '';
  body.innerHTML = `
    <main>

    </main>
    <div class="calendar">
    </div>
  `;
  sessionStorage.setItem('loggedIn', 'false');

  root = createRoot(document.querySelector('main'));

  Auth.loginPage();
}

window.addEventListener('beforeunload', () => {
  sessionStorage.clear();
});

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 'c') {
    event.preventDefault();

    if (showed == false) {
      Dashboard.showCalendar();
    }
    else {
      Dashboard.closeCalendar();
    }
  }
});

reportWebVitals();

class Auth {
  static AuthPageContent = () => {
    return (
      <div className="page">
        <div className='form'>
          <span>Intra in cont</span>

          <label>Email</label>
          <input type='text' id='email' />

          <label>Parola</label>
          <input type='password' id='password' />

          <span id="err" style={{ color: 'red' }}>
            {/* Error message goes here */}
          </span>

          <button
            className='button'
            type='button'
            onClick={Auth.login}
          >
            Intra in cont
          </button>
        </div>
      </div>
    );
  }

  static async loginPage() {
    root.render(<Auth.AuthPageContent />);
  }

  static async login() {
    var email = document.querySelector('#email').value;
    var password = document.querySelector('#password').value;
    var err = document.querySelector('#err');

    var response = await fetch('http://localhost:8000/api/users/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    var data = await response.json();

    if (data.loggedIn == true) {
      sessionStorage.setItem('loggedIn', 'true');
      var token = data.token;
      var decodedToken = JSON.parse(atob(token.split('.')[1]));

      sessionStorage.setItem('id', decodedToken.id);
      Dashboard.dashboard();
    }
    else {
      err.innerHTML = "Date de logare invalide";
    }
  }
}

class Dashboard {
  static DashboardContent = () => {
    return (
      <div className="page">
        <div className='row' style={{ marginTop: '3rem' }}>
          <span style={{ fontSize: '1.5rem', color: 'var(--color)' }}>Alege sala:</span>
          <select onChange={function (event) {
            Dashboard.displayRoom(event);
            Dashboard.displayInfo(event);
          }

          } id="room">
            <option value='N/A'>Alege sala</option>
          </select>
        </div>

        <div>
          <div className='room'></div>
        </div>
        <div className="room-info" style={{ marginBottom: '3rem' }}>

        </div>

      </div>
    );
  }

  static async dashboard() {
    root.render(<Dashboard.DashboardContent />);

    var response = await fetch('http://localhost:8000/api/rooms/getRooms', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    var data = await response.json();

    var room = document.querySelector('#room');

    data.forEach((r) => {
      var option = document.createElement('option');
      option.value = r.id;
      option.innerHTML = r.name;
      room.appendChild(option);
    });
  }

  static async displayRoom(e) {
    var id = e.target.value;
    var room = document.querySelector('.room');

    if (id == 'N/A') {
      return;
    }

    var response = await fetch(`http://localhost:8000/api/rooms/getRoom?id=` + id, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    var data = await response.json();

    room.innerHTML = '';

    data = data.form;

    data = JSON.parse(data);

    var row = document.createElement('div');
    row.className = 'row';
    row.style.width = '100%';
    row.style.justifyContent = 'center';
    row.style.marginBottom = '2rem';
    room.appendChild(row);

    var catedra = document.createElement('div');
    catedra.className = 'catedra';
    row.appendChild(catedra);

    data.forEach((r) => {
      var row = document.createElement('div');
      row.className = 'row';
      room.appendChild(row);

      r.forEach((c) => {
        var chair = document.createElement('div');
        if (c == -1)
          chair.className = 'invisible-chair';
        else
          chair.className = 'chair';
        row.appendChild(chair);
      });

    });
  }

  static async displayInfo(e) {
    var id = e.target.value;

    var roomInfo = document.querySelector('.room-info');

    if (id == 'N/A') {
      return;
    }

    var response = await fetch(`http://localhost:8000/api/rooms/getRoom?id=` + id, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    var roomData = await response.json();

    roomInfo.innerHTML = '';

    //Informatii camera
    {
      var col = document.createElement('div');
      col.className = 'column';
      col.style.justifyContent = 'space-between';
      roomInfo.appendChild(col);

      var span = document.createElement('span');
      span.innerHTML = 'Detalii sala';
      span.style.fontWeight = 'bold';
      span.style.color = 'var(--color)';
      span.style.fontSize = '1.5rem';
      col.appendChild(span);

      var row = document.createElement('div');
      row.className = 'row';
      col.appendChild(row);

      var span = document.createElement('span');
      span.innerHTML = 'Nume: ';
      span.style.fontWeight = 'bold';
      span.style.color = 'gray';
      span.style.fontSize = '1.15rem';
      row.appendChild(span);

      span = document.createElement('span');
      span.innerHTML = roomData.name;
      span.style.color = 'var(--color)';
      span.style.fontSize = '1.15rem';
      span.style.marginLeft = '1rem';
      span.style.fontWeight = 'bold';
      row.appendChild(span);

      row = document.createElement('div');
      row.className = 'row';
      col.appendChild(row);

      span = document.createElement('span');
      span.innerHTML = 'Locuri: ';
      span.style.fontWeight = 'bold';
      span.style.color = 'gray';
      span.style.fontSize = '1.15rem';
      row.appendChild(span);

      span = document.createElement('span');
      span.innerHTML = roomData.seats;
      span.style.color = 'var(--color)';
      span.style.fontSize = '1.15rem';
      span.style.marginLeft = '1rem';
      span.style.fontWeight = 'bold';
      row.appendChild(span);

      var row = document.createElement('div');
      row.className = 'row';
      col.appendChild(row);
    }

    //Simulare repartizare
    {
      var col = document.createElement('div');
      col.className = 'column';
      col.style.marginLeft = '2rem';
      col.style.justifyContent = 'space-between';
      roomInfo.appendChild(col);

      var span = document.createElement('span');
      span.innerHTML = 'Simulare repartizare';
      span.style.fontWeight = 'bold';
      span.style.color = 'var(--color)';
      span.style.fontSize = '1.5rem';
      col.appendChild(span);

      var row = document.createElement('div');
      row.className = 'row';
      row.style.marginTop = '1rem';
      row.style.width = '100%';
      row.style.justifyContent = 'space-between';
      col.appendChild(row);

      var span = document.createElement('span');
      span.innerHTML = 'Studenti: ';
      span.style.fontWeight = 'bold';
      span.style.color = 'gray';
      span.style.fontSize = '1.15rem';
      row.appendChild(span);

      var input = document.createElement('input');
      input.type = 'text';
      input.id = 'students';
      input.style.color = 'var(--color)';
      input.style.fontSize = '1.15rem';
      input.style.marginLeft = '1rem';
      input.style.fontWeight = 'bold';
      row.appendChild(input);

      row = document.createElement('div');
      row.className = 'row';
      row.style.marginTop = '1rem';
      row.style.width = '100%';
      row.style.justifyContent = 'space-between';
      col.appendChild(row);

      var span = document.createElement('span');
      span.innerHTML = 'Locuri libere: ';
      span.style.fontWeight = 'bold';
      span.style.color = 'gray';
      span.style.fontSize = '1.15rem';
      row.appendChild(span);

      var input = document.createElement('input');
      input.type = 'text';
      input.id = 'freeSeats';
      input.style.color = 'var(--color)';
      input.style.fontSize = '1.15rem';
      input.style.marginLeft = '1rem';
      input.style.fontWeight = 'bold';
      row.appendChild(input);

      var row = document.createElement('div');
      row.className = 'row';
      row.style.marginTop = '1rem';
      row.style.width = '100%';
      row.style.justifyContent = 'center';
      col.appendChild(row);

      var button = document.createElement('button');
      button.className = 'button';
      button.innerHTML = 'Simuleaza';
      button.type = 'button';
      button.onclick = function () {
        Dashboard.display(roomData.form);
      }
      row.appendChild(button);
    }

    //Programare examen
    {
      var col = document.createElement('div');
      col.className = 'column';
      col.style.marginLeft = '2rem';
      col.style.justifyContent = 'space-between';
      roomInfo.appendChild(col);

      var span = document.createElement('span');
      span.innerHTML = 'Programare examen';
      span.style.fontWeight = 'bold';
      span.style.color = 'var(--color)';
      span.style.fontSize = '1.5rem';
      col.appendChild(span);

      var row = document.createElement('div');
      row.className = 'row';
      row.style.marginTop = '1rem';
      row.style.width = '100%';
      row.style.justifyContent = 'space-between';
      col.appendChild(row);

      var span = document.createElement('span');
      span.innerHTML = 'Data inceput: ';
      span.style.fontWeight = 'bold';
      span.style.color = 'gray';
      span.style.fontSize = '1.15rem';
      row.appendChild(span);

      var input = document.createElement('input');
      input.type = 'datetime-local';
      input.id = 'start';
      input.style.color = 'var(--color)';
      input.style.fontSize = '1.15rem';
      input.style.marginLeft = '1rem';
      input.style.fontWeight = 'bold';
      row.appendChild(input);

      row = document.createElement('div');
      row.className = 'row';
      row.style.marginTop = '1rem';
      row.style.width = '100%';
      row.style.justifyContent = 'space-between';
      col.appendChild(row);

      var span = document.createElement('span');
      span.innerHTML = 'Data sfarsit: ';
      span.style.fontWeight = 'bold';
      span.style.color = 'gray';
      span.style.fontSize = '1.15rem';
      row.appendChild(span);

      var input = document.createElement('input');
      input.type = 'datetime-local';
      input.id = 'end';
      input.style.color = 'var(--color)';
      input.style.fontSize = '1.15rem';
      input.style.marginLeft = '1rem';
      input.style.fontWeight = 'bold';
      row.appendChild(input);

      var row = document.createElement('div');
      row.className = 'row';
      row.style.marginTop = '1rem';
      row.style.width = '100%';
      row.style.justifyContent = 'space-between';
      col.appendChild(row);

      var span = document.createElement('span');
      span.innerHTML = 'Serie: ';
      span.style.fontWeight = 'bold';
      span.style.color = 'gray';
      span.style.fontSize = '1.15rem';
      row.appendChild(span);

      var response = await fetch('http://localhost:8000/api/students/getSeries', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      var data = await response.json();

      var select = document.createElement('select');
      select.id = 'series';
      select.style.color = 'var(--color)';
      select.style.fontSize = '1.15rem';
      select.style.marginLeft = '1rem';
      select.style.fontWeight = 'bold';
      select.onchange = function () {
        if (select.value != 'N/A') {
          var series = document.querySelector('#series').value;
          var response = fetch('http://localhost:8000/api/students/getGroups?series=' + series, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          response.then((response) => {
            return response.json();
          }).then((data) => {
            var groups = document.querySelector('#groups');
            groups.innerHTML = '';

            data.forEach((r) => {
              var option = document.createElement('option');
              option.value = r;
              option.innerHTML = r;
              option.style.paddingLeft = '1rem';
              option.style.paddingRight = '1rem';
              groups.appendChild(option);
            });
          });
        }
      }
      row.appendChild(select);

      var option = document.createElement('option');
      option.value = 'N/A';
      option.innerHTML = 'Alege serie';
      select.appendChild(option);

      data.forEach((r) => {
        var option = document.createElement('option');
        option.value = r;
        option.innerHTML = r;
        select.appendChild(option);
      });

      row = document.createElement('div');
      row.className = 'row';
      row.style.marginTop = '1rem';
      row.style.width = '100%';
      row.style.justifyContent = 'space-between';
      col.appendChild(row);

      var span = document.createElement('span');
      span.innerHTML = 'Grupe: ';
      span.style.fontWeight = 'bold';
      span.style.color = 'gray';
      span.style.fontSize = '1.15rem';
      row.appendChild(span);

      var select = document.createElement('select');
      select.id = 'groups';
      select.multiple = true;
      select.style.color = 'var(--color)';
      select.style.fontSize = '1.15rem';
      select.style.marginLeft = '1rem';
      select.style.fontWeight = 'bold';
      row.appendChild(select);

      row = document.createElement('div');
      row.className = 'row';
      row.style.marginTop = '1rem';
      row.style.width = '100%';
      row.style.justifyContent = 'space-between';
      col.appendChild(row);

      var span = document.createElement('span');
      span.innerHTML = 'Studenti din grupe separate: ';
      span.style.fontWeight = 'bold';
      span.style.color = 'gray';
      span.style.fontSize = '1.15rem';
      row.appendChild(span);

      var select = document.createElement('select');
      select.id = 'separate';
      select.style.color = 'var(--color)';
      select.style.fontSize = '1.15rem';
      select.style.marginLeft = '1rem';
      select.style.fontWeight = 'bold';
      row.appendChild(select);

      var option = document.createElement('option');
      option.value = 'da';
      option.innerHTML = 'Da';
      select.appendChild(option);

      var option = document.createElement('option');
      option.value = 'nu';
      option.innerHTML = 'Nu';
      select.appendChild(option);

      row = document.createElement('div');
      row.className = 'row';
      row.style.marginTop = '1rem';
      row.style.width = '100%';
      row.style.justifyContent = 'space-between';
      col.appendChild(row);

      var span = document.createElement('span');
      span.innerHTML = 'Durata: ';
      span.style.fontWeight = 'bold';
      span.style.color = 'gray';
      span.style.fontSize = '1.15rem';
      row.appendChild(span);

      var rr = document.createElement('div');
      rr.className = 'row';
      row.appendChild(rr);

      var span = document.createElement('span');
      span.innerHTML = 'HH: ';
      span.style.fontWeight = 'bold';
      span.style.color = 'gray';
      span.style.fontSize = '1.15rem';
      rr.appendChild(span);

      var input = document.createElement('input');
      input.type = 'number';
      input.id = 'hours';
      input.style.color = 'var(--color)';
      input.style.fontSize = '1.15rem';
      input.style.marginLeft = '1rem';
      input.style.fontWeight = 'bold';
      input.style.width = '3rem';
      input.onchange = function () {
        if (this.value > 23) {
          this.value = 23;
        }
        if (this.value < 0) {
          this.value = 0;
        }
      }
      rr.appendChild(input);

      var rr = document.createElement('div');
      rr.className = 'row';
      row.appendChild(rr);

      var span = document.createElement('span');
      span.innerHTML = 'MM: ';
      span.style.fontWeight = 'bold';
      span.style.color = 'gray';
      span.style.fontSize = '1.15rem';
      rr.appendChild(span);

      var input = document.createElement('input');
      input.type = 'number';
      input.id = 'minutes';
      input.style.color = 'var(--color)';
      input.style.fontSize = '1.15rem';
      input.style.marginLeft = '1rem';
      input.style.fontWeight = 'bold';
      input.style.width = '3rem';
      input.onchange = function () {
        if (this.value > 59) {
          this.value = 59;
        }
        if (this.value < 0) {
          this.value = 0;
        }
      }
      rr.appendChild(input);

      row = document.createElement('div');
      row.className = 'row';
      row.style.marginTop = '1rem';
      row.style.width = '100%';
      row.style.justifyContent = 'center';
      col.appendChild(row);

      var span = document.createElement('span');
      span.id = 'err';
      span.style.color = 'red';
      row.appendChild(span);

      var row = document.createElement('div');
      row.className = 'row';
      row.style.marginTop = '1rem';
      row.style.width = '100%';
      row.style.justifyContent = 'space-evenly';
      col.appendChild(row);

      var button = document.createElement('button');
      button.className = 'button';
      button.innerHTML = 'Repartizeaza';
      button.type = 'button';
      button.onclick = function () {
        Dashboard.displayExam();
      }
      row.appendChild(button);

      var button = document.createElement('button');
      button.className = 'button';
      button.innerHTML = 'Programare examen';
      button.type = 'button';
      button.onclick = function () {
        Dashboard.scheduleExam();
      }
      button.style.marginLeft = '1rem';
      button.style.marginRight = '1rem';
      row.appendChild(button);

      var button = document.createElement('button');
      button.className = 'button';
      button.innerHTML = 'Programeaza automat';
      button.type = 'button';
      button.onclick = function () {
        Dashboard.scheduleExamAuto();
      }
      row.appendChild(button);
    }


  }

  static async display(data) {
    var room = document.querySelector('.room');
    room.innerHTML = '';

    var students = document.querySelector('#students').value;
    var freeSeats = document.querySelector('#freeSeats').value;

    if (students == '' || freeSeats == '') {
      alert('Completati studentii si spatiile libere');
      return;
    }

    data = JSON.parse(data);

    var passed = 0;
    var repart = true;

    var row = document.createElement('div');
    row.className = 'row';
    row.style.width = '100%';
    row.style.justifyContent = 'center';
    row.style.marginBottom = '2rem';
    room.appendChild(row);

    var catedra = document.createElement('div');
    catedra.className = 'catedra';
    row.appendChild(catedra);

    data.forEach((r) => {
      var row = document.createElement('div');
      row.className = 'row';
      room.appendChild(row);

      r.forEach((c) => {
        if (students != 0) {

          if (c != -1) {
            if (repart == true) {
              repart = false;
              students--;
              var chair = document.createElement('div');
              chair.className = 'reserved-chair';
              row.appendChild(chair);
            }
            else {
              var chair = document.createElement('div');
              chair.className = 'chair';
              row.appendChild(chair);
              passed++;
            }

            if (passed == freeSeats) {
              repart = true;
              passed = 0;
            }
          }
          else {
            var chair = document.createElement('div');
            chair.className = 'invisible-chair';
            row.appendChild(chair);
            repart = true;
            passed = 0;
          }
        }
        else {
          if (c == -1) {
            var chair = document.createElement('div');
            chair.className = 'invisible-chair';
            row.appendChild(chair);
          }
          else {
            var chair = document.createElement('div');
            chair.className = 'chair';
            row.appendChild(chair);
          }
        }
      });

      repart = true;
      passed = 0;
    });

    if (students != 0) {
      alert('Nu sunt suficiente locuri');
    }
  }

  static async displayExam() {
    var freeSeats = document.querySelector('#freeSeats').value;
    var id = document.querySelector('#room').value;
    var groups = Array.from(document.querySelector('#groups').selectedOptions).map(option => option.value);
    var separate = document.querySelector('#separate').value;
    var series = document.querySelector('#series').value;

    if (freeSeats == '') {
      alert('Completati locurile libere');
      return;
    }

    if (groups.length == 0) {
      alert('Selectati grupele');
      return;
    }

    var response = await fetch('http://localhost:8000/api/rooms/getRoom?id=' + id, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    var data = await response.json();

    var data = data.form;

    data = JSON.parse(data);

    groups = JSON.stringify(groups);

    var dt = {
      groups,
      series,
    };

    var response = await fetch('http://localhost:8000/api/students/getStudents/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dt),
    });

    var students = await response.json();

    var studs = [];

    if (separate == 'da') {
      while (1) {
        var toExit = true;

        students.forEach((x) => {
          if (x.students.length != 0) {
            studs.push(x.students[0]);
            x.students.shift();
          }

          if (x.students.length != 0) {
            toExit = false;
          }
        });

        if (toExit == true) {
          break;
        }
      }
    }
    else {
      students.forEach((x) => {
        x.students.forEach((s) => {
          studs.push(s);
        });
      });
    }

    Dashboard.repartiseStudents(studs, data);

  }

  static async repartiseStudents(students, data) {
    var room = document.querySelector('.room');
    var freeSeats = document.querySelector('#freeSeats').value;

    room.innerHTML = '';

    var passed = 0;
    var repart = true;
    var nr = students.length;

    var row = document.createElement('div');
    row.className = 'row';
    row.style.width = '100%';
    row.style.justifyContent = 'center';
    row.style.marginBottom = '2rem';
    room.appendChild(row);

    var catedra = document.createElement('div');
    catedra.className = 'catedra';
    row.appendChild(catedra);

    var howToRepart = [];

    data.forEach((r) => {
      var row = document.createElement('div');
      row.className = 'row';
      room.appendChild(row);

      var line = []

      r.forEach((c) => {
        if (nr != 0) {

          if (c != -1) {
            if (repart == true) {
              repart = false;
              nr--;

              var chair = document.createElement('div');
              chair.className = 'reserved-chair';
              line.push(students[0].id);
              chair.title = students[0].firstName + ' ' + students[0].lastName + ' ' + students[0].series + students[0].gr;
              students.shift();
              row.appendChild(chair);

            }
            else {
              var chair = document.createElement('div');
              chair.className = 'chair';
              row.appendChild(chair);
              passed++;
              line.push(0);
            }

            if (passed == freeSeats) {
              repart = true;
              passed = 0;
            }
          }
          else {
            var chair = document.createElement('div');
            chair.className = 'invisible-chair';
            row.appendChild(chair);
            repart = true;
            passed = 0;
            line.push(-1);
          }
        }
        else {
          if (c == -1) {
            var chair = document.createElement('div');
            chair.className = 'invisible-chair';
            row.appendChild(chair);
            line.push(-1);
          }
          else {
            var chair = document.createElement('div');
            chair.className = 'chair';
            row.appendChild(chair);
            line.push(0);
          }
        }
      });

      repart = true;
      passed = 0;
      howToRepart.push(line);
    });

    if (nr != 0) {
      alert('Nu sunt suficiente locuri');
      sessionStorage.setItem('howToRepart', '');
    }
    else {
      sessionStorage.setItem('howToRepart', JSON.stringify(howToRepart));
    }
  }

  static async scheduleExam() {
    var start = document.querySelector('#start').value;
    var end = document.querySelector('#end').value;
    var room = document.querySelector('#room').value;

    if (start == '' || end == '') {
      alert('Completati datele');
      return;
    }

    start = Math.floor(new Date(start).getTime() / 1000);
    end = Math.floor(new Date(end).getTime() / 1000);

    if (start >= end) {
      alert('Data de sfarsit trebuie sa fie mai mare decat data de inceput');
      return;
    }

    var howToRepart = JSON.parse(sessionStorage.getItem('howToRepart'));

    if (howToRepart == undefined || howToRepart == null) {
      alert('Repartizati studentii');
      return;
    }

    if (howToRepart == '') {
      alert('Nu sunt suficiente locuri');
      return;
    }

    var response = await fetch('http://localhost:8000/api/reservations/checkInterval/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ start, end, room }),
    });

    var aw = await response.json();

    if (aw.available == false) {
      alert('Intervalul este ocupat');
      return;
    }

    var iduser = sessionStorage.getItem('id');

    var studs = [];

    howToRepart.forEach((r) => {
      r.forEach((c) => {
        if (c != -1 && c != 0) {
          studs.push(c);
        }
      });
    });

    studs = JSON.stringify(studs);

    howToRepart = JSON.stringify(howToRepart);

    var response = await fetch('http://localhost:8000/api/reservations/scheduleExam/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ start, end, room, howToRepart, iduser, studs }),
    });

    var data = await response.json();

    if (data.response == 'done') {
      alert('Examen programat');
    }
    else {
      alert('Eroare');
    }
  }

  static async scheduleExamAuto() {
    var room = document.querySelector('#room').value;
    var hours = document.querySelector('#hours').value;
    var minutes = document.querySelector('#minutes').value;
    var duration = hours * 3600 + minutes * 60;

    if (hours == '' || minutes == '') {
      alert('Completati durata');
      return;
    }

    if (duration == 0) {
      alert('Durata nu poate fi 0');
      return;
    }

    var howToRepart = JSON.parse(sessionStorage.getItem('howToRepart'));

    if (howToRepart == undefined || howToRepart == null) {
      alert('Repartizati studentii');
      return;
    }

    if (howToRepart == '') {
      alert('Nu sunt suficiente locuri');
      return;
    }

    var iduser = sessionStorage.getItem('id');

    var studs = [];

    howToRepart.forEach((r) => {
      r.forEach((c) => {
        if (c != -1 && c != 0) {
          studs.push(c);
        }
      });
    });

    studs = JSON.stringify(studs);

    howToRepart = JSON.stringify(howToRepart);

    var response = await fetch('http://localhost:8000/api/reservations/scheduleExamAuto/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ room, duration, howToRepart, iduser, studs }),
    });

    var data = await response.json();

    if (data.response == 'done') {
      alert('Examen programat incepand cu ' + (new Date(data.start * 1000)).toLocaleString());
    }
    else {
      alert('Eroare');
    }
  }

  static async showCalendar() {
    var room = document.querySelector('#room');

    if (room == null)
      return;

    room = room.value;

    if (room == 'N/A') {
      return;
    }

    showed = true;

    var calendar = document.querySelector('.calendar');
    calendar.innerHTML = '';
    calendar.style.display = 'flex';

    var response = await fetch('http://localhost:8000/api/reservations/getReservations?id=' + room, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    var data = await response.json();

    var today_start = new Date();
    today_start.setHours(0, 0, 0, 0);
    today_start = Math.floor(today_start.getTime() / 1000);

    var cal = document.createElement('div');
    cal.className = 'row cal';
    cal.style.width = '90%';
    calendar.appendChild(cal);
    var index = 0;
    for (var t = today_start; t < today_start + 10 * 24 * 3600; t += 3600 * 24) {
      var date = new Date(t * 1000);
      date = date.getDate().toString().padStart(2, '0') + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getFullYear().toString();


      var column = document.createElement('div');
      column.className = 'column day';
      column.style.flex = '1';
      cal.appendChild(column);





      var span = document.createElement('span');
      span.innerHTML = date;
      span.style.fontWeight = 'bold';
      span.style.color = 'white';
      span.style.fontSize = '1.5rem';
      span.style.marginBottom = '2rem';
      span.style.width = 'calc(100% + 2rem)';
      span.style.backgroundColor = 'var(--color)';
      span.style.paddingTop = '0.5rem';
      span.style.paddingBottom = '0.5rem';
      span.style.textAlign = 'center';
      span.style.boxShadow = '0 0.25rem 0.25rem 0rem gray';
      column.appendChild(span);

      if (index == 0) {
        column.style.borderTopLeftRadius = '1.5rem';
        column.style.borderBottomLeftRadius = '1.5rem';
        span.style.borderTopLeftRadius = '1.5rem';
      }
      else if (index == 9) {
        column.style.borderTopRightRadius = '1.5rem';
        column.style.borderBottomRightRadius = '1.5rem';
        span.style.borderTopRightRadius = '1.5rem';
      }

      index++;
      data.forEach((x) => {
        if (x.start >= t && x.end <= t + 24 * 3600) {
          var exam = document.createElement('div');
          exam.className = 'exam';
          column.appendChild(exam);

          var span = document.createElement('span');
          date = new Date(x.start * 1000);
          span.innerHTML = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
          span.style.fontWeight = 'bold';
          exam.appendChild(span);

          var span = document.createElement('span');
          date = new Date(x.end * 1000);
          span.innerHTML = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
          span.style.fontWeight = 'bold';
          exam.appendChild(span);
        }
      });

    }
  }

  static async closeCalendar() {
    var calendar = document.querySelector('.calendar');
    calendar.innerHTML = '';
    calendar.style.display = 'none';

    showed = false;
  }
}